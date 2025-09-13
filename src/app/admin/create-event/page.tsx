"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import {
  ArrowLeft,
  Upload,
  X,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
}

export default function CreateEventPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createBrowserClient
  > | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [useImageUpload, setUseImageUpload] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
  });

  const router = useRouter();

  useEffect(() => {
    const supabaseClient = createBrowserClient();
    setSupabase(supabaseClient);

    const checkAuth = () => {
      const isAdminAuthenticated = localStorage.getItem("admin_authenticated");
      if (isAdminAuthenticated !== "true") {
        router.push("/admin/login");
        return;
      }

      // Admin profile should be created via SQL script
      setUser({
        id: "00000000-0000-0000-0000-000000000000",
        email: "admin@ershoevents.com",
      });
      setLoading(false);
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!supabase) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      // Try different bucket names in case user-images doesn't exist
      const bucketName = "user-images";
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      // If user-images bucket doesn't exist, try a different approach
      if (error && error.message.includes("Bucket not found")) {
        console.log(
          "user-images bucket not found, trying to create or use alternative..."
        );
        // For now, we'll just return null and let the user use URL instead
        alert(
          "Image upload not available. Please use the 'Image URL' option instead, or run the create-storage-bucket.sql script in Supabase SQL Editor."
        );
        return null;
      }

      if (error) {
        console.error("Error uploading image:", error);
        if (error.message.includes("Bucket not found")) {
          alert(
            "Storage bucket not found. Please run the create-storage-bucket.sql script in Supabase SQL Editor first."
          );
        } else {
          alert("Error uploading image: " + error.message);
        }
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("user-images").getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Error uploading image. Please try again.");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setSubmitting(true);

    try {
      let finalImageUrl = "";

      if (useImageUpload && selectedImage) {
        // Upload image file
        const uploadedUrl = await uploadImage(selectedImage);
        if (!uploadedUrl) {
          alert("Error uploading image. Please try again.");
          setSubmitting(false);
          return;
        }
        finalImageUrl = uploadedUrl;
      } else if (!useImageUpload && imageUrl.trim()) {
        // Use provided URL
        finalImageUrl = imageUrl.trim();
      }

      const { error } = await supabase.from("events").insert({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        image_url: finalImageUrl || null,
        created_by: "00000000-0000-0000-0000-000000000000", // Fixed admin UUID
      });

      if (error) {
        console.error("Error creating event:", error);
        alert("Error creating event: " + error.message);
      } else {
        alert("Event created successfully!");
        router.push("/admin");
      }
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Error creating event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Redirecting to login...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-2">
            Add a new event to your platform with details and an image.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter event title"
              />
            </div>

            {/* Event Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter event description"
              />
            </div>

            {/* Date and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Event Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter event location"
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Event Image
              </label>

              {/* Upload Method Toggle */}
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setUseImageUpload(true)}
                  className={`flex items-center px-4 py-2 rounded-md border ${
                    useImageUpload
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={() => setUseImageUpload(false)}
                  className={`flex items-center px-4 py-2 rounded-md border ${
                    !useImageUpload
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image URL
                </button>
              </div>

              {/* Image Upload */}
              {useImageUpload ? (
                <div>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 transition-colors"
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-28 max-w-full object-contain rounded"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload an image
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/admin"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Event"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
