import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div className="min-h-dvh bg-cream flex flex-col items-center justify-center px-8">
      <div className="animate-slide-up">
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none bg-transparent",
              headerTitle: {
                fontFamily: "var(--font-serif)",
                color: "var(--color-ink)",
              },
              headerSubtitle: {
                fontFamily: "var(--font-sans)",
                color: "var(--color-stone)",
              },
              formButtonPrimary:
                "bg-ink hover:bg-ink/90 text-cream font-sans tracking-wider uppercase text-sm",
              footerActionLink: "text-ink hover:text-ink/70",
            },
          }}
        />
      </div>
    </div>
  );
}
