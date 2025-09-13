"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Camera, Users, Star, ArrowRight } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import LikeButton from "@/components/LikeButton";

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  image_url?: string;
  created_at: string;
}

interface UserImage {
  id: string;
  image_url: string;
  caption?: string;
  created_at: string;
  like_count?: number;
  is_liked?: boolean;
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [images, setImages] = useState<UserImage[]>([]);
  const [loading, setLoading] = useState(true);
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
    const fetchData = async () => {
      try {
        // Fetch recent events (limit to 3)
        const { data: eventsData } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: false })
          .limit(3);

        // Fetch approved images (limit to 6)
        const { data: imagesData } = await supabase
          .from("user_images")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(6);

        setEvents(eventsData || []);

        if (imagesData) {
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
        } else {
          setImages([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, user]);
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 to-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transforming Your Ideas into{" "}
                <span className="text-amber-800">Memorable Events</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                From intimate gatherings to grand celebrations, we create
                extraordinary experiences that leave lasting impressions. Let us
                bring your vision to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/events"
                  className="btn-primary inline-flex items-center justify-center"
                >
                  View Our Events
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/gallery"
                  className="btn-secondary inline-flex items-center justify-center"
                >
                  <Camera className="mr-2 w-5 h-5" />
                  View Gallery
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Elegant event setup"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-amber-800" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">500+ Events</p>
                    <p className="text-sm text-gray-600">
                      Successfully Organized
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Ersho Events?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine creativity, attention to detail, and years of
              experience to deliver exceptional events that exceed your
              expectations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors">
              <div className="w-16 h-16 bg-amber-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Expert Planning
              </h3>
              <p className="text-gray-600">
                Our experienced team handles every detail, from concept to
                execution, ensuring your event runs seamlessly.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors">
              <div className="w-16 h-16 bg-amber-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Memory Capture
              </h3>
              <p className="text-gray-600">
                Share your special moments with us! Upload your photos and let
                others see the magic we create together.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors">
              <div className="w-16 h-16 bg-amber-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Personal Touch
              </h3>
              <p className="text-gray-600">
                Every event is unique. We work closely with you to understand
                your vision and bring it to life with personal touches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Events Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Recent Events
            </h2>
            <p className="text-xl text-gray-600">
              Take a look at some of our recent successful events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading
              ? // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="card animate-pulse">
                    <div className="aspect-video bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-1"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                ))
              : events.length > 0
              ? events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="card hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    {event.image_url ? (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-200 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-amber-800 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-amber-800 font-medium mb-1">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </Link>
                ))
              : // Fallback content when no events
                [
                  {
                    title: "Elegant Wedding Ceremony",
                    date: "December 15, 2024",
                    location: "Grand Ballroom",
                    image:
                      "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=800",
                  },
                  {
                    title: "Corporate Annual Gala",
                    date: "November 28, 2024",
                    location: "Convention Center",
                    image:
                      "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800",
                  },
                  {
                    title: "Birthday Celebration",
                    date: "November 20, 2024",
                    location: "Private Venue",
                    image:
                      "https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=800",
                  },
                ].map((event, index) => (
                  <div
                    key={index}
                    className="card hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      <p className="text-amber-800 font-medium mb-1">
                        {event.date}
                      </p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>
                ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/events" className="btn-primary">
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Event Gallery
            </h2>
            <p className="text-xl text-gray-600">
              Beautiful moments captured from our events
            </p>
          </div>

          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-300 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow group relative"
                >
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
              ))}
            </div>
          ) : (
            // Fallback content when no images
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=400",
                "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400",
                "https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=400",
                "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400",
                "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=400",
                "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400",
              ].map((image, index) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <img
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/gallery" className="btn-primary">
              View Full Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-amber-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Create Your Perfect Event?
          </h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Join our community and share your event memories with us. Upload
            your photos and be part of our success stories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/submit-image"
              className="bg-white text-amber-800 px-8 py-3 rounded-md hover:bg-amber-50 transition-colors font-medium"
            >
              Share Your Photos
            </Link>
            <Link
              href="/events"
              className="border-2 border-white text-white px-8 py-3 rounded-md hover:bg-white hover:text-amber-800 transition-colors font-medium"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
