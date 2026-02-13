import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface HeaderProps {
  userName: string;
}

export default function Header({ userName }: HeaderProps) {
  const count = useQuery(api.photos.getPhotoCount, { userName });
  const remaining = count !== undefined ? 30 - count : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-cream/90 backdrop-blur-md">
      <div className="flex items-center justify-between px-5 py-3.5">
        <span
          className="text-ink text-sm"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
        >
          {userName}
        </span>
        {remaining !== null && (
          <span
            className="text-stone text-xs tabular-nums"
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
