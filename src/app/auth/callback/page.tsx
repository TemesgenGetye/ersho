"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth callback error:", error);
        router.push("/?error=auth_callback_error");
        return;
      }

      if (data.session) {
        // Successfully authenticated, redirect to home
        router.push("/");
      } else {
        // No session, redirect to home
        router.push("/");
      }
    };

    handleAuthCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
