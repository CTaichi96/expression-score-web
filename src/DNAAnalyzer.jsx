
import React, { useState } from "react";
import { Scatter } from "react-chartjs-2";
import { Chart as ChartJS, LinearScale, PointElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(LinearScale, PointElement, Title, Tooltip, Legend);

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

function exportToCSV(regions) {
  const header = `Start,End,Length,Sequence\n`;
  const rows = regions.map(r => `${r.start},${r.end},${r.length},${r.sequence}\n`).join("");
  const csvText = header + rows;
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "gc_rich_regions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function DNAAnalyzer() {
  const [seq, setSeq] = useState("");
  const [gcRegions, setGcRegions] = useState([]);

  const handleAnalyze = () => {
    const clean = seq.toUpperCase().replace(/[^ACGT]/g, "");
    const result = detectGCStretches(clean);
    setGcRegions(result);
  };

  const chartData = {
    datasets: [
      {
        label: "GC-rich Region",
        data: gcRegions.map((r) => ({ x: r.start, y: r.length })),
        backgroundColor: "rgba(54, 162, 235, 0.7)"
      }
    ]
  };

  const chartOptions = {
    scales: {
      x: {
        title: { display: true, text: "Start Position" }
      },
      y: {
        title: { display: true, text: "Length (bp)" }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            const region = gcRegions[index];
            return `Start: ${region.start}, Len: ${region.length}, Seq: ${region.sequence}`;
          }
        }
      }
    }
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
      <button onClick={handleAnalyze} style={{ marginRight: "1rem", marginBottom: "1rem" }}>
        Analyze GC-rich Regions
      </button>
      {gcRegions.length > 0 && (
        <>
          <button onClick={() => exportToCSV(gcRegions)} style={{ marginBottom: "1rem" }}>
            Export Table as CSV
          </button>
          <div style={{ marginBottom: "2rem" }}>
            <Scatter data={chartData} options={chartOptions} />
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
