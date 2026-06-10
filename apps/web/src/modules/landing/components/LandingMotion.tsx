import { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export function ScrollReveal({
  children,
  className,
  delay = 0.08,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -48px" }}
      transition={{
        duration: 0.65,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedEyebrow({
  children,
  centered = false,
  dark = false,
}: {
  children: string;
  centered?: boolean;
  dark?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`flex items-center gap-2.5 ${
        centered ? "justify-center" : "justify-start"
      }`}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.8 }}
    >
      <motion.span
        aria-hidden="true"
        className={`size-1.5 shrink-0 rounded-full ${
          dark ? "bg-[#d9d0ff]" : "bg-[#4f2fdf]"
        }`}
        variants={{
          hidden: { opacity: 0, scale: 0.2 },
          visible: { opacity: 1, scale: 1 },
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      <motion.span
        className={`text-sm font-semibold uppercase ${
          dark ? "text-[#d9d0ff]" : "text-[#4f2fdf]"
        }`}
        variants={{
          hidden: { opacity: 0, x: -8, letterSpacing: "0.04em" },
          visible: { opacity: 1, x: 0, letterSpacing: "0.18em" },
        }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <ScrollReveal className="mx-auto max-w-3xl text-center">
      <AnimatedEyebrow centered>{eyebrow}</AnimatedEyebrow>
      <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
        {description}
      </p>
    </ScrollReveal>
  );
}
