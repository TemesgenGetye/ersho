"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import { Camera, Upload, X, Check } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  image_url: string | null;
  created_at: string;
  created_by: string | null;
}

export default function SubmitImagePage() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }
      setUser({
        id: user.id,
        email: user.email || "",
      });
    };

    const getEvents = async () => {
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });
      setEvents(events || []);
    };

    getUser();
    getEvents();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // First, ensure the user has a profile record
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email || "",
          full_name: "",
          role: "user",
        },
        {
          onConflict: "id",
        }
      );

      if (profileError) {
        console.error("Profile upsert error:", profileError);
        setError(`Failed to create/update profile: ${profileError.message}`);
        return;
      }

      const { error } = await supabase.from("user_images").insert({
        user_id: user.id,
        event_id: selectedEvent || null,
        image_url: imageUrl,
        caption: caption,
        status: "pending",
      });

      if (error) {
        console.error("Database insert error:", error);
        setError(error.message);
      } else {
        setSuccess(true);
        setImageUrl("");
        setCaption("");
        setSelectedEvent("");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to submit your event photos.
          </p>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-lg shadow-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Photo Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for sharing your photo! Our admin team will review it and
            approve it for the gallery soon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => setSuccess(false)} className="btn-secondary">
              Submit Another
            </button>
            <Link href="/gallery" className="btn-primary">
              View Gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-amber-800" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Share Your Event Photos
          </h1>
          <p className="text-gray-600">
            Help us showcase the amazing moments from our events by sharing your
            photos. All submissions are reviewed before being added to our
            gallery.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
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
              <select
                id="event"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="input-field"
              >
                <option value="">Choose an event...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} - {new Date(event.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                If your photo is from a specific event, please select it from
                the list.
              </p>
            </div>

            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Image URL *
              </label>
              <input
                type="url"
                id="imageUrl"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="input-field"
                placeholder="https://example.com/your-image.jpg"
              />
              <p className="mt-1 text-sm text-gray-500">
                Please provide a direct link to your image. You can upload to
                services like Imgur, Google Drive, or Dropbox.
              </p>
            </div>

            {imageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Preview
                </label>
                <div className="aspect-video max-w-md mx-auto rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() =>
                      setError(
                        "Invalid image URL. Please check the link and try again."
                      )
                    }
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="caption"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Caption (Optional)
              </label>
              <textarea
                id="caption"
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="textarea-field"
                placeholder="Tell us about this photo..."
                maxLength={500}
              />
              <p className="mt-1 text-sm text-gray-500">
                {caption.length}/500 characters
              </p>
            </div>

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
                disabled={loading || !imageUrl.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Upload className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Submit Photo
                  </>
                )}
              </button>
              <Link href="/gallery" className="btn-secondary text-center">
                View Gallery
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
