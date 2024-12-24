import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollWrapperProps {
  children: React.ReactNode;
}

export default function ScrollWrapper({ children }: ScrollWrapperProps) {
  // Ref for scroll-based parallax
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
    layoutEffect: false
  });

  // Transform scroll progress into visual effects
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "150%"]);

  return (
    <div ref={ref} className="relative min-h-screen overflow-hidden">
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 bg-gradient-mesh opacity-20 z-0"
      />
      <motion.div style={{ y: textY }}>
        {children}
      </motion.div>
    </div>
  );
}
