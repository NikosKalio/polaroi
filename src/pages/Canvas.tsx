import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import Polaroid from "../components/Polaroid";
import Header from "../components/Header";
import ShareModal from "../components/ShareModal";

export default function Canvas() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const canvas = useQuery(api.canvases.getCanvasBySlug, slug ? { slug } : "skip");

  const displayName = slug ? localStorage.getItem(`polaroid-name-${slug}`) : null;

  useEffect(() => {
    if (canvas === null) {
      navigate("/", { replace: true });
      return;
    }
    if (canvas && !displayName) {
      navigate(`/join/${canvas.inviteCode}`, { replace: true });
    }
  }, [canvas, displayName, navigate]);

  const photos = useQuery(
    api.photos.getPhotos,
    canvas ? { canvasId: canvas._id } : "skip"
  );
  const movePhoto = useMutation(api.photos.movePhoto);

  const [showShare, setShowShare] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0 });
  const pinchRef = useRef({ active: false, startDist: 0, startScale: 1 });
  const photoDragRef = useRef<{ id: Id<"photos">; startPosX: number; startPosY: number; startClientX: number; startClientY: number } | null>(null);
  const fittedRef = useRef(false);

  // Auto-fit: compute initial scale to show all photos
  useEffect(() => {
    if (!photos?.length || fittedRef.current || !scrollAreaRef.current) return;
    const polaroidW = 180;
    const polaroidH = 240;
    const xs = photos.filter((p) => p.url).map((p) => p.posX);
    const ys = photos.filter((p) => p.url).map((p) => p.posY);
    if (!xs.length) return;

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const el = scrollAreaRef.current;
    const viewW = el.clientWidth;
    const viewH = el.clientHeight;
    const canvasW = viewW;
    const canvasH = viewH + polaroidH;

    const contentW = ((maxX - minX) / 100) * canvasW + polaroidW;
    const contentH = ((maxY - minY) / 100) * canvasH + polaroidH;

    const padding = 20;
    const scaleX = (viewW - padding * 2) / contentW;
    const scaleY = (viewH - padding * 2) / contentH;
    const fitScale = Math.min(scaleX, scaleY, 1);

    const centerX = ((minX + maxX) / 2 / 100) * canvasW;
    const centerY = ((minY + maxY) / 2 / 100) * canvasH;
    const offsetX = viewW / 2 - centerX * fitScale;
    const offsetY = viewH / 2 - centerY * fitScale;

    setTransform({ x: offsetX, y: offsetY, scale: fitScale });
    fittedRef.current = true;
  }, [photos]);

  function handlePointerDown(e: React.PointerEvent) {
    if (pinchRef.current.active) return;

    const photoEl = (e.target as HTMLElement).closest("[data-photo-id]") as HTMLElement | null;
    if (photoEl) {
      const id = photoEl.dataset.photoId as Id<"photos">;
      const photo = photos?.find((p) => p._id === id);
      if (photo) {
        photoDragRef.current = {
          id,
          startPosX: photo.posX,
          startPosY: photo.posY,
          startClientX: e.clientX,
          startClientY: e.clientY,
        };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        e.stopPropagation();
        return;
      }
    }

    dragRef.current = {
      dragging: true,
      startX: e.clientX - transform.x,
      startY: e.clientY - transform.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (photoDragRef.current) {
      const el = scrollAreaRef.current;
      if (!el) return;
      const canvasW = el.clientWidth;
      const canvasH = el.clientHeight + 240;
      const deltaX = (e.clientX - photoDragRef.current.startClientX) / transform.scale;
      const deltaY = (e.clientY - photoDragRef.current.startClientY) / transform.scale;
      const newPosX = photoDragRef.current.startPosX + (deltaX / canvasW) * 100;
      const newPosY = photoDragRef.current.startPosY + (deltaY / canvasH) * 100;
      const photoEl = document.querySelector(`[data-photo-id="${photoDragRef.current.id}"]`) as HTMLElement;
      if (photoEl) {
        photoEl.style.left = `${newPosX}%`;
        photoEl.style.top = `${newPosY}%`;
      }
      return;
    }

    if (!dragRef.current.dragging || pinchRef.current.active) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragRef.current.startX,
      y: e.clientY - dragRef.current.startY,
    }));
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (photoDragRef.current) {
      const el = scrollAreaRef.current;
      if (el) {
        const canvasW = el.clientWidth;
        const canvasH = el.clientHeight + 240;
        const deltaX = (e.clientX - photoDragRef.current.startClientX) / transform.scale;
        const deltaY = (e.clientY - photoDragRef.current.startClientY) / transform.scale;
        const newPosX = photoDragRef.current.startPosX + (deltaX / canvasW) * 100;
        const newPosY = photoDragRef.current.startPosY + (deltaY / canvasH) * 100;
        movePhoto({ id: photoDragRef.current.id, posX: newPosX, posY: newPosY });
      }
      photoDragRef.current = null;
      return;
    }
    dragRef.current.dragging = false;
  }

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = {
        active: true,
        startDist: Math.sqrt(dx * dx + dy * dy),
        startScale: transform.scale,
      };
      dragRef.current.dragging = false;
    }
  }, [transform.scale]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current.active) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const newScale = Math.min(3, Math.max(0.15, pinchRef.current.startScale * (dist / pinchRef.current.startDist)));

      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      setTransform((prev) => {
        const ratio = newScale / prev.scale;
        return {
          x: midX - (midX - prev.x) * ratio,
          y: midY - (midY - prev.y) * ratio,
          scale: newScale,
        };
      });
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    pinchRef.current.active = false;
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const newScale = Math.min(3, Math.max(0.15, transform.scale - e.deltaY * 0.001));
    const ratio = newScale / transform.scale;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    setTransform((prev) => ({
      x: mouseX - (mouseX - prev.x) * ratio,
      y: mouseY - (mouseY - prev.y) * ratio,
      scale: newScale,
    }));
  }, [transform.scale]);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  if (!canvas || !displayName) return null;

  return (
    <div className="min-h-dvh bg-warm-white bg-grain flex flex-col">
      <Header displayName={displayName} canvasId={canvas._id} canvasName={canvas.name} />

      <div
        ref={scrollAreaRef}
        className="flex-1 mt-[52px] mb-[56px] overflow-hidden touch-none relative z-1"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
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
                data-photo-id={photo._id}
                className="absolute animate-pop-in cursor-grab active:cursor-grabbing"
                style={{
                  left: `${photo.posX}%`,
                  top: `${photo.posY}%`,
                  transform: `translate(-50%, -50%)`,
                }}
              >
                <Polaroid
                  url={photo.url}
                  userName={photo.displayName}
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
            onClick={() => navigate(`/c/${slug}/camera`)}
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
          {/* Share button */}
          <button
            onClick={() => setShowShare(true)}
            className="flex flex-col items-center gap-1.5 px-6 py-1 relative active:scale-90 transition-transform"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5F5F0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            <span
              className="text-cream text-[10px]"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 400, letterSpacing: "0.08em" }}
            >
              Share
            </span>
          </button>
        </div>
      </div>

      {showShare && canvas && (
        <ShareModal
          canvasName={canvas.name}
          inviteCode={canvas.inviteCode}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
