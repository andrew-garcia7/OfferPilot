import React, { useEffect, useRef } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function CursorEffect() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const rippleContainerRef = useRef<HTMLDivElement>(null);
  const rippleCount = useRef(0);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let raf: number;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      cursor.style.transform = `translate(${currentX - 8}px, ${currentY - 8}px)`;
      raf = requestAnimationFrame(animate);
    };

    const onMouseDown = (e: MouseEvent) => {
      const container = rippleContainerRef.current;
      if (!container) return;

      const id = ++rippleCount.current;
      const el = document.createElement("div");
      el.style.cssText = `
        position: fixed;
        left: ${e.clientX - 20}px;
        top: ${e.clientY - 20}px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        pointer-events: none;
        background: radial-gradient(circle, rgba(99,102,241,0.5) 0%, rgba(139,92,246,0.2) 50%, transparent 70%);
        transform: scale(0);
        animation: cursorRipple 0.55s cubic-bezier(0.2,0.8,0.4,1) forwards;
        z-index: 99998;
      `;
      el.setAttribute("data-ripple", String(id));
      container.appendChild(el);
      setTimeout(() => el.remove(), 600);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    raf = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Trailing cursor dot */}
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.9) 0%, rgba(139,92,246,0.6) 60%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 99999,
          boxShadow: "0 0 10px rgba(99,102,241,0.6), 0 0 20px rgba(99,102,241,0.3)",
          transition: "opacity 0.2s",
        }}
      />
      {/* Ripple container */}
      <div ref={rippleContainerRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99998 }} />
    </>
  );
}
