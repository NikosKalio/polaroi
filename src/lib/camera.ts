const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.85;

export async function startCamera(
  videoElement: HTMLVideoElement,
  facingMode: "user" | "environment" = "environment"
): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  });
  videoElement.srcObject = stream;
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
