// src/SequenceMatrixCanvas.jsx
import React, { useRef, useEffect } from "react";

const hydrophilic = new Set(["S", "T", "Y", "C", "N", "Q"]);
const allAA = "ACDEFGHIKLMNPQRSTVWY".split("");

export default function SequenceMatrixCanvas({
  sequence,
  filename = "sequence_matrix.png",
}) {
  const canvasRef = useRef();

  useEffect(() => {
    if (!sequence || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const cellSize = 5;
    const cellHeight = 20;
    const labelPadding = 40;
    const tickInterval = 20;
    const scale = 2; // for high‑res

    const width = sequence.length * cellSize + labelPadding;
    const height = allAA.length * cellHeight + labelPadding;

    // Set up high‑res backing store
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(scale, scale);

    // White background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);

    // Axis labels
    ctx.fillStyle = "#000";
    ctx.font = "14px sans-serif";
    allAA.forEach((aa, i) => {
      const y = labelPadding + i * cellHeight + cellHeight / 1.5;
      ctx.fillText(aa, 5, y);
    });
    for (let i = 0; i < sequence.length; i += tickInterval) {
      const x = labelPadding + i * cellSize;
      ctx.fillText((i + 1).toString(), x, 20);
    }

    // Draw bars
    for (let i = 0; i < sequence.length; i++) {
      const aa = sequence[i];
      const row = allAA.indexOf(aa);
      if (row === -1) continue;
      const x = labelPadding + i * cellSize;
      const y = labelPadding + row * cellHeight + 3;
      ctx.fillStyle = hydrophilic.has(aa) ? "#f97316" : "#3b82f6";
      ctx.fillRect(x, y, 2, cellHeight - 6);
    }
  }, [sequence]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use toBlob for better performance/memory
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>Amino Acid Position Matrix</h3>
      <canvas
        ref={canvasRef}
        style={{
          border: "1px solid #ccc",
          display: "block",
          maxWidth: "100%",
        }}
      />
      <button
        onClick={handleDownload}
        style={{
          marginTop: "0.5rem",
          padding: "0.4rem 0.8rem",
          backgroundColor: "#e5e7eb",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Download PNG
      </button>
    </div>
  );
}
