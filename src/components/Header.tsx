"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Menu, X, Camera, LogOut } from "lucide-react";
import AuthModal from "./AuthModal";
import ImageUploadModal from "./ImageUploadModal";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      // Don't fetch profile - we're using simple auth without profiles
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // Don't fetch profile - we're using simple auth without profiles
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="bg-white shadow-sm border-b border-amber-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-amber-800 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Ersho Events
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-amber-800 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/events"
              className="text-gray-700 hover:text-amber-800 transition-colors"
            >
              Events
            </Link>
            <Link
              href="/gallery"
              className="text-gray-700 hover:text-amber-800 transition-colors"
            >
              Gallery
            </Link>
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-amber-800 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    console.log("Opening image upload modal");
                    setIsImageUploadModalOpen(true);
                  }}
                  className="text-gray-700 hover:text-amber-800 transition-colors flex items-center space-x-1"
                >
                  <Camera className="w-4 h-4" />
                  <span>Submit Photo</span>
                </button>
              </>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Hello, {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-amber-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-gray-700 hover:text-amber-800 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-amber-800 text-white px-4 py-2 rounded-md hover:bg-amber-900 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-amber-800 hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-amber-800 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/events"
                className="text-gray-700 hover:text-amber-800 transition-colors"
              >
                Events
              </Link>
              <Link
                href="/gallery"
                className="text-gray-700 hover:text-amber-800 transition-colors"
              >
                Gallery
              </Link>
              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-amber-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      console.log("Opening image upload modal from mobile");
                      setIsImageUploadModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-amber-800 transition-colors flex items-center space-x-1 text-left"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Submit Photo</span>
                  </button>
                </>
              )}
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm text-gray-700">
                      Hello, {user.email}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-1 text-gray-700 hover:text-amber-800 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="text-gray-700 hover:text-amber-800 transition-colors text-left"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="bg-amber-800 text-white px-4 py-2 rounded-md hover:bg-amber-900 transition-colors text-center"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ImageUploadModal
        isOpen={isImageUploadModalOpen}
        onClose={() => setIsImageUploadModalOpen(false)}
      />
    </header>
  );
}
