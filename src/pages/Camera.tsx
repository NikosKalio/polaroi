import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { startCamera, stopCamera, captureFrame, triggerHaptic, flashTorch } from "../lib/camera";
import PhotoPreview from "../components/PhotoPreview";
import Header from "../components/Header";

export default function Camera() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("polaroid-name");

  useEffect(() => {
    if (!userName) navigate("/", { replace: true });
  }, [userName, navigate]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [preview, setPreview] = useState<{ blob: Blob; url: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSponsor, setShowSponsor] = useState(false);

  const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
  const savePhoto = useMutation(api.photos.savePhoto);
  const count = useQuery(api.photos.getPhotoCount, userName ? { userName } : "skip");

  const remaining = count !== undefined ? 30 - count : null;

  const initCamera = useCallback(async (facing: "user" | "environment") => {
    if (!videoRef.current) return;
    if (streamRef.current) stopCamera(streamRef.current);
    try {
      streamRef.current = await startCamera(videoRef.current, facing);
      setError(null);
    } catch {
      setError("Allow camera access to take photos.");
    }
  }, []);

  useEffect(() => {
    initCamera(facingMode);
    return () => {
      if (streamRef.current) stopCamera(streamRef.current);
    };
  }, [facingMode, initCamera]);

  async function handleCapture() {
    if (!videoRef.current || remaining === 0) return;
    triggerHaptic();
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    // Fire torch on back camera
    if (facingMode === "environment" && streamRef.current) {
      flashTorch(streamRef.current, 300);
    }

    try {
      const blob = await captureFrame(videoRef.current);
      const url = URL.createObjectURL(blob);
      setPreview({ blob, url });
    } catch {
      setError("Camera not ready yet. Try again.");
      setTimeout(() => setError(null), 2000);
    }
  }

  async function handleSave() {
    if (!preview || !userName) return;
    setSaving(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: preview.blob,
      });
      const { storageId } = (await result.json()) as { storageId: Id<"_storage"> };
      await savePhoto({ userName, storageId });
      URL.revokeObjectURL(preview.url);
      setPreview(null);
      const newCount = (count ?? 0) + 1;
      if (newCount % 5 === 0) {
        setShowSponsor(true);
      } else {
        navigate("/canvas");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save photo");
    } finally {
      setSaving(false);
    }
  }

  function handleRetake() {
    if (preview) {
      URL.revokeObjectURL(preview.url);
      setPreview(null);
    }
  }

  function toggleCamera() {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }

  if (!userName) return null;

  return (
    <div className="fixed inset-0 bg-ink flex flex-col">
      <Header userName={userName} />

      {/* Camera viewfinder */}
      <div className="absolute inset-0 top-[52px] bottom-[100px] z-0">
        {error ? (
          <div className="flex items-center justify-center h-full px-8">
            <p className="text-warm-white/50 text-center text-sm" style={{ fontFamily: "var(--font-sans)" }}>
              {error}
            </p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: facingMode === "user" ? "scaleX(-1)" : undefined }}
          />
        )}

        {flash && (
          <div className="absolute inset-0 bg-white animate-flash pointer-events-none" style={{ zIndex: 50 }} />
        )}
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-10 pb-safe" style={{ background: "var(--color-ink)" }}>
        <div className="flex items-center justify-between px-10 py-5">
          {/* Gallery */}
          <button
            onClick={() => navigate("/canvas")}
            className="w-10 h-10 flex items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5F5F0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>

          {/* Shutter */}
          <button
            onClick={handleCapture}
            disabled={remaining === 0}
            className="group relative w-[68px] h-[68px] flex items-center justify-center disabled:opacity-20 transition-opacity"
          >
            <div className="absolute inset-0 rounded-full border-[2px] border-cream/30 group-active:border-cream/60 transition-colors" />
            <div className="w-[54px] h-[54px] rounded-full bg-cream group-active:scale-90 transition-transform duration-150" />
          </button>

          {/* Flip */}
          <button
            onClick={toggleCamera}
            className="w-10 h-10 flex items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5F5F0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 3v6h-6" />
              <path d="M3 21v-6h6" />
              <path d="M21 3l-4.5 4.5" />
              <path d="M3 21l4.5-4.5" />
              <path d="M3 10a9 9 0 0 1 2.64-6.36" />
              <path d="M21 14a9 9 0 0 1-2.64 6.36" />
            </svg>
          </button>
        </div>

        {remaining !== null && remaining <= 5 && remaining > 0 && (
          <p
            className="text-center text-xs pb-2 opacity-50"
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-cream)", fontWeight: 300 }}
          >
            {remaining} remaining
          </p>
        )}
        {remaining === 0 && (
          <p
            className="text-center text-xs pb-2 opacity-50"
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-cream)", fontWeight: 300 }}
          >
            All 30 photos used
          </p>
        )}
      </div>

      {preview && (
        <PhotoPreview
          imageUrl={preview.url}
          onSave={handleSave}
          onRetake={handleRetake}
          saving={saving}
        />
      )}

      {showSponsor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-sm">
          <div className="bg-cream rounded-2xl p-6 mx-6 max-w-sm text-center shadow-lg">
            <p
              className="text-ink text-lg mb-1"
              style={{ fontFamily: "var(--font-hand)", fontWeight: 600 }}
            >
              Having fun?
            </p>
            <p
              className="text-stone text-sm mb-5"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 400 }}
            >
              Become a J floor sponsor!
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="https://twint.raisenow.io/?handshakeId=cf07a360d24ad50291ea1cb5c0b98658&returnAppPackage=com.ubs.Paymit.android&lng=en"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2.5 rounded-xl text-cream text-sm active:scale-95 transition-transform"
                style={{ background: "var(--color-ink)", fontFamily: "var(--font-sans)", fontWeight: 500, letterSpacing: "0.05em" }}
              >
                Sponsor
              </a>
              <button
                onClick={() => { setShowSponsor(false); navigate("/canvas"); }}
                className="w-full py-2.5 rounded-xl text-stone text-sm active:scale-95 transition-transform"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 400 }}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
