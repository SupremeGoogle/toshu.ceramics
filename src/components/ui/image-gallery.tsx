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
        className={cn("relative min-h-[120vh]", className)}
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

export const ContainerSticky = ({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "sticky left-0 top-0 min-h-[30rem] w-full overflow-hidden",
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

export const GalleryContainer = ({
  children,
  className,
  style,
  ...props
}: HTMLMotionProps<"div">) => {
  const { scrollYProgress } = useContainerScrollContext();
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [75, 0]);
  const scale = useTransform(scrollYProgress, [0.5, 0.9], [1.2, 1]);

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

export const GalleryCol = ({
  className,
  style,
  yRange = ["0%", "-10%"],
  ...props
}: HTMLMotionProps<"div"> & { yRange?: [string, string] }) => {
  const { scrollYProgress } = useContainerScrollContext();
  const y = useTransform(scrollYProgress, [0.5, 1], yRange);

  return (
    <motion.div
      className={cn("relative flex w-full flex-col gap-2", className)}
      style={{ y, ...style }}
      {...props}
    />
  );
};

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

const COL_Y_RANGES: [string, string][] = [
  ["0%", "-8%"],
  ["0%", "5%"],
  ["0%", "-12%"],
];

export function ImageGallery({ images }: { images: GalleryImage[] }) {
  const columns: GalleryImage[][] = [[], [], []];
  images.forEach((img, i) => columns[i % 3].push(img));

  return (
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
                      className="w-full rounded-[24px] object-cover shadow-soft"
                    />
                  </ContainerAnimated>
                ))}
              </ContainerStagger>
            </GalleryCol>
          ))}
        </GalleryContainer>
      </ContainerSticky>
    </ContainerScroll>
  );
}
