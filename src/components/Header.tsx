import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface HeaderProps {
  displayName: string;
  canvasId: Id<"canvases">;
  canvasName?: string;
}

export default function Header({ displayName, canvasId, canvasName }: HeaderProps) {
  const count = useQuery(api.photos.getPhotoCount, { canvasId, displayName });
  const remaining = count !== undefined ? 30 - count : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-cream/90 backdrop-blur-md">
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2 min-w-0">
          {canvasName && (
            <>
              <span
                className="text-ink text-sm truncate"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
              >
                {canvasName}
              </span>
              <span className="text-stone-light text-xs">/</span>
            </>
          )}
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
