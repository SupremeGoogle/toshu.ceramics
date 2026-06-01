"use client";

import React from "react";
import { useInView } from "framer-motion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
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
  const columns = [0, 1, 2].map((col) =>
    images.filter((_, index) => index % 3 === col),
  );

  return (
    <div className="relative flex w-full flex-col items-center justify-center py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {columns.map((column, col) => (
          <div key={col} className="grid content-start gap-4 lg:gap-6">
            {column.map((image, index) => (
              <AnimatedImage
                key={`${image.src}-${index}`}
                alt={image.alt}
                src={image.src}
                ratio={image.ratio ?? (index % 2 === 0 ? 4 / 5 : 1)}
                placeholder={image.placeholder}
              />
            ))}
          </div>
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
  ratio: number;
}

function AnimatedImage({
  alt,
  src,
  ratio,
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
    <AspectRatio
      ref={ref}
      ratio={ratio}
      className={cn(
        "relative size-full overflow-hidden rounded-[22px] border bg-accent shadow-soft",
        className,
      )}
    >
      <img
        alt={alt}
        src={imgSrc}
        className={cn(
          "size-full object-cover opacity-0 blur-sm transition duration-1000 ease-out",
          {
            "opacity-100 blur-0": isInView && !isLoading,
          },
        )}
        onLoad={() => setIsLoading(false)}
        loading="lazy"
        decoding="async"
        onError={handleError}
      />
    </AspectRatio>
  );
}
