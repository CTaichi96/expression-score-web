import React, { useState } from "react";

const hydrophobic = new Set(["A", "I", "L", "M", "F", "W", "V", "P", "G"]);
const glyPro = new Set(["G", "P"]);

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
    repeatScore += Object.values(seen).filter(v => v > 1).length;
  }
  repeatScore = Math.min(repeatScore / 50, 3);

  const hydroCount = Object.entries(aaCounts).reduce(
    (sum, [aa, count]) => (hydrophobic.has(aa) ? sum + count : sum),
    0
  );
  const hydroRatio = hydroCount / length;
  const hydroScore = hydroRatio > 0.5 ? 2 : 0;

  const gpCount = Object.entries(aaCounts).reduce(
    (sum, [aa, count]) => (glyPro.has(aa) ? sum + count : sum),
    0
  );
  const gpRatio = gpCount / length;
  const gpScore = gpRatio > 0.25 ? 2 : 0;

  const lengthScore = length > 1000 ? 1 : 0;

  const triSeen = {};
  for (let i = 0; i <= seq.length - 3; i++) {
    const tri = seq.slice(i, i + 3);
    triSeen[tri] = (triSeen[tri] || 0) + 1;
  }
  const triScore = Math.min(Object.values(triSeen).filter(v => v > 5).length / 10, 2);

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
    sequence: seq
  };
}

function SimpleHeatmap({ sequence }) {
  const aaList = "ACDEFGHIKLMNPQRSTVWY".split("");
  const positions = Array.from({ length: sequence.length }, (_, i) => i);
  const matrix = aaList.map(rowAa =>
    positions.map(pos => (sequence[pos] === rowAa ? 1 : 0))
  );

  return (
    <div className="overflow-x-auto">
      <table className="table-auto border-collapse border border-gray-300 text-xs">
        <thead>
          <tr>
            <th className="border px-1">AA</th>
            {positions.map((_, idx) => (
              <th key={idx} className="border px-1">
                {idx + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {aaList.map((aa, rowIdx) => (
            <tr key={rowIdx}>
              <td className="border font-bold text-center px-1">{aa}</td>
              {matrix[rowIdx].map((val, colIdx) => (
                <td
                  key={colIdx}
                  className={`border w-4 h-4 text-center ${
                    val === 1 ? "bg-blue-500 text-white" : ""
                  }`}
                >
                  {val === 1 ? "■" : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Protein Expression Feasibility Analyzer
      </h1>
      <textarea
        placeholder="Paste your amino acid sequence (e.g., MKWVPPSLLLLLSLL...)"
        rows={6}
        value={seq}
        onChange={(e) => setSeq(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded mb-4"
      />
      <button
        onClick={handleAnalyze}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Analyze Expression Score
      </button>

      {result && (
        <>
          <div className="border p-4 mt-6 rounded shadow space-y-2">
            <p>
              <strong>Sequence Length:</strong> {result.length}
            </p>
            <p>
              <strong>Hydrophobic Ratio:</strong> {result.hydroRatio}
            </p>
            <p>
              <strong>Gly/Pro Ratio:</strong> {result.gpRatio}
            </p>
            <p>
              <strong>Repeat Score:</strong> {result.repeatScore}
            </p>
            <p>
              <strong>Tripeptide Score:</strong> {result.triScore}
            </p>
            <p className="text-lg">
              <strong>Total Expression Difficulty Score:</strong> {result.total}
            </p>
            <p className="text-xl font-bold">Risk Level: {result.level}</p>
          </div>

          {/* Amino Acid Frequencies */}
          <div className="mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold mb-2">
                Amino Acid Frequencies
              </h2>
              <button
                onClick={() => exportToCSV(result)}
                className="text-sm px-3 py-1 bg-gray-200 rounded"
              >
                Export CSV
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(result.aaCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([aa, count]) => (
                  <div
                    key={aa}
                    className={`p-2 rounded text-center w-16 ${
                      ["S", "T", "Y", "C", "N", "Q"].includes(aa)
                        ? "bg-orange-200"
                        : "bg-blue-100"
                    }`}
                  >
                    <div className="font-bold text-lg">{aa}</div>
                    <div>{count}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Amino Acid Heatmap */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">
              Amino Acid Distribution Heatmap
            </h2>
            <SimpleHeatmap sequence={result.sequence} />
          </div>
        </>
      )}
    </div>
  );
}
