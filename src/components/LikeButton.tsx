"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";

interface LikeButtonProps {
  imageId: string;
  userId?: string;
  initialLikeCount?: number;
  initialIsLiked?: boolean;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export default function LikeButton({
  imageId,
  userId,
  initialLikeCount = 0,
  initialIsLiked = false,
  size = "md",
  showCount = true,
}: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createBrowserClient();

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleLike = async () => {
    if (!userId || isLoading) {
      console.log("Cannot like: userId =", userId, "isLoading =", isLoading);
      return;
    }

    console.log("Attempting to like image:", imageId, "by user:", userId);
    setIsLoading(true);

    try {
      if (isLiked) {
        // Unlike the image
        console.log("Unliking image...");
        const { error } = await supabase
          .from("image_likes")
          .delete()
          .eq("image_id", imageId)
          .eq("user_id", userId);

        if (error) {
          console.error("Error unliking:", error);
        } else {
          console.log("Successfully unliked");
          setIsLiked(false);
          setLikeCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        // Like the image
        console.log("Liking image...");
        const { error } = await supabase.from("image_likes").insert({
          image_id: imageId,
          user_id: userId,
        });

        if (error) {
          console.error("Error liking:", error);
        } else {
          console.log("Successfully liked");
          setIsLiked(true);
          setLikeCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={!userId || isLoading}
      className={`flex items-center gap-1 transition-all duration-200 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm ${
        userId
          ? "hover:bg-white hover:shadow-md cursor-pointer"
          : "cursor-not-allowed opacity-50"
      } ${isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"}`}
    >
      <Heart
        className={`${sizeClasses[size]} ${
          isLiked ? "fill-current" : ""
        } transition-all duration-200 ${isLoading ? "animate-pulse" : ""}`}
      />
      {showCount && (
        <span className="text-sm font-medium text-gray-600">{likeCount}</span>
      )}
    </button>
  );
}
