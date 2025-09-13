"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import {
  Settings,
  Calendar,
  Camera,
  Check,
  X,
  Plus,
  Eye,
  Upload,
} from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("pending-images");
  const [pendingImages, setPendingImages] = useState<any[]>([]);
  const [approvedImages, setApprovedImages] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [showEventForm, setShowEventForm] = useState(false);
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

  useEffect(() => {
    if (user && supabase) {
      fetchPendingImages();
      fetchApprovedImages();
      fetchEvents();
    }
  }, [user, supabase]);

  const fetchPendingImages = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("user_images")
        .select(
          `
          *,
          events:event_id (title)
        `
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pending images:", error);
        setPendingImages([]);
      } else {
        setPendingImages(data || []);
      }
    } catch (err) {
      console.error("Error fetching pending images:", err);
      setPendingImages([]);
    }
  };

  const fetchApprovedImages = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("user_images")
        .select(
          `
          *,
          events:event_id (title)
        `
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching approved images:", error);
        setApprovedImages([]);
      } else {
        setApprovedImages(data || []);
      }
    } catch (err) {
      console.error("Error fetching approved images:", err);
      setApprovedImages([]);
    }
  };

  const fetchEvents = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } else {
        setEvents(data || []);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
    }
  };

  const handleImageAction = async (
    imageId: string,
    action: "approved" | "rejected"
  ) => {
    if (!supabase) return;

    setActionLoading(imageId);

    try {
      const { error } = await supabase
        .from("user_images")
        .update({ status: action })
        .eq("id", imageId);

      if (error) {
        console.error("Error updating image status:", error);
        alert("Error updating image status: " + error.message);
      } else {
        setPendingImages((prev) => prev.filter((img) => img.id !== imageId));
        if (action === "approved") {
          await fetchApprovedImages();
        }
        alert(`Image ${action} successfully!`);
      }
    } catch (err) {
      console.error("Error updating image status:", err);
      alert("Error updating image status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!supabase) return;

    if (
      !confirm(
        "Are you sure you want to delete this image? This action cannot be undone."
      )
    ) {
      return;
    }

    setActionLoading(imageId);

    try {
      // Get image data first
      const { data: imageData, error: fetchError } = await supabase
        .from("user_images")
        .select("image_url")
        .eq("id", imageId)
        .single();

      if (fetchError) {
        console.error("Error fetching image data:", fetchError);
        alert("Error fetching image data: " + fetchError.message);
        return;
      }

      // Delete from storage
      const imageUrl = imageData.image_url;
      if (imageUrl) {
        const filePath = imageUrl.split("/").pop();
        if (filePath) {
          await supabase.storage.from("user-images").remove([filePath]);
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("user_images")
        .delete()
        .eq("id", imageId);

      if (dbError) {
        console.error("Error deleting image from database:", dbError);
        alert("Error deleting image: " + dbError.message);
      } else {
        setApprovedImages((prev) => prev.filter((img) => img.id !== imageId));
        alert("Image deleted successfully!");
      }
    } catch (err) {
      console.error("Error deleting image:", err);
      alert("Error deleting image");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!supabase) return;

    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    setActionLoading(eventId);

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) {
        console.error("Error deleting event:", error);
        alert("Error deleting event");
        return;
      }

      // Update state
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      alert("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateEvent = async (updatedEvent: any) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("events")
        .update({
          title: updatedEvent.title,
          description: updatedEvent.description,
          date: updatedEvent.date,
          location: updatedEvent.location,
          image_url: updatedEvent.image_url,
        })
        .eq("id", updatedEvent.id);

      if (error) {
        console.error("Error updating event:", error);
        alert("Error updating event");
        return;
      }

      // Update state
      setEvents((prev) =>
        prev.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );

      setEditingEvent(null);
      setShowEventForm(false);
      alert("Event updated successfully");
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Error updating event");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading admin panel...</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Manage events, review photo submissions, and oversee the
                platform.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Logged in as:{" "}
                <span className="font-medium text-amber-800">admin</span>
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem("admin_authenticated");
                  localStorage.removeItem("admin_username");
                  router.push("/");
                }}
                className="text-sm text-red-600 hover:text-red-800 mt-1"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("pending-images")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "pending-images"
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Camera className="w-5 h-5 inline mr-2" />
                Pending Images ({pendingImages.length})
              </button>
              <button
                onClick={() => setActiveTab("approved-images")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "approved-images"
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Check className="w-5 h-5 inline mr-2" />
                Approved Images ({approvedImages.length})
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "events"
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Calendar className="w-5 h-5 inline mr-2" />
                Events ({events.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Pending Images Tab */}
        {activeTab === "pending-images" && (
          <div className="space-y-6">
            {pendingImages.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingImages.map((image) => (
                  <div
                    key={image.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="aspect-video">
                      <img
                        src={image.image_url || "/placeholder-image.jpg"}
                        alt={image.caption || "Submitted image"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-image.jpg";
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {image.events?.title || "General Submission"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Submitted by {image.user_id || "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {image.created_at
                              ? new Date(image.created_at).toLocaleDateString()
                              : "Unknown Date"}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          Pending
                        </span>
                      </div>

                      {image.caption && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                            &ldquo;{image.caption}&rdquo;
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button
                          onClick={() =>
                            handleImageAction(image.id, "approved")
                          }
                          disabled={actionLoading === image.id}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleImageAction(image.id, "rejected")
                          }
                          disabled={actionLoading === image.id}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Pending Images
                </h3>
                <p className="text-gray-600">
                  All submitted images have been reviewed.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Approved Images Tab */}
        {activeTab === "approved-images" && (
          <div className="space-y-6">
            {approvedImages.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {approvedImages.map((image) => (
                  <div
                    key={image.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="aspect-video">
                      <img
                        src={image.image_url || "/placeholder-image.jpg"}
                        alt={image.caption || "Approved image"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-image.jpg";
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {image.events?.title || "General Submission"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Submitted by {image.user_id || "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {image.created_at
                              ? new Date(image.created_at).toLocaleDateString()
                              : "Unknown Date"}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Approved
                        </span>
                      </div>

                      {image.caption && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                            &ldquo;{image.caption}&rdquo;
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button
                          onClick={() => window.open(image.image_url, "_blank")}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Full Size
                        </button>
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          disabled={actionLoading === image.id}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <Check className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Approved Images
                </h3>
                <p className="text-gray-600">
                  No images have been approved yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Manage Events
              </h2>
              <Link
                href="/admin/create-event"
                className="btn-primary flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Link>
            </div>

            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    {event.image_url && (
                      <div className="aspect-video">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {event.description}
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        {event.date} • {event.location}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={actionLoading === event.id}
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                        >
                          {actionLoading === event.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Events
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first event to get started.
                </p>
                <Link href="/admin/create-event" className="btn-primary">
                  Create Event
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Event Modal */}
      {showEventForm && editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Event</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const updatedEvent = {
                  ...editingEvent,
                  title: formData.get("title") as string,
                  description: formData.get("description") as string,
                  date: formData.get("date") as string,
                  location: formData.get("location") as string,
                  image_url: formData.get("image_url") as string,
                };
                handleUpdateEvent(updatedEvent);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingEvent.title}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingEvent.description}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={editingEvent.date}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingEvent.location}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    defaultValue={editingEvent.image_url || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
                >
                  Update Event
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingEvent(null);
                    setShowEventForm(false);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
