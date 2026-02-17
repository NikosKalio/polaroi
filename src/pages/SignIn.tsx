import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <div className="min-h-dvh bg-cream flex flex-col items-center justify-center px-8">
      <div className="animate-slide-up">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
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
