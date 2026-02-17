import { useNavigate } from "react-router-dom";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";

export default function Welcome() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
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
          Welcome to
        </p>
        <h1
          className="text-ink mb-4"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.5rem, 8vw, 4rem)",
            lineHeight: 1,
            fontWeight: 400,
          }}
        >
          Polaroid Party
        </h1>
        <p className="text-stone text-base max-w-[260px] mx-auto leading-relaxed">
          Create a canvas, invite your guests, and capture moments together.
        </p>
      </div>

      <div className="w-full max-w-[280px] mt-12 animate-slide-up-delayed flex flex-col gap-3">
        <button
          onClick={() => navigate("/sign-in")}
          className="w-full py-3.5 text-sm tracking-[0.15em] uppercase transition-all active:scale-95"
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            background: "var(--color-ink)",
            color: "var(--color-cream)",
            border: "none",
            cursor: "pointer",
          }}
        >
          Sign In
        </button>
        <button
          onClick={() => navigate("/sign-up")}
          className="w-full py-3.5 text-sm tracking-[0.15em] uppercase transition-all active:scale-95"
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
            background: "transparent",
            color: "var(--color-stone)",
            border: "1px solid var(--color-stone-faint)",
            cursor: "pointer",
          }}
        >
          Create Account
        </button>
      </div>

      <p
        className="mt-auto mb-8 text-stone-light text-xs tracking-wide animate-slide-up-delayed"
        style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
      >
        Guests join via invite link — no sign-up needed
      </p>
    </div>
  );
}
