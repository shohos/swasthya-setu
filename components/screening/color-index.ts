"use client";

// On-device color analysis: samples the captured eye image on a canvas and
// computes the clinical color index locally — no cloud call needed. The index
// is sent to /api/screening alongside the image, where Roboflow CLIP adds a
// zero-shot plausibility check.

/**
 * Computes the color index for a screening image.
 * - anemia:   conjunctival redness  = mean(R − (G+B)/2) over the central region
 * - jaundice: scleral yellowness    = mean((R+G)/2 − B) over the central region
 */
export function computeColorIndex(
  dataUrl: string,
  type: "anemia" | "jaundice"
): Promise<number | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        // Downsample for speed — color statistics survive scaling.
        const w = 160;
        const h = Math.max(1, Math.round((img.height / img.width) * w));
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);

        // Sample the central 60% box — where the guide circle points the user.
        const x0 = Math.floor(w * 0.2);
        const y0 = Math.floor(h * 0.2);
        const bw = Math.floor(w * 0.6);
        const bh = Math.floor(h * 0.6);
        const { data } = ctx.getImageData(x0, y0, bw, bh);

        let sum = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          sum += type === "anemia" ? r - (g + b) / 2 : (r + g) / 2 - b;
          count++;
        }
        resolve(count > 0 ? Number((sum / count).toFixed(1)) : null);
      } catch {
        resolve(null); // e.g. canvas tainted — server falls back to CLIP-only
      }
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}
