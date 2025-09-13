"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase";
import { Calendar, MapPin, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  image_url: string | null;
  created_at: string;
  created_by: string | null;
  profiles: {
    full_name: string;
  } | null;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data: eventsData, error } = await supabase
          .from("events")
          .select(
            `
            *,
            profiles:created_by (
              full_name
            )
          `
          )
          .order("date", { ascending: true });

        if (error) {
          console.error("Error fetching events:", error);
        } else {
          setEvents(eventsData || []);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Events</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our upcoming and past events. Each celebration is crafted
            with attention to detail and personalized to create unforgettable
            memories.
          </p>
        </div>

        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="card hover:shadow-lg transition-shadow cursor-pointer group"
              >
                {event.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-amber-800" />
                      <span>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-amber-800" />
                      <span>{event.location}</span>
                    </div>

                    {event.profiles?.full_name && (
                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-2 text-amber-800" />
                        <span>Organized by {event.profiles.full_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          new Date(event.date) > new Date()
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {new Date(event.date) > new Date()
                          ? "Upcoming"
                          : "Past Event"}
                      </span>
                      <span className="text-amber-800 group-hover:text-amber-900 text-sm font-medium">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Events Yet
            </h3>
            <p className="text-gray-600 mb-6">
              We&apos;re working on some amazing events. Check back soon!
            </p>
            <Link href="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-amber-800 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Have an Event Idea?</h2>
          <p className="text-amber-100 mb-6 max-w-2xl mx-auto">
            Let us help you create an unforgettable experience. From planning to
            execution, we handle every detail so you can focus on enjoying your
            special moment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/submit-image"
              className="bg-white text-amber-800 px-6 py-3 rounded-md hover:bg-amber-50 transition-colors font-medium"
            >
              Share Your Photos
            </Link>
            <Link
              href="/gallery"
              className="border-2 border-white text-white px-6 py-3 rounded-md hover:bg-white hover:text-amber-800 transition-colors font-medium"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
