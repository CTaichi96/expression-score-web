
import React, { useState } from "react";
import ExpressionScorer from "./ExpressionScorer";
import DNAAnalyzer from "./DNAAnalyzer";

export default function SequenceAnalyzerApp() {
  const [activeTab, setActiveTab] = useState("protein");

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Sequence Analysis</h1>
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={() => setActiveTab("protein")}
          style={{
            marginRight: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: activeTab === "protein" ? "#2563eb" : "#e5e7eb",
            color: activeTab === "protein" ? "white" : "black",
            border: "none",
            borderRadius: "4px"
          }}
        >
          🧪 蛋白序列分析
        </button>
        <button
          onClick={() => setActiveTab("dna")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: activeTab === "dna" ? "#2563eb" : "#e5e7eb",
            color: activeTab === "dna" ? "white" : "black",
            border: "none",
            borderRadius: "4px"
          }}
        >
          🧬 DNA 序列分析
        </button>
      </div>

      {activeTab === "protein" && <ExpressionScorer />}
      {activeTab === "dna" && <DNAAnalyzer />}
    </div>
  );
}
