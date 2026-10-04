"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./flow-assistant.module.css";

interface FlowAssistantProps {
  onClick: () => void;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: number;
  expanded?: boolean;
  working?: boolean;
}
type Point = { x: number; y: number };
const STORAGE_KEY = "flow.avatar.position.v1";

/** Original Flow identity, connected to creation instead of disconnected chat. */
export default function FlowAssistant({
  onClick,
  position = "bottom-right",
  size = 80,
  expanded = false,
  working = false,
}: FlowAssistantProps) {
  const [point, setPoint] = useState<Point | null>(null);
  const drag = useRef<{ start: Point; origin: Point } | null>(null);
  const dragged = useRef(false);
  const currentPoint = useRef<Point | null>(null);

  const clamp = (next: Point): Point => ({
    x: Math.max(12, Math.min(next.x, window.innerWidth - size - 12)),
    y: Math.max(12, Math.min(next.y, window.innerHeight - size - 12)),
  });
  const move = (next: Point) => {
    const safe = clamp(next);
    currentPoint.current = safe;
    setPoint(safe);
  };
  const save = () => {
    try {
      if (currentPoint.current)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPoint.current));
    } catch {
      // Position remains usable when device storage is unavailable.
    }
  };

  useEffect(() => {
    const fit = (next: Point): Point => ({
      x: Math.max(12, Math.min(next.x, window.innerWidth - size - 12)),
      y: Math.max(12, Math.min(next.y, window.innerHeight - size - 12)),
    });
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
        const safe = fit(saved);
        currentPoint.current = safe;
        setPoint(safe);
      }
    } catch {
      // Ignore corrupt or blocked storage, not the whole app.
    }
    const resize = () => {
      if (!currentPoint.current) return;
      const next = fit(currentPoint.current);
      currentPoint.current = next;
      setPoint(next);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [size]);

  return (
    <button
      type="button"
      className={`${styles.avatar} ${working ? styles.working : ""}`}
      style={{
        width: size,
        height: size,
        ...(point
          ? {
              left: `clamp(12px, ${point.x}px, calc(100vw - ${size + 12}px))`,
              top: `clamp(12px, ${point.y}px, calc(100vh - ${size + 12}px))`,
            }
          : {
              [position.includes("right") ? "right" : "left"]: 24,
              [position.includes("bottom") ? "bottom" : "top"]: 24,
            }),
      }}
      aria-label={expanded ? "Minimize Flow" : "Open Flow"}
      aria-expanded={expanded}
      aria-controls="flow-creation-studio"
      title={working ? "Flow is working" : "Open Flow · Drag to move"}
      onClick={() => {
        if (!dragged.current) onClick();
        dragged.current = false;
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        dragged.current = false;
        drag.current = {
          start: { x: event.clientX, y: event.clientY },
          origin: { x: bounds.left, y: bounds.top },
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        const dx = event.clientX - drag.current.start.x;
        const dy = event.clientY - drag.current.start.y;
        if (Math.hypot(dx, dy) > 6) dragged.current = true;
        if (dragged.current)
          move({ x: drag.current.origin.x + dx, y: drag.current.origin.y + dy });
      }}
      onPointerUp={() => {
        drag.current = null;
        save();
      }}
      onPointerCancel={() => {
        drag.current = null;
        dragged.current = false;
      }}
      onKeyDown={(event) => {
        const delta: Record<string, Point> = {
          ArrowLeft: { x: -20, y: 0 },
          ArrowRight: { x: 20, y: 0 },
          ArrowUp: { x: 0, y: -20 },
          ArrowDown: { x: 0, y: 20 },
        };
        const offset = delta[event.key];
        if (!offset) return;
        event.preventDefault();
        const bounds = event.currentTarget.getBoundingClientRect();
        move({ x: bounds.left + offset.x, y: bounds.top + offset.y });
        save();
      }}
    >
      <Image src="/flow-avatar.png" alt="" width={80} height={80} draggable={false} />
      {working && <span className={styles.activity} aria-hidden="true" />}
    </button>
  );
}
