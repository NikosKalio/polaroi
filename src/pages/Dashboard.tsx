import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { useUser, UserButton } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ShareModal from "../components/ShareModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
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
    <div className="min-h-dvh bg-cream">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-cream/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 py-3.5">
          <h1
            className="text-ink text-lg"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
          >
            Polaroid Party
          </h1>
          <div className="flex items-center gap-3">
            <span
              className="text-stone text-xs hidden sm:block"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
            >
              {user?.firstName || user?.emailAddresses[0]?.emailAddress}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        <div className="h-px bg-stone-faint" />
      </header>

      {/* Content */}
      <div className="pt-[68px] px-5 pb-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mt-6 mb-6">
          <h2
            className="text-ink text-2xl"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
          >
            Your Canvases
          </h2>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-lg text-xs tracking-[0.1em] uppercase active:scale-95 transition-transform"
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              background: "var(--color-ink)",
              color: "var(--color-cream)",
            }}
          >
            + New
          </button>
        </div>

        {canvases === undefined && (
          <div className="flex items-center justify-center py-20">
            <p
              className="text-stone text-sm"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 300, letterSpacing: "0.1em" }}
            >
              Loading...
            </p>
          </div>
        )}

        {canvases?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-stone-light mb-4"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            <p
              className="text-stone text-sm mb-1"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 400 }}
            >
              No canvases yet
            </p>
            <p
              className="text-stone-light text-xs"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
            >
              Create one to get started
            </p>
          </div>
        )}

        {/* Canvas cards */}
        <div className="grid gap-4">
          {canvases?.map((canvas) => (
            <div
              key={canvas._id}
              className="bg-white rounded-xl p-5 polaroid-shadow transition-all"
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/c/${canvas.slug}/canvas`)}
                >
                  <h3
                    className="text-ink text-lg mb-1"
                    style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
                  >
                    {canvas.name}
                  </h3>
                  <p
                    className="text-stone text-xs"
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
                  >
                    Created{" "}
                    {new Date(canvas.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  {/* Share button */}
                  <button
                    onClick={() =>
                      setShareCanvas({
                        name: canvas.name,
                        inviteCode: canvas.inviteCode,
                      })
                    }
                    className="p-2 rounded-lg hover:bg-stone-faint transition-colors active:scale-90"
                    title="Share invite link"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-stone"
                    >
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={() => setConfirmDelete(canvas._id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors active:scale-90"
                    title="Delete canvas"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-stone hover:text-red-400"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create canvas modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-sm"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-cream rounded-2xl p-6 mx-6 max-w-sm w-full shadow-lg animate-settle"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-ink text-xl text-center mb-6"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
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
                className="w-full px-4 py-3 bg-white rounded-lg text-ink text-sm outline-none border border-stone-faint focus:border-stone-light transition-colors"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-lg text-stone text-sm active:scale-95 transition-transform"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 400 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || creating}
                  className="flex-1 py-2.5 rounded-lg text-sm tracking-[0.1em] uppercase transition-all active:scale-95 disabled:opacity-40"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    background: "var(--color-ink)",
                    color: "var(--color-cream)",
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-cream rounded-2xl p-6 mx-6 max-w-sm w-full shadow-lg animate-settle"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-ink text-lg text-center mb-2"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
            >
              Delete Canvas?
            </h2>
            <p
              className="text-stone text-sm text-center mb-5"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
            >
              This will permanently delete the canvas and all its photos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-lg text-stone text-sm active:scale-95 transition-transform"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 400 }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-lg text-sm tracking-[0.1em] uppercase transition-all active:scale-95"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  background: "#dc2626",
                  color: "var(--color-cream)",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share modal */}
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
