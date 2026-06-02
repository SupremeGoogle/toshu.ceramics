import React from "react";
import { cn } from "@/lib/utils";
import { useInView } from "framer-motion";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export interface GalleryImage {
  alt: string;
  src: string;
  ratio?: number;
  placeholder?: string;
}

interface AnimatedImageProps {
  alt: string;
  src: string;
  ratio: number;
  placeholder?: string;
}

function AnimatedImage({ alt, src, ratio, placeholder }: AnimatedImageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const [isLoading, setIsLoading] = React.useState(true);
  const [imgSrc, setImgSrc] = React.useState(src);

  return (
    <AspectRatio
      ref={ref}
      ratio={ratio}
      className="relative size-full overflow-hidden rounded-[24px] border bg-accent"
    >
      <img
        alt={alt}
        src={imgSrc}
        className={cn(
          "size-full object-cover opacity-0 transition-all duration-700 ease-in-out",
          { "opacity-100": isInView && !isLoading },
        )}
        onLoad={() => setIsLoading(false)}
        loading="lazy"
        decoding="async"
        onError={() => {
          if (placeholder) setImgSrc(placeholder);
        }}
      />
    </AspectRatio>
  );
}

export function ImageGallery({ images }: { images: GalleryImage[] }) {
  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
      {images.map((image, index) => (
        <div key={`${image.src}-${index}`} className="break-inside-avoid">
          <AnimatedImage
            src={image.src}
            alt={image.alt}
            ratio={image.ratio ?? 0.75}
            placeholder={image.placeholder}
          />
        </div>
      ))}
    </div>
  );
}
