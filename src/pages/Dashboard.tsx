import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { UserButton } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import ShareModal from "../components/ShareModal";

function CanvasCard({
  canvas,
  onShare,
  onDelete,
}: {
  canvas: Doc<"canvases">;
  onShare: () => void;
  onDelete: () => void;
}) {
  const navigate = useNavigate();
  const photoCount = useQuery(api.canvases.getCanvasPhotoCount, {
    canvasId: canvas._id,
  });

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(28,25,23,0.06), 0 6px 16px rgba(28,25,23,0.04)",
        overflow: "hidden",
      }}
    >
      <div
        onClick={() => navigate(`/c/${canvas.slug}/canvas`)}
        style={{ padding: "24px 24px 20px", cursor: "pointer" }}
      >
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "1.25rem",
            color: "var(--color-ink)",
            margin: "0 0 8px 0",
          }}
        >
          {canvas.name}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 300,
            fontSize: "0.8125rem",
            color: "var(--color-stone)",
            margin: 0,
          }}
        >
          {photoCount ?? "..."} photo{photoCount !== 1 ? "s" : ""}
          {" \u00B7 "}
          {new Date(canvas.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          borderTop: "1px solid var(--color-stone-faint)",
        }}
      >
        <button
          onClick={onShare}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "14px 0",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
            fontSize: "0.75rem",
            color: "var(--color-stone)",
            letterSpacing: "0.05em",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share
        </button>
        <div style={{ width: "1px", background: "var(--color-stone-faint)" }} />
        <button
          onClick={() => navigate(`/c/${canvas.slug}/canvas`)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "14px 0",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
            fontSize: "0.75rem",
            color: "var(--color-stone)",
            letterSpacing: "0.05em",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          Open
        </button>
        <div style={{ width: "1px", background: "var(--color-stone-faint)" }} />
        <button
          onClick={onDelete}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "14px 0",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
            fontSize: "0.75rem",
            color: "var(--color-stone-light)",
            letterSpacing: "0.05em",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const canvases = useQuery(api.canvases.getMyCanvases);
  const createCanvas = useMutation(api.canvases.createCanvas);
  const deleteCanvas = useMutation(api.canvases.deleteCanvas);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [shareCanvas, setShareCanvas] = useState<{
    name: string;
    inviteCode: string;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Id<"canvases"> | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      const result = await createCanvas({ name: trimmed });
      setNewName("");
      setShowCreate(false);
      navigate(`/c/${result.slug}/canvas`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create canvas");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: Id<"canvases">) {
    try {
      await deleteCanvas({ id });
      setConfirmDelete(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete canvas");
    }
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-cream)" }}>
      {/* Header — NOT fixed, just flows naturally */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid var(--color-stone-faint)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "1.125rem",
            color: "var(--color-ink)",
          }}
        >
          Polaroid Party
        </span>
        <UserButton afterSignOutUrl="/" />
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "32px 24px 48px",
        }}
      >
        {/* Title row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "1.5rem",
              color: "var(--color-ink)",
              margin: 0,
            }}
          >
            Your Canvases
          </h2>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              height: "40px",
              padding: "0 20px",
              borderRadius: "8px",
              border: "none",
              background: "var(--color-ink)",
              color: "var(--color-cream)",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              cursor: "pointer",
            }}
          >
            + New
          </button>
        </div>

        {/* Loading */}
        {canvases === undefined && (
          <p
            style={{
              textAlign: "center",
              padding: "80px 0",
              fontFamily: "var(--font-sans)",
              fontWeight: 300,
              fontSize: "0.875rem",
              color: "var(--color-stone)",
            }}
          >
            Loading...
          </p>
        )}

        {/* Empty state */}
        {canvases?.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 400,
                fontSize: "0.875rem",
                color: "var(--color-stone)",
                margin: "0 0 4px 0",
              }}
            >
              No canvases yet
            </p>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 300,
                fontSize: "0.75rem",
                color: "var(--color-stone-light)",
                margin: 0,
              }}
            >
              Create one to get started
            </p>
          </div>
        )}

        {/* Canvas list */}
        <div style={{ display: "grid", gap: "20px" }}>
          {canvases?.map((canvas) => (
            <CanvasCard
              key={canvas._id}
              canvas={canvas}
              onShare={() =>
                setShareCanvas({
                  name: canvas.name,
                  inviteCode: canvas.inviteCode,
                })
              }
              onDelete={() => setConfirmDelete(canvas._id)}
            />
          ))}
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ background: "rgba(28,25,23,0.7)" }}
          onClick={() => setShowCreate(false)}
        >
          <div
            className="animate-settle"
            style={{
              background: "var(--color-cream)",
              borderRadius: "16px",
              padding: "24px",
              margin: "0 24px",
              maxWidth: "384px",
              width: "100%",
              boxShadow: "0 20px 60px rgba(28,25,23,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontSize: "1.25rem",
                color: "var(--color-ink)",
                textAlign: "center",
                margin: "0 0 24px 0",
              }}
            >
              New Canvas
            </h2>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Birthday Party"
                maxLength={60}
                autoFocus
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 16px",
                  background: "#fff",
                  borderRadius: "8px",
                  border: "1px solid var(--color-stone-faint)",
                  outline: "none",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 300,
                  fontSize: "0.875rem",
                  color: "var(--color-ink)",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  style={{
                    flex: 1,
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || creating}
                  style={{
                    flex: 1,
                    height: "44px",
                    borderRadius: "8px",
                    border: "none",
                    background: "var(--color-ink)",
                    color: "var(--color-cream)",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase" as const,
                    cursor: newName.trim() && !creating ? "pointer" : "default",
                    opacity: !newName.trim() || creating ? 0.4 : 1,
                  }}
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ background: "rgba(28,25,23,0.7)" }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="animate-settle"
            style={{
              background: "var(--color-cream)",
              borderRadius: "16px",
              padding: "24px",
              margin: "0 24px",
              maxWidth: "384px",
              width: "100%",
              boxShadow: "0 20px 60px rgba(28,25,23,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontSize: "1.125rem",
                color: "var(--color-ink)",
                textAlign: "center",
                margin: "0 0 8px 0",
              }}
            >
              Delete Canvas?
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 300,
                fontSize: "0.875rem",
                color: "var(--color-stone)",
                textAlign: "center",
                margin: "0 0 20px 0",
              }}
            >
              This will permanently delete the canvas and all its photos.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  flex: 1,
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
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                style={{
                  flex: 1,
                  height: "44px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#dc2626",
                  color: "var(--color-cream)",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {shareCanvas && (
        <ShareModal
          canvasName={shareCanvas.name}
          inviteCode={shareCanvas.inviteCode}
          onClose={() => setShareCanvas(null)}
        />
      )}
    </div>
  );
}
