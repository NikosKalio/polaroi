const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.85;

export async function startCamera(
  videoElement: HTMLVideoElement,
  facingMode: "user" | "environment" = "environment"
): Promise<MediaStream> {
  // Only request high resolution for rear camera — front camera crops/zooms to hit 1080p
  const resConstraints = facingMode === "environment"
    ? { width: { ideal: 1920 }, height: { ideal: 1080 } }
    : {};

  let stream: MediaStream;
  try {
    // Try exact facingMode first — prevents wrong camera on some Android devices
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: facingMode }, ...resConstraints },
      audio: false,
    });
  } catch {
    // Fallback to ideal (single-camera devices, or if exact fails)
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facingMode }, ...resConstraints },
      audio: false,
    });
  }
  videoElement.srcObject = stream;

  // Wait for actual frames before resolving — fixes black screen on iOS
  await new Promise<void>((resolve) => {
    if (videoElement.readyState >= 2) {
      resolve();
    } else {
      videoElement.addEventListener("loadeddata", () => resolve(), { once: true });
    }
  });
  await videoElement.play();
  return stream;
}

export function stopCamera(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
}

export async function captureFrame(video: HTMLVideoElement): Promise<Blob> {
  const vw = video.videoWidth;
  const vh = video.videoHeight;

  if (vw === 0 || vh === 0) {
    throw new Error("Camera not ready");
  }

  let w = vw;
  let h = vh;
  if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(video, 0, 0, w, h);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to capture frame"));
      },
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

export function triggerHaptic() {
  if ("vibrate" in navigator) {
    navigator.vibrate(50);
  }
}

export async function flashTorch(stream: MediaStream, durationMs = 300) {
  const track = stream.getVideoTracks()[0];
  if (!track) return;
  try {
    const capabilities = track.getCapabilities?.() as Record<string, unknown> | undefined;
    if (!capabilities?.torch) return;
    await track.applyConstraints({ advanced: [{ torch: true } as MediaTrackConstraintSet] });
    setTimeout(async () => {
      try {
        await track.applyConstraints({ advanced: [{ torch: false } as MediaTrackConstraintSet] });
      } catch {}
    }, durationMs);
  } catch {}
}

export async function resizeImageFile(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(img.src);
          if (blob) resolve(blob);
          else reject(new Error("Failed to resize image"));
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };
    img.src = URL.createObjectURL(file);
  });
}
