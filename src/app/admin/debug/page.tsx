"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase";

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDebug = async () => {
      const supabase = createBrowserClient();
      const debug: any = {};

      try {
        // Test 1: Check if we can connect to Supabase
        debug.supabaseConnection = "Connected";

        // Test 2: Check if admin profile exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", "00000000-0000-0000-0000-000000000000")
          .single();

        debug.adminProfile = {
          exists: !!profile,
          data: profile,
          error: profileError?.message,
        };

        // Test 3: Try to create a test event
        const { data: event, error: eventError } = await supabase
          .from("events")
          .insert({
            title: "Debug Test Event",
            description: "Testing admin profile",
            date: "2024-12-31",
            location: "Debug Location",
            created_by: "00000000-0000-0000-0000-000000000000",
          })
          .select()
          .single();

        debug.eventCreation = {
          success: !!event,
          data: event,
          error: eventError?.message,
        };

        // Test 4: Try to fetch events
        const { data: events, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .limit(5);

        debug.eventsFetch = {
          success: !!events,
          count: events?.length || 0,
          error: eventsError?.message,
        };

        // Test 5: Try to fetch user_images
        const { data: images, error: imagesError } = await supabase
          .from("user_images")
          .select("*")
          .limit(5);

        debug.imagesFetch = {
          success: !!images,
          count: images?.length || 0,
          error: imagesError?.message,
        };

        // Clean up test event
        if (event) {
          await supabase.from("events").delete().eq("id", event.id);
        }
      } catch (error) {
        debug.generalError =
          error instanceof Error ? error.message : String(error);
      }

      setDebugInfo(debug);
      setLoading(false);
    };

    runDebug();
  }, []);

  if (loading) {
    return <div className="p-8">Loading debug info...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Debug Information</h1>

      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Supabase Connection</h2>
          <pre className="text-sm">
            {JSON.stringify(debugInfo.supabaseConnection, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Admin Profile</h2>
          <pre className="text-sm">
            {JSON.stringify(debugInfo.adminProfile, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Event Creation Test</h2>
          <pre className="text-sm">
            {JSON.stringify(debugInfo.eventCreation, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Events Fetch Test</h2>
          <pre className="text-sm">
            {JSON.stringify(debugInfo.eventsFetch, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Images Fetch Test</h2>
          <pre className="text-sm">
            {JSON.stringify(debugInfo.imagesFetch, null, 2)}
          </pre>
        </div>

        {debugInfo.generalError && (
          <div className="bg-red-100 p-4 rounded">
            <h2 className="font-semibold mb-2 text-red-800">General Error</h2>
            <pre className="text-sm text-red-700">{debugInfo.generalError}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
