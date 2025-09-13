"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminAuthModal from "@/components/AdminAuthModal";

export default function AdminLoginPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    const isAuthenticated = localStorage.getItem("admin_authenticated");
    if (isAuthenticated === "true") {
      router.push("/admin");
    } else {
      setIsModalOpen(true);
    }
  }, [router]);

  const handleAuthSuccess = () => {
    router.push("/admin");
  };

  const handleModalClose = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Admin Authentication Required
        </h1>
        <p className="text-gray-600">
          Please authenticate to access the admin dashboard.
        </p>
      </div>

      <AdminAuthModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
