// src/SequenceAnalyzerApp.jsx
import React, { useState } from "react";
import ExpressionScorer from "./ExpressionScorer";
import DNAAnalyzer from "./DNAAnalyzer";

export default function SequenceAnalyzerApp() {
  const [tab, setTab] = useState("protein");

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Sequence Analysis</h1>
      <div style={{ margin: "1rem 0" }}>
        <button
          onClick={() => setTab("protein")}
          style={{
            marginRight: 8,
            padding: "0.5rem 1rem",
            backgroundColor: tab === "protein" ? "#2563eb" : "#e5e7eb",
            color: tab === "protein" ? "#fff" : "#000",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          🧪 Protein Analysis
        </button>
        <button
          onClick={() => setTab("dna")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: tab === "dna" ? "#2563eb" : "#e5e7eb",
            color: tab === "dna" ? "#fff" : "#000",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          🧬 DNA Analysis
        </button>
      </div>
      {tab === "protein" && <ExpressionScorer />}
      {tab === "dna" && <DNAAnalyzer />}
    </div>
  );
}
