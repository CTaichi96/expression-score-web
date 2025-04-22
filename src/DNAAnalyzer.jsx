
import React, { useState } from "react";
import { Scatter, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

function detectGCStretches(sequence) {
  const stretches = [];
  let i = 0;
  while (i < sequence.length) {
    if (sequence[i] === "G" || sequence[i] === "C") {
      let start = i;
      let stretch = "";
      while (i < sequence.length && (sequence[i] === "G" || sequence[i] === "C")) {
        stretch += sequence[i];
        i++;
      }
      stretches.push({
        start: start + 1,
        end: i,
        length: i - start,
        sequence: stretch
      });
    } else {
      i++;
    }
  }
  return stretches;
}

function computeGCPercent(sequence, windowSize = 30) {
  const result = [];
  for (let i = 0; i <= sequence.length - windowSize; i++) {
    const window = sequence.slice(i, i + windowSize);
    const gcCount = window.split("").filter((b) => b === "G" || b === "C").length;
    result.push({ x: i + 1, y: +(gcCount / windowSize).toFixed(3) });
  }
  return result;
}

export default function DNAAnalyzer() {
  const [seq, setSeq] = useState("");
  const [gcRegions, setGcRegions] = useState([]);
  const [gcPercent, setGcPercent] = useState([]);

  const handleAnalyze = () => {
    const clean = seq.toUpperCase().replace(/[^ACGT]/g, "");
    const result = detectGCStretches(clean);
    const gcWindow = computeGCPercent(clean);
    setGcRegions(result);
    setGcPercent(gcWindow);
  };

  const scatterData = {
    datasets: [
      {
        label: "GC-rich Region",
        data: gcRegions.map((r) => ({ x: r.start, y: r.length })),
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
    ],
  };

  const lineData = {
    labels: gcPercent.map((p) => p.x),
    datasets: [
      {
        label: "GC% (30bp sliding)",
        data: gcPercent.map((p) => p.y),
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: { title: { display: true, text: "Position" } },
      y: { title: { display: true, text: "Value" } },
    },
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>DNA GC-Rich Region Analyzer</h2>
      <textarea
        rows={6}
        style={{ width: "100%", marginBottom: "1rem" }}
        placeholder="Paste DNA sequence (A/T/G/C only)"
        value={seq}
        onChange={(e) => setSeq(e.target.value)}
      />
      <button
        onClick={handleAnalyze}
        style={{
          marginRight: "1rem",
          marginBottom: "1rem",
          backgroundColor: "#2563eb",
          color: "white",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Analyze GC-rich Regions
      </button>

      {gcRegions.length > 0 && (
        <>
          <div style={{ marginBottom: "2rem" }}>
            <h3>GC-rich Region Lengths (Scatter Plot)</h3>
            <Scatter data={scatterData} options={commonOptions} />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h3>GC% Sliding Window (Line Chart)</h3>
            <Line data={lineData} options={commonOptions} />
          </div>

          <h3>Detected GC-Rich Regions: {gcRegions.length}</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ccc", padding: "4px" }}>Start</th>
                  <th style={{ border: "1px solid #ccc", padding: "4px" }}>End</th>
                  <th style={{ border: "1px solid #ccc", padding: "4px" }}>Length</th>
                  <th style={{ border: "1px solid #ccc", padding: "4px" }}>Sequence</th>
                </tr>
              </thead>
              <tbody>
                {gcRegions.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ border: "1px solid #ccc", padding: "4px" }}>{r.start}</td>
                    <td style={{ border: "1px solid #ccc", padding: "4px" }}>{r.end}</td>
                    <td style={{ border: "1px solid #ccc", padding: "4px" }}>{r.length}</td>
                    <td style={{ border: "1px solid #ccc", padding: "4px", fontFamily: "monospace" }}>{r.sequence}</td>
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
