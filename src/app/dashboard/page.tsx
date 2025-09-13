"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import { Camera, Clock, Check, X, Eye } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
}

interface UserImage {
  id: string;
  user_id: string;
  event_id: string | null;
  image_url: string;
  caption: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profiles?: {
    full_name: string;
  } | null;
  events?: {
    title: string;
  } | null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [pendingImages, setPendingImages] = useState<UserImage[]>([]);
  const [approvedImages, setApprovedImages] = useState<UserImage[]>([]);
  const [loading, setLoading] = useState(true);
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

    getUser();
  }, [supabase, router]);

  useEffect(() => {
    if (user) {
      fetchUserImages();
    }
  }, [user]);

  const fetchUserImages = async () => {
    if (!user) return;

    try {
      // Fetch pending images
      const { data: pendingData, error: pendingError } = await supabase
        .from("user_images")
        .select(
          `
          *,
          events:event_id (
            title
          )
        `
        )
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (pendingError) {
        console.error("Error fetching pending images:", pendingError);
      } else {
        setPendingImages(pendingData || []);
      }

      // Fetch approved images
      const { data: approvedData, error: approvedError } = await supabase
        .from("user_images")
        .select(
          `
          *,
          events:event_id (
            title
          )
        `
        )
        .eq("user_id", user.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (approvedError) {
        console.error("Error fetching approved images:", approvedError);
      } else {
        setApprovedImages(approvedData || []);
      }
    } catch (err) {
      console.error("Error fetching user images:", err);
      setError("Failed to load your images");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "approved":
        return <Check className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your dashboard...</p>
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
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your dashboard.
          </p>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Dashboard
          </h1>
          <p className="text-gray-600">
            View and manage your submitted photos.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Pending Images */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-600" />
              Pending Review ({pendingImages.length})
            </h2>
          </div>

          {pendingImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="aspect-video">
                    <img
                      src={image.image_url}
                      alt={image.caption || "Submitted image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {image.events?.title || "General Submission"}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${getStatusColor(
                          image.status
                        )}`}
                      >
                        {getStatusIcon(image.status)}
                        <span className="ml-1 capitalize">{image.status}</span>
                      </span>
                    </div>
                    {image.caption && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {image.caption}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Submitted{" "}
                      {new Date(image.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Pending Images
              </h3>
              <p className="text-gray-600 mb-6">
                You haven&apos;t submitted any photos yet.
              </p>
              <Link href="/submit-image" className="btn-primary">
                Submit Your First Photo
              </Link>
            </div>
          )}
        </div>

        {/* Approved Images */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Check className="w-5 h-5 mr-2 text-green-600" />
              Approved Photos ({approvedImages.length})
            </h2>
            <Link
              href="/gallery"
              className="text-amber-600 hover:text-amber-800 flex items-center"
            >
              <Eye className="w-4 h-4 mr-1" />
              View in Gallery
            </Link>
          </div>

          {approvedImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="aspect-video">
                    <img
                      src={image.image_url}
                      alt={image.caption || "Approved image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {image.events?.title || "General Submission"}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${getStatusColor(
                          image.status
                        )}`}
                      >
                        {getStatusIcon(image.status)}
                        <span className="ml-1 capitalize">{image.status}</span>
                      </span>
                    </div>
                    {image.caption && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {image.caption}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Approved {new Date(image.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <Check className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Approved Photos Yet
              </h3>
              <p className="text-gray-600">
                Your submitted photos are still under review.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/submit-image" className="btn-primary">
              Submit New Photo
            </Link>
            <Link href="/gallery" className="btn-secondary">
              View Gallery
            </Link>
            <Link href="/events" className="btn-secondary">
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
