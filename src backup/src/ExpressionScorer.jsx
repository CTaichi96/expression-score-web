// 🧩 本文件为 ExpressionScorer.jsx
// 包含表达评分器 + 氨基酸频率图 + Gly/Pro Tooltip + PNG 可视化矩阵

import React, { useState, useRef, useEffect } from "react";

const hydrophobic = new Set(["A", "I", "L", "M", "F", "W", "V", "P", "G"]);
const hydrophilic = new Set(["S", "T", "Y", "C", "N", "Q"]);
const allAA = "ACDEFGHIKLMNPQRSTVWY".split("");

function calculateScore(seq) {
  const length = seq.length;
  const aaCounts = {};
  for (let aa of seq) {
    aaCounts[aa] = (aaCounts[aa] || 0) + 1;
  }

  let repeatScore = 0;
  for (let n = 2; n <= 5; n++) {
    const seen = {};
    for (let i = 0; i <= seq.length - n; i++) {
      const frag = seq.slice(i, i + n);
      seen[frag] = (seen[frag] || 0) + 1;
    }
    repeatScore += Object.values(seen).filter((v) => v > 1).length;
  }
  repeatScore = Math.min(repeatScore / 50, 3);

  const hydroCount = Object.entries(aaCounts).reduce(
    (sum, [aa, count]) => (hydrophobic.has(aa) ? sum + count : sum),
    0
  );
  const hydroRatio = hydroCount / length;
  const hydroScore = hydroRatio > 0.5 ? 2 : 0;

  const gpCount = (aaCounts["G"] || 0) + (aaCounts["P"] || 0);
  const gpRatio = gpCount / length;
  const gpScore = gpRatio > 0.25 ? 2 : 0;

  const lengthScore = length > 1000 ? 1 : 0;

  const triSeen = {};
  for (let i = 0; i <= seq.length - 3; i++) {
    const tri = seq.slice(i, i + 3);
    triSeen[tri] = (triSeen[tri] || 0) + 1;
  }
  const triScore = Math.min(
    Object.values(triSeen).filter((v) => v > 5).length / 10,
    2
  );

  const total = repeatScore + hydroScore + gpScore + lengthScore + triScore;
  const level = total <= 3 ? "🟢 Low" : total <= 6 ? "🟡 Medium" : "🔴 High";

  return {
    length,
    hydroRatio: hydroRatio.toFixed(2),
    gpRatio: gpRatio.toFixed(2),
    repeatScore: repeatScore.toFixed(2),
    triScore: triScore.toFixed(2),
    total: total.toFixed(2),
    level,
    aaCounts,
    sequence: seq,
  };
}
function exportToCSV(result) {
  const rows = Object.entries(result.aaCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([aa, count]) => `${aa},${count}`);
  const csvContent = "Amino Acid,Count\n" + rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "amino_acid_frequencies.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 🔧 高分辨率氨基酸矩阵图
function SequenceMatrixCanvas({ sequence, filename = "sample_name.png" }) {
  const canvasRef = useRef();

  useEffect(() => {
    if (!sequence || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const cellSize = 5;
    const cellHeight = 20;
    const labelPadding = 40;
    const tickInterval = 20;
    const canvasScale = 2;

    const width = sequence.length * cellSize + labelPadding;
    const height = 20 * cellHeight + labelPadding;

    canvas.width = width * canvasScale;
    canvas.height = height * canvasScale;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.scale(canvasScale, canvasScale);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "black";
    allAA.forEach((aa, i) => {
      const y = labelPadding + i * cellHeight + cellHeight / 1.5;
      ctx.fillText(aa, 5, y);
    });

    for (let i = 0; i < sequence.length; i += tickInterval) {
      const x = labelPadding + i * cellSize;
      ctx.fillText((i + 1).toString(), x, 20);
    }

    for (let i = 0; i < sequence.length; i++) {
      const aa = sequence[i];
      const rowIndex = allAA.indexOf(aa);
      if (rowIndex === -1) continue;
      const x = labelPadding + i * cellSize;
      const y = labelPadding + rowIndex * cellHeight + 3;
      ctx.fillStyle = hydrophilic.has(aa) ? "#f97316" : "#3b82f6";
      ctx.fillRect(x, y, 2, cellHeight - 6);
    }
  }, [sequence]);

  const handleDownload = () => {
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.click();
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
        Amino Acid Position Matrix (PNG Exportable)
      </h2>
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
          borderRadius: "4px",
          border: "none",
        }}
      >
        Download PNG
      </button>
    </div>
  );
}
export default function ExpressionScorer() {
  const [seq, setSeq] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = () => {
    const input = seq.replace(/[^A-Z]/gi, "").toUpperCase();
    if (input.length < 30) {
      alert("Please enter a valid protein sequence (min 30 aa).");
      return;
    }
    const res = calculateScore(input);
    setResult(res);
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Protein Expression Feasibility Analyzer
      </h1>

      <textarea
        placeholder="Paste your amino acid sequence (e.g., MKWVPPSLLLLLSLL...)"
        rows={6}
        value={seq}
        onChange={(e) => setSeq(e.target.value)}
        style={{
          width: "100%",
          border: "1px solid #ccc",
          padding: "0.5rem",
          borderRadius: "4px",
          marginBottom: "1rem",
        }}
      />
      <button
        onClick={handleAnalyze}
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          border: "none",
        }}
      >
        Analyze Expression Score
      </button>

      {result && (
        <>
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "1rem",
              marginTop: "1.5rem",
              backgroundColor: "#f9f9f9",
            }}
          >
            <p><strong>Sequence Length:</strong> {result.length}</p>
            <p><strong>Hydrophobic Ratio:</strong> {result.hydroRatio}</p>
            <p>
              <strong>Gly/Pro Ratio:</strong> {result.gpRatio}
              <span
                style={{
                  marginLeft: "0.4rem",
                  cursor: "help",
                  borderBottom: "1px dotted gray",
                }}
                title="Gly/Pro Ratio 表示 Glycine (G) 与 Proline (P) 在序列中所占比例。G 会使结构柔软，P 会打断螺旋结构。高于 25% 可能导致表达困难。"
              >
                ℹ️
              </span>
            </p>
            <p><strong>Repeat Score:</strong> {result.repeatScore}</p>
            <p><strong>Tripeptide Score:</strong> {result.triScore}</p>
            <p><strong>Total Expression Difficulty Score:</strong> {result.total}</p>
            <p style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
              Risk Level: {result.level}
            </p>
          </div>

          <div style={{ marginTop: "2rem" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem"
            }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "bold" }}>Amino Acid Frequencies</h2>
              <button
                onClick={() => exportToCSV(result)}
                style={{
                  fontSize: "0.875rem",
                  padding: "0.25rem 0.75rem",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "4px",
                  border: "none",
                }}
              >
                Export CSV
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {Object.entries(result.aaCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([aa, count]) => (
                  <div
                    key={aa}
                    style={{
                      padding: "0.5rem",
                      borderRadius: "4px",
                      textAlign: "center",
                      width: "60px",
                      backgroundColor: hydrophilic.has(aa)
                        ? "#fed7aa"
                        : "#bfdbfe",
                    }}
                  >
                    <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>{aa}</div>
                    <div>{count}</div>
                  </div>
                ))}
            </div>
          </div>

          <SequenceMatrixCanvas sequence={result.sequence} filename="sample_name.png" />
        </>
      )}
    </div>
  );
}
