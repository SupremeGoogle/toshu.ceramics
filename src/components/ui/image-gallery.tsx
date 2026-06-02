import React, { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface GalleryImage {
  alt: string;
  src: string;
  ratio?: number;
  placeholder?: string;
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────

interface ThumbProps {
  image: GalleryImage;
  index: number;
  onClick: (index: number) => void;
}

function GalleryThumb({ image, index, onClick }: ThumbProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -4% 0px" });
  const [loaded, setLoaded] = useState(false);

  return (
    <div ref={ref}>
      <motion.button
        type="button"
        onClick={() => onClick(index)}
        className="group block w-full overflow-hidden rounded-2xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
        initial={{ opacity: 0, y: 14 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        aria-label={image.alt}
      >
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            "block w-full object-cover transition-[opacity,transform] duration-500 ease-out",
            "group-hover:scale-[1.03]",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      </motion.button>
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

interface LightboxProps {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  const touchStartX = useRef(0);

  // keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  // scroll lock (iOS-safe)
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 48) {
      if (delta > 0) onPrev(); else onNext();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "hsla(28,24%,8%,0.97)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* counter */}
      <p className="absolute left-5 top-5 font-mono text-[11px] tracking-[0.18em] text-white/40 select-none">
        {String(index + 1).padStart(2, "0")}&thinsp;/&thinsp;{String(images.length).padStart(2, "0")}
      </p>

      {/* close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 grid size-10 place-items-center rounded-full text-white/50 transition hover:text-white"
        aria-label="Закрыть"
      >
        <X size={20} strokeWidth={1.5} />
      </button>

      {/* image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index].src}
          alt={images[index].alt}
          className="max-h-[88dvh] max-w-[88dvw] select-none rounded-2xl object-contain shadow-2xl"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
      </AnimatePresence>

      {/* prev */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-3 top-1/2 -translate-y-1/2 grid size-11 place-items-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/18 hover:text-white sm:left-5"
        aria-label="Предыдущее фото"
      >
        <ChevronLeft size={22} strokeWidth={1.5} />
      </button>

      {/* next */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 grid size-11 place-items-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/18 hover:text-white sm:right-5"
        aria-label="Следующее фото"
      >
        <ChevronRight size={22} strokeWidth={1.5} />
      </button>
    </motion.div>
  );
}

// ─── Mobile gallery (2 col, paginated) ───────────────────────────────────────

const MOBILE_PAGE = 12;

function MobileGallery({
  images,
  onOpen,
}: {
  images: GalleryImage[];
  onOpen: (index: number) => void;
}) {
  const [visible, setVisible] = useState(MOBILE_PAGE);
  const remaining = images.length - visible;

  const left = images.slice(0, visible).filter((_, i) => i % 2 === 0);
  const right = images.slice(0, visible).filter((_, i) => i % 2 !== 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          {left.map((img, i) => (
            <GalleryThumb key={img.src} image={img} index={i * 2} onClick={onOpen} />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {right.map((img, i) => (
            <GalleryThumb key={img.src} image={img} index={i * 2 + 1} onClick={onOpen} />
          ))}
        </div>
      </div>
      {remaining > 0 && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisible((v) => v + MOBILE_PAGE)}
            className="soft-button"
          >
            Ещё {remaining} фото
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Desktop gallery (3-col masonry) ─────────────────────────────────────────

function DesktopGallery({
  images,
  onOpen,
}: {
  images: GalleryImage[];
  onOpen: (index: number) => void;
}) {
  // Distribute into 3 columns keeping original order
  const cols: Array<Array<{ img: GalleryImage; originalIndex: number }>> = [[], [], []];
  images.forEach((img, i) => cols[i % 3].push({ img, originalIndex: i }));

  return (
    <div className="grid grid-cols-3 gap-3">
      {cols.map((col, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-3">
          {col.map(({ img, originalIndex }) => (
            <GalleryThumb
              key={img.src}
              image={img}
              index={originalIndex}
              onClick={onOpen}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── useIsDesktop ─────────────────────────────────────────────────────────────

function useIsDesktop() {
  const [v, setV] = useState(() => typeof window !== "undefined" && window.innerWidth >= 768);
  useEffect(() => {
    const h = () => setV(window.innerWidth >= 768);
    window.addEventListener("resize", h, { passive: true });
    return () => window.removeEventListener("resize", h);
  }, []);
  return v;
}

// ─── Public export ────────────────────────────────────────────────────────────

export function ImageGallery({ images }: { images: GalleryImage[] }) {
  const isDesktop = useIsDesktop();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const open = useCallback((i: number) => setLightboxIndex(i), []);
  const close = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null)),
    [images.length],
  );
  const next = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null)),
    [images.length],
  );

  return (
    <>
      {isDesktop ? (
        <DesktopGallery images={images} onOpen={open} />
      ) : (
        <MobileGallery images={images} onOpen={open} />
      )}

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={images}
            index={lightboxIndex}
            onClose={close}
            onPrev={prev}
            onNext={next}
          />
        )}
      </AnimatePresence>
    </>
  );
}
