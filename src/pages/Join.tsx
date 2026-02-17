import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Join() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const canvas = useQuery(
    api.canvases.getCanvasByInviteCode,
    inviteCode ? { inviteCode } : "skip"
  );

  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !canvas) return;
    localStorage.setItem(`polaroid-name-${canvas.slug}`, trimmed);
    navigate(`/c/${canvas.slug}/camera`);
  }

  // Loading
  if (canvas === undefined) {
    return (
      <div className="min-h-dvh bg-cream flex items-center justify-center">
        <p
          className="text-stone text-sm"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 300, letterSpacing: "0.1em" }}
        >
          Loading...
        </p>
      </div>
    );
  }

  // Invalid invite code
  if (canvas === null) {
    return (
      <div className="min-h-dvh bg-cream flex flex-col items-center justify-center px-8">
        <h1
          className="text-ink text-2xl mb-3"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
        >
          Invalid Invite
        </h1>
        <p
          className="text-stone text-sm text-center mb-6"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
        >
          This invite link is not valid or has expired.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 rounded-lg text-xs tracking-[0.1em] uppercase active:scale-95 transition-transform"
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            background: "var(--color-ink)",
            color: "var(--color-cream)",
          }}
        >
          Go Home
        </button>
      </div>
    );
  }

  // Check if guest already has a name for this canvas
  const existingName = localStorage.getItem(`polaroid-name-${canvas.slug}`);
  if (existingName) {
    navigate(`/c/${canvas.slug}/camera`, { replace: true });
    return null;
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col items-center justify-center px-8">
      {/* Decorative top line */}
      <div className="animate-fade-in mb-16">
        <div className="w-px h-16 bg-stone-light mx-auto" />
      </div>

      <div className="animate-slide-up text-center">
        <p
          className="text-stone text-sm tracking-[0.2em] uppercase mb-6"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
        >
          You're invited to
        </p>
        <h1
          className="text-ink mb-4"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2rem, 7vw, 3.5rem)",
            lineHeight: 1.1,
            fontWeight: 400,
          }}
        >
          {canvas.name}
        </h1>
        <p className="text-stone text-base max-w-[240px] mx-auto leading-relaxed">
          Capture moments together.
          <br />
          Every photo, shared instantly.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[280px] mt-12 animate-slide-up-delayed"
      >
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Your name"
            maxLength={30}
            autoFocus
            className="w-full px-0 py-3 bg-transparent text-ink text-center text-lg outline-none placeholder-stone-light transition-colors"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
          />
          <div
            className="absolute bottom-0 left-1/2 h-px bg-stone-light transition-all duration-500"
            style={{
              width: focused || name ? "100%" : "40px",
              transform: "translateX(-50%)",
              backgroundColor: focused ? "var(--color-ink)" : undefined,
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full mt-8 py-3.5 text-sm tracking-[0.15em] uppercase transition-all duration-300 disabled:opacity-0 disabled:translate-y-1"
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            background: "var(--color-ink)",
            color: "var(--color-cream)",
            border: "none",
            cursor: name.trim() ? "pointer" : "default",
          }}
        >
          Join
        </button>
      </form>

      <p
        className="mt-auto mb-8 text-stone-light text-xs tracking-wide animate-slide-up-delayed"
        style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
      >
        30 photos per guest
      </p>
    </div>
  );
}
