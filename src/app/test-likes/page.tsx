"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase";
import LikeButton from "@/components/LikeButton";

export default function TestLikesPage() {
  const [user, setUser] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      console.log("User:", user);
    };

    getUser();
  }, [supabase]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data: imagesData } = await supabase
          .from("user_images")
          .select("*")
          .eq("status", "approved")
          .limit(3);

        console.log("Images:", imagesData);
        setImages(imagesData || []);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [supabase]);

  const testLikeTable = async () => {
    try {
      console.log("Testing like table...");
      const { data, error } = await supabase
        .from("image_likes")
        .select("*")
        .limit(1);

      if (error) {
        console.error("Like table error:", error);
        alert("Like table doesn't exist or has issues: " + error.message);
      } else {
        console.log("Like table works:", data);
        alert("Like table is working!");
      }
    } catch (err) {
      console.error("Test error:", err);
      alert("Error testing like table: " + err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Likes Page</h1>

      <div className="mb-4">
        <p>User: {user ? user.id : "Not logged in"}</p>
        <button
          onClick={testLikeTable}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Test Like Table
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="border p-4">
            <img
              src={image.image_url}
              alt="Test"
              className="w-full h-32 object-cover mb-2"
            />
            <p className="text-sm mb-2">{image.caption || "No caption"}</p>
            <LikeButton
              imageId={image.id}
              userId={user?.id}
              initialLikeCount={0}
              initialIsLiked={false}
              size="md"
              showCount={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
