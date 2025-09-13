"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase";
import { Camera, Heart, Calendar } from "lucide-react";
import Link from "next/link";
import ImageUploadModal from "@/components/ImageUploadModal";
import LikeButton from "@/components/LikeButton";

interface Image {
  id: string;
  image_url: string;
  caption?: string;
  created_at: string;
  user_id: string;
  event_id?: string;
  profiles?: {
    full_name?: string;
  };
  events?: {
    title?: string;
    date?: string;
  };
  like_count?: number;
  is_liked?: boolean;
}

export default function GalleryPage() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();
  }, [supabase]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // First get the images with basic data
        const { data: imagesData } = await supabase
          .from("user_images")
          .select(
            `
            *,
            profiles:user_id (
              full_name
            ),
            events:event_id (
              title,
              date
            )
          `
          )
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (!imagesData) {
          setImages([]);
          return;
        }

        // Get like counts for each image
        const imagesWithLikes = await Promise.all(
          imagesData.map(async (image) => {
            const { count: likeCount } = await supabase
              .from("image_likes")
              .select("*", { count: "exact", head: true })
              .eq("image_id", image.id);

            let isLiked = false;
            if (user) {
              const { data: likeData } = await supabase
                .from("image_likes")
                .select("id")
                .eq("image_id", image.id)
                .eq("user_id", user.id)
                .single();
              isLiked = !!likeData;
            }

            return {
              ...image,
              like_count: likeCount || 0,
              is_liked: isLiked,
            };
          })
        );

        setImages(imagesWithLikes);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [supabase, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Event Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the magical moments captured by our clients. Each photo
            tells a story of celebration, joy, and unforgettable memories
            created at our events.
          </p>
        </div>

        {images && images.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={image.image_url}
                      alt={image.caption || "Event photo"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Like button overlay - always visible */}
                    <div className="absolute top-2 right-2 z-10">
                      <LikeButton
                        imageId={image.id}
                        userId={user?.id}
                        initialLikeCount={image.like_count || 0}
                        initialIsLiked={image.is_liked || false}
                        size="sm"
                        showCount={true}
                      />
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Event title and like button */}
                    {image.events && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-amber-800">
                          {image.events.title}
                        </span>
                      </div>
                    )}

                    {/* Image caption - always visible */}
                    {image.caption && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {image.caption}
                      </p>
                    )}

                    {/* User info and date */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        {image.profiles?.full_name && (
                          <span>by {image.profiles.full_name}</span>
                        )}
                      </div>

                      {image.events && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {image.events.date
                              ? new Date(image.events.date).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-6 h-6 text-amber-800" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {images.length}+
                  </h3>
                  <p className="text-gray-600">Photos Shared</p>
                </div>

                <div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-amber-800" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {new Set(images.map((img) => img.user_id)).size}+
                  </h3>
                  <p className="text-gray-600">Happy Clients</p>
                </div>

                <div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-amber-800" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {
                      new Set(images.map((img) => img.event_id).filter(Boolean))
                        .size
                    }
                    +
                  </h3>
                  <p className="text-gray-600">Events Captured</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Photos Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to share your event memories with us!
            </p>
            <button
              onClick={() => setIsImageUploadModalOpen(true)}
              className="btn-primary"
            >
              Submit Your Photo
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-amber-800 to-amber-900 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Share Your Event Memories</h2>
          <p className="text-amber-100 mb-6 max-w-2xl mx-auto">
            Did you attend one of our events? We&apos;d love to see your photos!
            Share your favorite moments and help us showcase the magic we create
            together.
          </p>
          <button
            onClick={() => setIsImageUploadModalOpen(true)}
            className="bg-white text-amber-800 px-8 py-3 rounded-md hover:bg-amber-50 transition-colors font-medium"
          >
            Submit Your Photo
          </button>
        </div>
      </div>

      <ImageUploadModal
        isOpen={isImageUploadModalOpen}
        onClose={() => setIsImageUploadModalOpen(false)}
      />
    </div>
  );
}
