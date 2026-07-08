"use client";

// Draws realistic-looking sample images on a canvas at runtime, so the demo
// works with zero binary assets and the prescription sample is a real raster
// image that goes through the actual Vision OCR + Gemini pipeline.

export function drawEyeSample(kind: "anemia" | "jaundice"): string {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d")!;

  // skin background
  const skin = ctx.createLinearGradient(0, 0, 0, 480);
  skin.addColorStop(0, "#c89a78");
  skin.addColorStop(1, "#b08363");
  ctx.fillStyle = skin;
  ctx.fillRect(0, 0, 640, 480);

  // eye white (sclera)
  ctx.beginPath();
  ctx.ellipse(320, 220, 220, 110, 0, 0, Math.PI * 2);
  ctx.fillStyle = kind === "jaundice" ? "#e8d48a" : "#f3efe8";
  ctx.fill();

  // iris + pupil
  ctx.beginPath();
  ctx.arc(320, 210, 70, 0, Math.PI * 2);
  ctx.fillStyle = "#4a3526";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(320, 210, 32, 0, Math.PI * 2);
  ctx.fillStyle = "#120c08";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(300, 192, 10, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fill();

  // lower eyelid pulled down showing conjunctiva
  ctx.beginPath();
  ctx.ellipse(320, 345, 190, 60, 0, 0, Math.PI);
  ctx.fillStyle = kind === "anemia" ? "#e7b9b2" : "#c64a4a"; // pale vs healthy red
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(320, 340, 190, 18, 0, 0, Math.PI);
  ctx.fillStyle = kind === "anemia" ? "#dfa9a2" : "#b53e3e";
  ctx.fill();

  // small vessels on sclera
  ctx.strokeStyle = "rgba(200,80,80,0.35)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    const y = 180 + i * 14;
    ctx.moveTo(130 + i * 10, y);
    ctx.bezierCurveTo(200, y - 12, 260, y + 10, 300 - i * 8, y);
    ctx.stroke();
  }

  // eyelid edges
  ctx.strokeStyle = "#8a6248";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(320, 220, 222, 112, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();

  return canvas.toDataURL("image/jpeg", 0.9);
}

export function drawPrescriptionSample(): Promise<string> {
  return new Promise((resolve) => {
    const render = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1040;
      const ctx = canvas.getContext("2d")!;

      // paper
      ctx.fillStyle = "#f7f3e9";
      ctx.fillRect(0, 0, 800, 1040);
      ctx.strokeStyle = "#d8d0bd";
      ctx.lineWidth = 2;
      ctx.strokeRect(14, 14, 772, 1012);

      // header
      ctx.fillStyle = "#1a3c6e";
      ctx.font = "bold 30px Georgia, serif";
      ctx.fillText("Dr. Rahman Hossain, MBBS", 40, 70);
      ctx.font = "20px Georgia, serif";
      ctx.fillStyle = "#33415c";
      ctx.fillText("General Physician — Mymensingh Medical College Hospital", 40, 100);
      ctx.fillText("Reg No: BMDC A-45821   |   Chamber: Charpara, Mymensingh", 40, 128);
      ctx.strokeStyle = "#1a3c6e";
      ctx.beginPath();
      ctx.moveTo(40, 150);
      ctx.lineTo(760, 150);
      ctx.stroke();

      // patient line
      ctx.fillStyle = "#222";
      ctx.font = "22px 'Comic Sans MS', cursive";
      ctx.fillText("Patient: Karim Uddin, 45M", 40, 195);
      ctx.fillText("Date: 08/06/2026", 560, 195);
      ctx.fillText("C/C: Fever 3 days, body ache, gastric pain", 40, 230);

      // Rx symbol
      ctx.font = "bold 52px Georgia, serif";
      ctx.fillStyle = "#1a3c6e";
      ctx.fillText("℞", 40, 300);

      // medicines, handwriting-ish
      ctx.fillStyle = "#1d2733";
      ctx.font = "26px 'Comic Sans MS', cursive";
      const lines = [
        "1.  Tab. Napa 500 mg",
        "     ১ + ১ + ১  —  খাবার পরে  —  ৫ দিন",
        "",
        "2.  Cap. Seclo 20 mg",
        "     ১ + ০ + ০  —  খালি পেটে  —  ১৪ দিন",
        "",
        "3.  Tab. Zinc-B 20 mg",
        "     ০ + ০ + ১  —  রাতে  —  ১০ দিন",
      ];
      let y = 360;
      for (const line of lines) {
        ctx.fillText(line, 70, y);
        y += 46;
      }

      // advice
      ctx.font = "24px 'Comic Sans MS', cursive";
      ctx.fillText("Advice:  প্রচুর পানি খাবেন, বিশ্রাম নিবেন।", 40, y + 40);
      ctx.fillText("জ্বর ৩ দিনের বেশি থাকলে CBC, NS1 করাবেন।", 40, y + 80);

      // signature
      ctx.font = "italic 30px cursive";
      ctx.fillStyle = "#1a3c6e";
      ctx.fillText("R. Hossain", 560, 960);
      ctx.beginPath();
      ctx.moveTo(540, 975);
      ctx.lineTo(740, 975);
      ctx.strokeStyle = "#1a3c6e";
      ctx.stroke();

      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };

    // Make sure the Bangla font is loaded before drawing
    if (document.fonts?.ready) {
      document.fonts.ready.then(render).catch(render);
    } else {
      render();
    }
  });
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(",");
  const mime = meta.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
