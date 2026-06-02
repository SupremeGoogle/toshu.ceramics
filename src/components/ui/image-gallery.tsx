import * as React from "react";
import {
  type HTMLMotionProps,
  type MotionValue,
  type Variants,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  alt: string;
  src: string;
  ratio?: number;
  placeholder?: string;
}

const SPRING_CONFIG = {
  type: "spring" as const,
  stiffness: 100,
  damping: 16,
  mass: 0.75,
  restDelta: 0.005,
  duration: 0.3,
};

const blurVariants: Variants = {
  hidden: { filter: "blur(10px)", opacity: 0 },
  visible: { filter: "blur(0px)", opacity: 1 },
};

interface ContainerScrollContextValue {
  scrollYProgress: MotionValue<number>;
}

const ContainerScrollContext = React.createContext<
  ContainerScrollContextValue | undefined
>(undefined);

function useContainerScrollContext() {
  const context = React.useContext(ContainerScrollContext);
  if (!context) {
    throw new Error(
      "useContainerScrollContext must be used within a ContainerScroll",
    );
  }
  return context;
}

export const ContainerScroll = ({
  children,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef });
  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress }}>
      <div
        ref={scrollRef}
        className={cn("relative min-h-[400vh]", className)}
        style={{
          perspective: "1000px",
          perspectiveOrigin: "center top",
          transformStyle: "preserve-3d",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    </ContainerScrollContext.Provider>
  );
};
ContainerScroll.displayName = "ContainerScroll";

export const ContainerSticky = ({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "sticky top-16 h-[calc(100dvh-4rem)] w-full overflow-hidden",
      className,
    )}
    style={{
      perspective: "1000px",
      perspectiveOrigin: "center top",
      transformStyle: "preserve-3d",
      transformOrigin: "50% 50%",
      ...style,
    }}
    {...props}
  />
);
ContainerSticky.displayName = "ContainerSticky";

export const GalleryContainer = ({
  children,
  className,
  style,
  ...props
}: HTMLMotionProps<"div">) => {
  const { scrollYProgress } = useContainerScrollContext();
  const rotateX = useTransform(scrollYProgress, [0.15, 0.55], [75, 0]);
  const scale = useTransform(scrollYProgress, [0.55, 0.85], [1.1, 1]);

  return (
    <motion.div
      className={cn(
        "relative grid size-full grid-cols-3 gap-2 rounded-2xl",
        className,
      )}
      style={{
        rotateX,
        scale,
        transformStyle: "preserve-3d",
        perspective: "1000px",
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
GalleryContainer.displayName = "GalleryContainer";

export const GalleryCol = ({
  className,
  style,
  yRange = ["0%", "-10%"],
  ...props
}: HTMLMotionProps<"div"> & { yRange?: [string, string] }) => {
  const { scrollYProgress } = useContainerScrollContext();
  const y = useTransform(scrollYProgress, [0.55, 0.92], yRange);

  return (
    <motion.div
      className={cn("relative flex w-full flex-col gap-2", className)}
      style={{ y, ...style }}
      {...props}
    />
  );
};
GalleryCol.displayName = "GalleryCol";

export const ContainerStagger = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, viewport, transition, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn("relative", className)}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, ...viewport }}
    transition={{
      staggerChildren: transition?.staggerChildren ?? 0.2,
      ...transition,
    }}
    {...props}
  />
));
ContainerStagger.displayName = "ContainerStagger";

export const ContainerAnimated = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn(className)}
    variants={blurVariants}
    transition={SPRING_CONFIG}
    {...props}
  />
));
ContainerAnimated.displayName = "ContainerAnimated";

// ─── 3D view: 4 images per column (12 total) — enough to fill viewport + parallax
const FEATURED_COUNT = 12;

// Parallax ranges tuned for 4 landscape (4:3) images per column:
// column height ≈ 1220px, viewport ≈ 930px → need to scroll ~290px to show all
// -35% of 930px ≈ 325px → every image in cols 1 & 3 becomes visible
// col 2 moves slower for depth
const COL_Y_RANGES: [string, string][] = [
  ["0%", "-35%"],
  ["0%", "-22%"],
  ["0%", "-40%"],
];

// ─── Simple masonry for images that don't fit in 3D view / mobile ─────────────
function MasonryGrid({ images }: { images: GalleryImage[] }) {
  return (
    <div className="columns-2 gap-2 lg:columns-3 [&>*]:mb-2">
      {images.map((image, index) => (
        <ContainerAnimated
          key={`${image.src}-${index}`}
          className="break-inside-avoid"
        >
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            className="w-full rounded-[20px] object-cover"
          />
        </ContainerAnimated>
      ))}
    </div>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );
  React.useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handler, { passive: true });
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isDesktop;
}

// ─── Public component ─────────────────────────────────────────────────────────
export function ImageGallery({ images }: { images: GalleryImage[] }) {
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return <MasonryGrid images={images} />;
  }

  const featured = images.slice(0, FEATURED_COUNT);
  const rest = images.slice(FEATURED_COUNT);

  const columns: GalleryImage[][] = [[], [], []];
  featured.forEach((img, i) => columns[i % 3].push(img));

  return (
    <>
      <ContainerScroll>
        <ContainerSticky>
          <GalleryContainer>
            {columns.map((col, colIndex) => (
              <GalleryCol key={colIndex} yRange={COL_Y_RANGES[colIndex]}>
                <ContainerStagger>
                  {col.map((image, imgIndex) => (
                    <ContainerAnimated key={`${image.src}-${imgIndex}`}>
                      <img
                        src={image.src}
                        alt={image.alt}
                        loading="lazy"
                        decoding="async"
                        className="w-full rounded-[24px] object-cover"
                      />
                    </ContainerAnimated>
                  ))}
                </ContainerStagger>
              </GalleryCol>
            ))}
          </GalleryContainer>
        </ContainerSticky>
      </ContainerScroll>

      {rest.length > 0 && (
        <div className="mt-4">
          <MasonryGrid images={rest} />
        </div>
      )}
    </>
  );
}
