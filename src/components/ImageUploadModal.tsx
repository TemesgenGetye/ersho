"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase";
import { Camera, Upload, X, Check, Calendar, Trash2 } from "lucide-react";
import Link from "next/link";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SelectedImage {
  file: File;
  preview: string;
  id: string;
}

export default function ImageUploadModal({
  isOpen,
  onClose,
}: ImageUploadModalProps) {
  const [events, setEvents] = useState<
    Array<{ id: string; title: string; date: string }>
  >([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createBrowserClient();

  // Debug logging
  useEffect(() => {
    console.log("ImageUploadModal isOpen:", isOpen);
  }, [isOpen]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });
      setEvents(events || []);
    };

    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen, supabase]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (selectedImages.length + imageFiles.length > 2) {
      setError("You can only upload up to 2 images");
      return;
    }

    const newImages: SelectedImage[] = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);
    setError("");
  };

  const removeImage = (id: string) => {
    setSelectedImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("user-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        if (uploadError.message.includes("Bucket not found")) {
          alert(
            "Storage bucket not found. Please run the create-storage-bucket.sql script in Supabase SQL Editor first."
          );
        }
        // Fallback: convert to base64 and store as data URL
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      const { data } = supabase.storage
        .from("user-images")
        .getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      // Fallback: convert to base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedImages.length === 0) {
      setError("Please select at least one image");
      return;
    }

    if (!caption.trim()) {
      setError("Please provide a caption for your images");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in to submit photos");
        return;
      }

      // Upload all images
      const uploadPromises = selectedImages.map((image) =>
        uploadImageToSupabase(image.file)
      );
      const imageUrls = await Promise.all(uploadPromises);

      // First, ensure the user has a profile record
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || "",
          role: "user",
        },
        {
          onConflict: "id",
        }
      );

      if (profileError) {
        console.error("Profile upsert error:", profileError);
        throw new Error(
          `Failed to create/update profile: ${profileError.message}`
        );
      }

      // Insert all images into database
      const insertPromises = imageUrls.map(async (imageUrl) => {
        const { error: insertError } = await supabase
          .from("user_images")
          .insert({
            user_id: user.id,
            event_id: selectedEvent || null,
            image_url: imageUrl,
            caption: caption.trim(),
            status: "pending",
          });

        if (insertError) {
          console.error("Database insert error:", insertError);
          throw new Error(`Failed to save image: ${insertError.message}`);
        }
      });

      await Promise.all(insertPromises);

      setSuccess(true);
      setSelectedImages([]);
      setSelectedEvent("");
      setCaption("");
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Camera className="w-6 h-6 mr-2" />
            Share Your Event Photos
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Photo Submitted Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                Thank you for sharing your photo! Our admin team will review it
                and approve it for the gallery soon.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/dashboard"
                  className="btn-primary text-center"
                  onClick={onClose}
                >
                  View My Photos
                </Link>
                <button onClick={onClose} className="btn-secondary text-center">
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                  <X className="w-5 h-5 mr-2" />
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="event"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Select Event (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="event"
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="input-field pl-10"
                  >
                    <option value="">Choose an event...</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title} -{" "}
                        {new Date(event.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  If your photo is from a specific event, please select it from
                  the list.
                </p>
              </div>

              <div>
                <label
                  htmlFor="caption"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Caption *
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe your photo(s)..."
                  className="input-field"
                  rows={3}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Please provide a brief description of your photo(s).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Images (Max 2) *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-500 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center space-y-2 text-gray-600 hover:text-amber-600 transition-colors"
                  >
                    <Camera className="w-8 h-8" />
                    <span className="text-sm font-medium">
                      Click to select images
                    </span>
                    <span className="text-xs">
                      PNG, JPG, GIF up to 10MB each
                    </span>
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  You can select up to 2 images. {selectedImages.length}/2
                  selected.
                </p>
              </div>

              {selectedImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Images
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={image.preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-amber-800 mb-2">
                  Submission Guidelines
                </h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Photos must be from Ersho Events</li>
                  <li>• Images should be appropriate and family-friendly</li>
                  <li>• All submissions are reviewed before publication</li>
                  <li>• You retain ownership of your photos</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={
                    loading || selectedImages.length === 0 || !caption.trim()
                  }
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Upload className="w-5 h-5 mr-2 animate-spin" />
                      Uploading {selectedImages.length} image
                      {selectedImages.length > 1 ? "s" : ""}...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload {selectedImages.length} Image
                      {selectedImages.length > 1 ? "s" : ""}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary text-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
