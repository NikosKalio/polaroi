interface PhotoPreviewProps {
  imageUrl: string;
  onSave: () => void;
  onRetake: () => void;
  saving: boolean;
}

export default function PhotoPreview({
  imageUrl,
  onSave,
  onRetake,
  saving,
}: PhotoPreviewProps) {
  return (
    <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white p-2.5 pb-14 max-w-[320px] w-full animate-settle polaroid-shadow">
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full aspect-[3/4] object-cover"
        />
        <div className="flex gap-3 mt-5 px-1">
          <button
            onClick={onRetake}
            disabled={saving}
            className="flex-1 py-3 text-sm tracking-[0.1em] uppercase transition-all disabled:opacity-40"
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 400,
              color: "var(--color-stone)",
              background: "transparent",
              border: "1px solid var(--color-stone-faint)",
              cursor: saving ? "default" : "pointer",
            }}
          >
            Retake
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 py-3 text-sm tracking-[0.1em] uppercase transition-all disabled:opacity-40"
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              background: "var(--color-ink)",
              color: "var(--color-cream)",
              border: "1px solid var(--color-ink)",
              cursor: saving ? "default" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Keep"}
          </button>
        </div>
      </div>
    </div>
  );
}
