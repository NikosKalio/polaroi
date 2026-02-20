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
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ background: "rgba(28,25,23,0.7)" }}
      onClick={onClose}
    >
      <div
        className="animate-settle"
        style={{
          background: "var(--color-cream)",
          borderRadius: "16px",
          padding: "32px 28px 28px",
          margin: "0 24px",
          maxWidth: "360px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(28,25,23,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "1.375rem",
            color: "var(--color-ink)",
            textAlign: "center",
            margin: "0 0 4px 0",
          }}
        >
          {canvasName}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 300,
            fontSize: "0.8125rem",
            color: "var(--color-stone)",
            textAlign: "center",
            margin: "0 0 28px 0",
          }}
        >
          Share this link to invite guests
        </p>

        {/* QR Code */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
          <div style={{ background: "#fff", padding: "16px", borderRadius: "12px" }}>
            <QRCodeSVG
              value={inviteUrl}
              size={180}
              bgColor="#FFFFFF"
              fgColor="#1C1917"
              level="M"
            />
          </div>
        </div>

        {/* Invite link + copy */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              background: "#fff",
              borderRadius: "8px",
              padding: "0 14px",
              height: "44px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 300,
                fontSize: "0.75rem",
                color: "var(--color-stone)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {inviteUrl}
            </span>
          </div>
          <button
            onClick={handleCopy}
            style={{
              flexShrink: 0,
              height: "44px",
              padding: "0 20px",
              borderRadius: "8px",
              border: "none",
              background: copied ? "var(--color-stone)" : "var(--color-ink)",
              color: "var(--color-cream)",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: "0.6875rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            height: "44px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
            fontSize: "0.875rem",
            color: "var(--color-stone)",
            cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
