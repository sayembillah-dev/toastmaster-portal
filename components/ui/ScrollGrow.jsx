"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollGrow({ children, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "center center",
      scrub: true,
      animation: gsap.fromTo(
        el,
        { opacity: 0, scale: 0.05 },
        { opacity: 1, scale: 1, ease: "power2.out" }
      ),
    });

    return () => trigger.kill();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
