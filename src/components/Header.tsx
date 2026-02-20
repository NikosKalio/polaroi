import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface HeaderProps {
  displayName: string;
  canvasId: Id<"canvases">;
  canvasName?: string;
}

export default function Header({ displayName, canvasId, canvasName }: HeaderProps) {
  const navigate = useNavigate();
  const count = useQuery(api.photos.getPhotoCount, { canvasId, displayName });
  const remaining = count !== undefined ? 30 - count : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-cream/90 backdrop-blur-md">
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate("/dashboard")}
            className="shrink-0 p-1 -ml-1 active:scale-90 transition-transform"
            title="Back to dashboard"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          {canvasName && (
            <span
              className="text-ink text-sm truncate"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
            >
              {canvasName}
            </span>
          )}
          <span className="text-stone-light text-xs shrink-0">/</span>
          <span
            className="text-stone text-sm truncate"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 400 }}
          >
            {displayName}
          </span>
        </div>
        {remaining !== null && (
          <span
            className="text-stone text-xs tabular-nums shrink-0 ml-2"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 400, letterSpacing: "0.05em" }}
          >
            {remaining} / 30
          </span>
        )}
      </div>
      <div className="h-px bg-stone-faint" />
    </header>
  );
}
