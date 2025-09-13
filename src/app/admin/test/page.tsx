"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TestAdminPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const isAdminAuthenticated = localStorage.getItem("admin_authenticated");
      if (isAdminAuthenticated !== "true") {
        router.push("/admin/login");
        return;
      }
      setLoading(false);
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Admin Test Page
        </h1>
        <p className="text-gray-600">
          This is a test admin page. If you can see this, the admin system is
          working.
        </p>
      </div>
    </div>
  );
}
