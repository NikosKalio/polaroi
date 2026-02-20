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
    <div
      className="min-h-dvh"
      style={{
        backgroundImage: "url(/hero-bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Full-page tint so photos stay visible at edges */}
      <div
        className="min-h-dvh flex flex-col items-center justify-center px-6 py-12"
        style={{
          background: "rgba(250,250,247,0.55)",
        }}
      >
        {/* Card backdrop for readable text */}
        <div
          style={{
            background: "rgba(250,250,247,0.93)",
            borderRadius: "24px",
            padding: "clamp(2rem, 5vw, 3rem)",
            maxWidth: "520px",
            width: "100%",
            boxShadow: "0 8px 40px rgba(28, 25, 23, 0.08)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div className="animate-fade-in flex justify-center">
            <img
              src="/mascot.png"
              alt="Polaroid Party"
              style={{
                width: "120px",
                height: "auto",
                marginBottom: "1.5rem",
                animation: "float 3s ease-in-out infinite",
              }}
            />
          </div>

          <div className="animate-slide-up text-center">
            <h1
              className="text-ink"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2.25rem, 7vw, 3.5rem)",
                lineHeight: 1.1,
                fontWeight: 400,
              }}
            >
              Your party's photo booth
              <br />
              <span className="text-stone">without the booth</span>
            </h1>

            <p
              className="text-stone mt-4 leading-relaxed mx-auto"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
                fontWeight: 300,
                maxWidth: "400px",
              }}
            >
              Guests snap polaroids from their phone. All photos land on one shared board in real-time.
            </p>
          </div>

          {/* 3 steps */}
          <div
            className="mt-8 flex flex-col gap-3 animate-slide-up-delayed mx-auto"
            style={{ maxWidth: "400px" }}
          >
            {[
              { n: "1", text: "Sign up for free" },
              { n: "2", text: "Create a canvas" },
              { n: "3", text: "Share with guests (no account needed for guests)" },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-3">
                <span
                  style={{
                    fontFamily: "var(--font-hand)",
                    fontSize: "1.5rem",
                    lineHeight: 1,
                    color: "var(--color-ink)",
                    flexShrink: 0,
                    width: "24px",
                    textAlign: "center",
                  }}
                >
                  {step.n}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.95rem",
                    fontWeight: 400,
                    color: "var(--color-ink)",
                    lineHeight: 1.4,
                  }}
                >
                  {step.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            className="mt-8 flex flex-col gap-2 animate-slide-up-delayed mx-auto"
            style={{ maxWidth: "280px" }}
          >
            <button
              onClick={() => navigate("/sign-up")}
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
              Start the Party
            </button>
            <button
              onClick={() => navigate("/sign-in")}
              className="w-full py-2.5 text-sm transition-all active:scale-95"
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 400,
                background: "transparent",
                color: "var(--color-stone)",
                border: "none",
                cursor: "pointer",
              }}
            >
              Already have an account?{" "}
              <span style={{ textDecoration: "underline" }}>Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
