import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Polaroid from "../components/Polaroid";
import Header from "../components/Header";

export default function Canvas() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("polaroid-name");

  useEffect(() => {
    if (!userName) navigate("/", { replace: true });
  }, [userName, navigate]);

  const photos = useQuery(api.photos.getPhotos);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0 });

  function handlePointerDown(e: React.PointerEvent) {
    dragRef.current = {
      dragging: true,
      startX: e.clientX - transform.x,
      startY: e.clientY - transform.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current.dragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragRef.current.startX,
      y: e.clientY - dragRef.current.startY,
    }));
  }

  function handlePointerUp() {
    dragRef.current.dragging = false;
  }

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(3, Math.max(0.3, prev.scale - e.deltaY * 0.001)),
    }));
  }, []);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  if (!userName) return null;

  return (
    <div className="min-h-dvh bg-warm-white bg-grain flex flex-col">
      <Header userName={userName} />

      <div
        ref={scrollAreaRef}
        className="flex-1 mt-[52px] mb-[56px] overflow-hidden touch-none relative z-1"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          ref={containerRef}
          className="relative w-full h-full"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "center center",
            minHeight: "100vh",
          }}
        >
          {photos === undefined && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="text-stone text-sm"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 300, letterSpacing: "0.1em" }}
              >
                Loading...
              </div>
            </div>
          )}

          {photos?.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-stone-light mb-5">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <p
                className="text-stone text-sm"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 400 }}
              >
                No photos yet
              </p>
              <p
                className="text-stone-light text-xs mt-1"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
              >
                Be the first to take one
              </p>
            </div>
          )}

          {photos?.map((photo) =>
            photo.url ? (
              <div
                key={photo._id}
                className="absolute animate-pop-in"
                style={{
                  left: `${photo.posX}%`,
                  top: `${photo.posY}%`,
                  transform: `translate(-50%, -50%)`,
                }}
              >
                <Polaroid
                  url={photo.url}
                  userName={photo.userName}
                  timestamp={photo.timestamp}
                  rotation={photo.rotation}
                />
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 pb-safe z-10" style={{ background: "var(--color-ink)" }}>
        <div className="flex items-center justify-around py-3">
          <button
            onClick={() => navigate("/camera")}
            className="flex flex-col items-center gap-1.5 px-6 py-1 relative active:scale-90 transition-transform"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5F5F0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span
              className="text-cream text-[10px]"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 400, letterSpacing: "0.08em" }}
            >
              Camera
            </span>
          </button>
          <button className="flex flex-col items-center gap-1.5 px-6 py-1 relative active:scale-90 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5F5F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            <span
              className="text-cream text-[10px]"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 500, letterSpacing: "0.08em" }}
            >
              Gallery
            </span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-cream" />
          </button>
        </div>
      </div>
    </div>
  );
}
