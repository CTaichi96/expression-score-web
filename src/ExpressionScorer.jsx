
import React, { useState } from "react";
import { findCleavageSites } from "./protease_analysis";

function ExpressionScorer() {
  const [sequence, setSequence] = useState("");
  const [cleavageTable, setCleavageTable] = useState([]);

  const handleAnalyze = () => {
    const cleanedSequence = sequence.replace(/[^A-Z]/gi, "").toUpperCase();
    const cleavageData = findCleavageSites(cleanedSequence);
    setCleavageTable(cleavageData);
  };

  return (
    <div>
      <h2>Protein Sequence Analysis</h2>
      <textarea
        rows={6}
        value={sequence}
        onChange={(e) => setSequence(e.target.value)}
        placeholder="Enter protein sequence"
        style={{ width: "100%", fontSize: "1rem" }}
      />
      <button onClick={handleAnalyze}>Analyze</button>

      {cleavageTable.length > 0 && (
        <div>
          <h3>Protease Cleavage Sites</h3>
          <table border="1" cellPadding="5" style={{ marginTop: "10px" }}>
            <thead>
              <tr>
                <th>Enzyme</th>
                <th>Pattern</th>
                <th>Position</th>
                <th>Context</th>
              </tr>
            </thead>
            <tbody>
              {cleavageTable.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.enzyme}</td>
                  <td>{row.pattern}</td>
                  <td>{row.position}</td>
                  <td>{row.context}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ExpressionScorer;
