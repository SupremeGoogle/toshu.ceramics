"use client";

import React from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  alt: string;
  src: string;
  ratio?: number;
  placeholder?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  return (
    <div className="relative w-full py-8">
      <div className="mx-auto w-full max-w-7xl columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
        {images.map((image, index) => (
          <AnimatedImage
            key={`${image.src}-${index}`}
            alt={image.alt}
            src={image.src}
            placeholder={image.placeholder}
          />
        ))}
      </div>
    </div>
  );
}

interface AnimatedImageProps {
  alt: string;
  src: string;
  className?: string;
  placeholder?: string;
}

function AnimatedImage({
  alt,
  src,
  placeholder,
  className,
}: AnimatedImageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [isLoading, setIsLoading] = React.useState(true);
  const [imgSrc, setImgSrc] = React.useState(src);

  const handleError = () => {
    if (placeholder) {
      setImgSrc(placeholder);
    }
  };

  return (
    <figure
      ref={ref}
      className={cn(
        "relative break-inside-avoid overflow-hidden rounded-[24px] border bg-accent shadow-soft transition duration-500 hover:-translate-y-1",
        className,
      )}
    >
      <img
        alt={alt}
        src={imgSrc}
        className={cn(
          "block h-auto w-full opacity-0 transition duration-500 ease-out",
          {
            "opacity-100": isInView && !isLoading,
          },
        )}
        onLoad={() => setIsLoading(false)}
        loading="lazy"
        decoding="async"
        onError={handleError}
      />
    </figure>
  );
}
