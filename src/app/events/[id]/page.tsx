"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import { Calendar, MapPin, User, ArrowLeft, Clock, Camera } from "lucide-react";
import Link from "next/link";

export default function EventDetailPage() {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!params.id) return;

      try {
        console.log("Fetching event:", params.id);
        const { data: eventData, error: fetchError } = await supabase
          .from("events")
          .select(
            `
            *,
            profiles:created_by (
              full_name,
              email
            )
          `
          )
          .eq("id", params.id)
          .single();

        console.log("Event fetch result:", { eventData, fetchError });

        if (fetchError) {
          setError(fetchError.message);
          console.error("Error fetching event:", fetchError);
        } else {
          setEvent(eventData);
          console.log("Event loaded:", eventData);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Event Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "The event you're looking for doesn't exist."}
            </p>
            <Link
              href="/events"
              className="inline-flex items-center px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/events"
            className="inline-flex items-center text-amber-800 hover:text-amber-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Event Image */}
        {event.image_url && (
          <div className="mb-8">
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Event Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Event Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {event.title}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isUpcoming
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {isUpcoming ? "Upcoming" : "Past Event"}
                </span>
              </div>

              {event.description && (
                <p className="text-lg text-gray-600 leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-amber-800 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date</p>
                    <p className="text-gray-600">
                      {eventDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-amber-800 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Location
                    </p>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>

                {event.profiles?.full_name && (
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-amber-800 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Organized by
                      </p>
                      <p className="text-gray-600">
                        {event.profiles.full_name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-amber-800 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-gray-600">
                      {new Date(event.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center px-6 py-3 bg-amber-800 text-white rounded-md hover:bg-amber-900 transition-colors"
              >
                <Camera className="w-4 h-4 mr-2" />
                View Gallery
              </Link>
              <Link
                href="/submit-image"
                className="inline-flex items-center justify-center px-6 py-3 border border-amber-800 text-amber-800 rounded-md hover:bg-amber-50 transition-colors"
              >
                Share Your Photos
              </Link>
            </div>
          </div>
        </div>

        {/* Related Events */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Other Events
          </h2>
          <Link
            href="/events"
            className="inline-flex items-center text-amber-800 hover:text-amber-900 font-medium"
          >
            View All Events
            <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
