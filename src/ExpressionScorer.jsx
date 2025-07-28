
import React, { useState } from "react";
import { findProteaseSites, summarizeProteaseSites } from "./protease_analysis_with_summary";

export default function ExpressionScorer() {
  const [sequence, setSequence] = useState("");
  const [siteList, setSiteList] = useState([]);
  const [summaryList, setSummaryList] = useState([]);

  const handleAnalyze = () => {
    const cleanedSequence = sequence.replace(/[^A-Z]/gi, "").toUpperCase();
    const sites = findProteaseSites(cleanedSequence);
    setSiteList(sites);
    const summary = summarizeProteaseSites(sites);
    setSummaryList(summary);
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "800px", margin: "auto" }}>
      <h2>Protein Sequence Analysis</h2>
      <textarea
        rows={4}
        value={sequence}
        onChange={(e) => setSequence(e.target.value)}
        placeholder="Enter protein sequence"
        style={{ width: "100%", fontSize: "1rem", marginBottom: "1rem" }}
      />
      <button
        onClick={handleAnalyze}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Analyze
      </button>

      {siteList.length > 0 && (
        <>
          <h3 style={{ marginTop: "1.5rem" }}>Protease Cleavage Sites</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1rem" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}>Enzyme</th>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}>Site</th>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}>Position</th>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}>Context</th>
                </tr>
              </thead>
              <tbody>
                {siteList.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>{row.enzyme}</td>
                    <td style={{ border: "1px solid #ccc", padding: "8px", fontFamily: "monospace" }}>{row.site}</td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>{row.position}</td>
                    <td style={{ border: "1px solid #ccc", padding: "8px", fontFamily: "monospace" }}>{row.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Protease Cleavage Summary</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}>Enzyme</th>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}>Count</th>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}>Positions</th>
                </tr>
              </thead>
              <tbody>
                {summaryList.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>{row.enzyme}</td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>{row.count}</td>
                    <td style={{ border: "1px solid #ccc", padding: "8px", fontFamily: "monospace" }}>{row.positions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
