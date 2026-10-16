"use client";

import { useEffect } from "react";

export function ScrollProgress() {
  useEffect(() => {
    const root = document.documentElement;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    for (const element of reveals) {
      if (element.getBoundingClientRect().top < window.innerHeight * 0.88) {
        element.classList.add("is-visible");
      } else {
        revealObserver.observe(element);
      }
    }

    // Enable hidden-until-revealed styling only after every initial section is classified.
    root.classList.add("has-scroll-effects");

    const fill = document.querySelector<HTMLElement>(".scroll-progress-fill");
    let frame = 0;
    const updateProgress = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const maxScroll = root.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? root.scrollTop / maxScroll : 0;
        fill?.style.setProperty("transform", `scaleX(${Math.min(1, Math.max(0, progress))})`);
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    return () => {
      revealObserver.disconnect();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      if (frame) window.cancelAnimationFrame(frame);
      root.classList.remove("has-scroll-effects");
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span className="scroll-progress-fill" />
    </div>
  );
}
