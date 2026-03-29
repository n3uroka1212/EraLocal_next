"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
}

export function ImageCarousel({
  images,
  alt = "Image",
  className = "",
}: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className={`relative overflow-hidden rounded-card ${className}`}>
      <div
        className="flex transition-transform duration-300"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} className="relative w-full shrink-0 aspect-square">
            <Image
              src={src}
              alt={`${alt} ${i + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === current
                  ? "bg-white w-4"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
