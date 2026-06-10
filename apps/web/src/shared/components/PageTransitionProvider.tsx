import {
  createContext,
  MouseEvent as ReactMouseEvent,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import LogoSquare from "./LogoSquare";

type TransitionPhase = "idle" | "expanding" | "covered" | "fading";

interface TransitionOrigin {
  x: number;
  y: number;
  radius: number;
}

interface PageTransitionContextValue {
  startTransition: (
    event: ReactMouseEvent<HTMLElement>,
    navigate: () => void | Promise<void>,
  ) => void;
  notifyArrival: () => void;
  isTransitioning: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

const COVER_HOLD_MS = 380;

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [origin, setOrigin] = useState<TransitionOrigin>({
    x: 0,
    y: 0,
    radius: 0,
  });
  const phaseRef = useRef<TransitionPhase>("idle");
  const destinationMountedRef = useRef(false);
  const navigateRef = useRef<(() => void | Promise<void>) | null>(null);
  const revealTimerRef = useRef<number | null>(null);

  const updatePhase = useCallback((nextPhase: TransitionPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(
    () => () => {
      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current);
      }
    },
    [],
  );

  const revealDestination = useCallback(() => {
    if (
      phaseRef.current !== "covered" ||
      !destinationMountedRef.current ||
      revealTimerRef.current
    ) {
      return;
    }

    revealTimerRef.current = window.setTimeout(() => {
      revealTimerRef.current = null;
      updatePhase("fading");
    }, COVER_HOLD_MS);
  }, [updatePhase]);

  const notifyArrival = useCallback(() => {
    destinationMountedRef.current = true;
    revealDestination();
  }, [revealDestination]);

  const startTransition = useCallback(
    (
      event: ReactMouseEvent<HTMLElement>,
      navigate: () => void | Promise<void>,
    ) => {
      event.preventDefault();
      if (phaseRef.current !== "idle") return;

      const x = event.clientX || window.innerWidth / 2;
      const y = event.clientY || window.innerHeight / 2;
      const radius = Math.max(
        Math.hypot(x, y),
        Math.hypot(window.innerWidth - x, y),
        Math.hypot(x, window.innerHeight - y),
        Math.hypot(window.innerWidth - x, window.innerHeight - y),
      );

      destinationMountedRef.current = false;
      navigateRef.current = navigate;
      setOrigin({ x, y, radius: radius + 4 });
      updatePhase("expanding");
    },
    [updatePhase],
  );

  const handleAnimationComplete = async () => {
    if (phaseRef.current === "expanding") {
      updatePhase("covered");
      await navigateRef.current?.();
      revealDestination();
      return;
    }

    if (phaseRef.current === "fading") {
      navigateRef.current = null;
      updatePhase("idle");
    }
  };

  const value: PageTransitionContextValue = {
    startTransition,
    notifyArrival,
    isTransitioning: phase !== "idle",
  };

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      {phase !== "idle" && (
        <div aria-hidden="true" className="fixed inset-0 z-[9999] cursor-wait">
          <motion.div
            className="absolute inset-0 bg-[#4f2fdf]"
            initial={{
              clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
              opacity: 1,
            }}
            animate={{
              clipPath: `circle(${origin.radius}px at ${origin.x}px ${origin.y}px)`,
              opacity: phase === "fading" ? 0 : 1,
            }}
            transition={
              phase === "fading"
                ? { duration: 0.36, ease: "easeOut" }
                : { duration: 0.52, ease: [0.65, 0, 0.35, 1] }
            }
            style={{ willChange: "clip-path, opacity" }}
            onAnimationComplete={() => void handleAnimationComplete()}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{
              opacity: phase === "fading" ? 0 : 1,
              scale: phase === "fading" ? 0.96 : 1,
            }}
            transition={
              phase === "fading"
                ? { duration: 0.24, ease: "easeOut" }
                : { delay: 0.28, duration: 0.22, ease: "easeOut" }
            }
          >
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-2xl bg-white p-3 shadow-2xl shadow-black/20">
                <LogoSquare className="size-14 rounded-xl sm:size-16" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error(
      "usePageTransition must be used within PageTransitionProvider",
    );
  }
  return context;
}

export function usePageTransitionLink(to: string, enabled = true) {
  const navigate = useNavigate();
  const { isTransitioning, startTransition } = usePageTransition();

  const onClick = useCallback<MouseEventHandler<HTMLElement>>(
    (event) => {
      if (
        !enabled ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      startTransition(event, () => navigate(to));
    },
    [enabled, navigate, startTransition, to],
  );

  return {
    isTransitioning,
    linkProps: enabled ? { onClick } : {},
  };
}

export function usePageTransitionArrival() {
  const { notifyArrival } = usePageTransition();

  useEffect(() => {
    notifyArrival();
  }, [notifyArrival]);
}
