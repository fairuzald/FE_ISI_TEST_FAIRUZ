"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { forwardRef } from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  initials?: string;
  src?: string;
  alt?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, initials, src, alt, className, ...props }, ref) => {
    const displayInitials =
      initials || (name ? name.substring(0, 2).toUpperCase() : "");

    const getBackgroundColor = (name?: string) => {
      if (!name) return "bg-blue-500";

      const hash = name.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);

      const colors = [
        "bg-blue-500",
        "bg-indigo-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-red-500",
        "bg-orange-500",
        "bg-amber-500",
        "bg-yellow-500",
        "bg-lime-500",
        "bg-green-500",
        "bg-emerald-500",
        "bg-teal-500",
        "bg-cyan-500",
      ];

      const index = Math.abs(hash) % colors.length;
      return colors[index];
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center rounded-full text-white font-medium",
          !src && getBackgroundColor(name),
          className
        )}
        {...props}
      >
        {src ? (
          <Image
            src={src}
            alt={alt || name || "Avatar"}
            className="w-full h-full object-cover rounded-full"
            width={40}
            height={40}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "";
            }}
          />
        ) : (
          <span className="text-center">{displayInitials}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
