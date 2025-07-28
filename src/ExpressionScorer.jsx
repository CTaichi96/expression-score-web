// src/ExpressionScorer.jsx
import React, { useState, useRef, useEffect } from "react";
import SequenceMatrixCanvas from "./SequenceMatrixCanvas";
import ProtParamPanel from "./ProtParamPanel";
import {
  findProteaseSites,
  summarizeProteaseSites,
} from "./protease_analysis_with_summary";

const hydrophobic = new Set(["A","I","L","M","F","W","V","P","G"]);
const hydrophilic = new Set(["S","T","Y","C","N","Q"]);
const allAA = "ACDEFGHIKLMNPQRSTVWY".split("");

function calculateScore(seq) {
  const length = seq.length;
  const aaCounts = {};
  for (let aa of seq) aaCounts[aa] = (aaCounts[aa]||0)+1;

  // Repeat‐peptide score
  let repeatScore = 0;
  for (let n = 2; n <= 5; n++) {
    const seen = {};
    for (let i = 0; i <= seq.length - n; i++) {
      const frag = seq.slice(i, i + n);
      seen[frag] = (seen[frag]||0) + 1;
    }
    repeatScore += Object.values(seen).filter(v => v > 1).length;
  }
  repeatScore = Math.min(repeatScore / 50, 3);

  // Hydrophobic ratio
  const hydCount = Object.entries(aaCounts).reduce(
    (s, [aa, c]) => hydrophobic.has(aa) ? s + c : s,
    0
  );
  const hydroRatio = hydCount / length;
  const hydroScore = hydroRatio > 0.5 ? 2 : 0;

  // Gly/Pro ratio
  const gpCount = (aaCounts["G"]||0) + (aaCounts["P"]||0);
  const gpRatio = gpCount / length;
  const gpScore = gpRatio > 0.25 ? 2 : 0;

  // Length penalty
  const lengthScore = length > 1000 ? 1 : 0;

  // Tripeptide repeats
  const triSeen = {};
  for (let i = 0; i <= seq.length - 3; i++) {
    const tri = seq.slice(i, i + 3);
    triSeen[tri] = (triSeen[tri]||0) + 1;
  }
  const triScore = Math.min(
    Object.values(triSeen).filter(v => v > 5).length / 10,
    2
  );

  const total = repeatScore + hydroScore + gpScore + lengthScore + triScore;
  const level =
    total <= 3 ? "🟢 Low" :
    total <= 6 ? "🟡 Medium" : "🔴 High";

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

function exportAAtoCSV(result) {
  const rows = Object.entries(result.aaCounts)
    .sort((a,b) => b[1] - a[1])
    .map(([aa,c]) => `${aa},${c}\n`).join("");
  const csv = `Amino Acid,Count\n${rows}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "aa_frequencies.csv";
  link.click();
}

export default function ExpressionScorer() {
  const [seq, setSeq] = useState("");
  const [result, setResult] = useState(null);
  const [siteList, setSiteList] = useState([]);
  const [summaryList, setSummaryList] = useState([]);

  const handleAnalyze = () => {
    const clean = seq.replace(/[^A-Z]/gi, "").toUpperCase();
    if (clean.length < 30) {
      alert("Please enter at least 30 amino acids.");
      return;
    }
    const res = calculateScore(clean);
    setResult(res);

    // Protease sites
    const sites = findProteaseSites(clean);
    setSiteList(sites);
    setSummaryList(summarizeProteaseSites(sites));
  };

  return (
    <div style={{ maxWidth: 960, margin: "auto", padding: 16, fontFamily: "Arial, sans-serif" }}>
      <h2>Protein Expression Feasibility Analyzer</h2>
      <textarea
        rows={4}
        value={seq}
        onChange={e => setSeq(e.target.value)}
        placeholder="Paste amino acid sequence (≥30 aa)"
        style={{ width: "100%", padding: 8, marginBottom: 8, fontSize: 14 }}
      />
      <button
        onClick={handleAnalyze}
        style={{
          padding: "8px 16px",
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer"
        }}
      >
        Analyze
      </button>

      {result && (
        <>
          {/* Scoring summary */}
          <div style={{ border: "1px solid #ccc", padding: 16, marginTop: 16, background: "#fafafa" }}>
            <p><b>Sequence Length:</b> {result.length}</p>
            <p><b>Hydrophobic Ratio:</b> {result.hydroRatio}</p>
            <p><b>Gly/Pro Ratio:</b> {result.gpRatio} <span title="Gly + Pro proportion">(ℹ️)</span></p>
            <p><b>Repeat Score:</b> {result.repeatScore}</p>
            <p><b>Tripeptide Score:</b> {result.triScore}</p>
            <p><b>Total Score:</b> {result.total}</p>
            <p style={{ fontSize: 18 }}><b>Risk Level:</b> {result.level}</p>
          </div>

          {/* Amino acid frequencies */}
          <div style={{ marginTop: 24 }}>
            <h3>AA Frequencies</h3>
            <button onClick={() => exportAAtoCSV(result)} style={{ marginBottom: 8 }}>
              Export CSV
            </button>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(result.aaCounts)
                .sort((a,b) => b[1] - a[1])
                .map(([aa,c]) => (
                  <div
                    key={aa}
                    style={{
                      width: 60,
                      padding: 8,
                      textAlign: "center",
                      borderRadius: 4,
                      background: hydrophilic.has(aa) ? "#fed7aa" : "#bfdbfe"
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{aa}</div>
                    <div>{c}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Heatmap */}
          <div style={{ marginTop: 24 }}>
            <h3>AA Distribution Heatmap</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ccc", padding: 2 }}>AA</th>
                    {result.sequence.split("").map((_,i) => (
                      <th key={i} style={{ border: "1px solid #ccc", padding: 2, fontSize: 10 }}>
                        {i+1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allAA.map(aa => (
                    <tr key={aa}>
                      <td style={{ border: "1px solid #ccc", padding: 2, fontWeight: "bold" }}>{aa}</td>
                      {result.sequence.split("").map((c,i) => (
                        <td
                          key={i}
                          style={{
                            border: "1px solid #ccc",
                            width: 16,
                            height: 16,
                            backgroundColor: c===aa ? "#3b82f6" : "transparent"
                          }}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* High‑res PNG canvas */}
          <SequenceMatrixCanvas sequence={result.sequence} filename="sequence_matrix.png" />

          {/* Protease cleavage tables */}
          {siteList.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3>Protease Cleavage Sites</h3>
              <div style={{ overflowX: "auto", marginBottom: 16 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #444" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #444", padding: 8 }}>Enzyme</th>
                      <th style={{ border: "1px solid #444", padding: 8 }}>Site</th>
                      <th style={{ border: "1px solid #444", padding: 8 }}>Position</th>
                      <th style={{ border: "1px solid #444", padding: 8 }}>Context</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siteList.map((row,idx) => (
                      <tr key={idx}>
                        <td style={{ border: "1px solid #444", padding: 8 }}>{row.enzyme}</td>
                        <td style={{ border: "1px solid #444", padding: 8, fontFamily: "monospace" }}>
                          {row.site}
                        </td>
                        <td style={{ border: "1px solid #444", padding: 8 }}>{row.position}</td>
                        <td style={{ border: "1px solid #444", padding: 8, fontFamily: "monospace" }}>
                          {row.context}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3>Protease Cleavage Summary</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #444" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #444", padding: 8 }}>Enzyme</th>
                      <th style={{ border: "1px solid #444", padding: 8 }}>Count</th>
                      <th style={{ border: "1px solid #444", padding: 8 }}>Positions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryList.map((row,idx) => (
                      <tr key={idx}>
                        <td style={{ border: "1px solid #444", padding: 8 }}>{row.enzyme}</td>
                        <td style={{ border: "1px solid #444", padding: 8 }}>{row.count}</td>
                        <td style={{ border: "1px solid #444", padding: 8, fontFamily: "monospace" }}>
                          {row.positions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ExPASy ProtParam metrics */}
          <ProtParamPanel sequence={result.sequence} />
        </>
      )}
    </div>
  );
}
