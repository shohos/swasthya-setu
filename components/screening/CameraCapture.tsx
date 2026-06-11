"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImageIcon, RefreshCcw } from "lucide-react";

export default function CameraCapture({
  onCapture,
  onUseSample,
  guideColor = "#2dd4bf",
  captureLabel = "Capture",
}: {
  onCapture: (dataUrl: string) => void;
  onUseSample: () => void;
  guideColor?: string;
  captureLabel?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOn(false);
  }, []);

  useEffect(() => stop, [stop]);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamOn(true);
    } catch {
      setError("Camera unavailable or permission denied — use the sample image instead.");
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL("image/jpeg", 0.9));
    stop();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative card-surface overflow-hidden aspect-[4/3] flex items-center justify-center">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        {camOn && (
          <>
            {/* circular focus guide */}
            <div
              className="absolute w-40 h-40 rounded-full border-2 border-dashed pointer-events-none"
              style={{ borderColor: guideColor }}
            />
            <div className="absolute w-px h-10 pointer-events-none" style={{ background: guideColor }} />
            <div className="absolute h-px w-10 pointer-events-none" style={{ background: guideColor }} />
          </>
        )}
        {!camOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500 text-sm bg-ink/80">
            <Camera className="w-8 h-8" />
            {error ?? "Camera preview will appear here"}
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {!camOn ? (
          <button onClick={start} className="btn-secondary text-sm flex items-center gap-2">
            <Camera className="w-4 h-4" /> Start Camera
          </button>
        ) : (
          <>
            <button onClick={capture} className="btn-primary text-sm flex items-center gap-2">
              <Camera className="w-4 h-4" /> {captureLabel}
            </button>
            <button onClick={stop} className="btn-secondary text-sm flex items-center gap-2">
              <RefreshCcw className="w-4 h-4" /> Stop
            </button>
          </>
        )}
        <button onClick={onUseSample} className="btn-secondary text-sm flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Use Sample Image
        </button>
      </div>
    </div>
  );
}
