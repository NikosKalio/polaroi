import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface ShareModalProps {
  canvasName: string;
  inviteCode: string;
  onClose: () => void;
}

export default function ShareModal({ canvasName, inviteCode, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = `${window.location.origin}/join/${inviteCode}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = inviteUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-2xl p-6 mx-6 max-w-sm w-full shadow-lg animate-settle"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-ink text-xl text-center mb-1"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
        >
          {canvasName}
        </h2>
        <p
          className="text-stone text-sm text-center mb-6"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
        >
          Share this link to invite guests
        </p>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG
              value={inviteUrl}
              size={180}
              bgColor="#FFFFFF"
              fgColor="#1C1917"
              level="M"
            />
          </div>
        </div>

        {/* Invite link */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="flex-1 bg-white rounded-lg px-3 py-2.5 text-xs text-stone truncate"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
          >
            {inviteUrl}
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 px-4 py-2.5 rounded-lg text-xs tracking-[0.1em] uppercase transition-all active:scale-95"
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              background: copied ? "var(--color-stone)" : "var(--color-ink)",
              color: "var(--color-cream)",
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-stone text-sm active:scale-95 transition-transform"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 400 }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
