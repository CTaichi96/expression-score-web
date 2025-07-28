// src/ProtParamPanel.jsx
import React, { useState } from "react";

export default function ProtParamPanel({ sequence }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProtParam = async () => {
    setLoading(true);
    setError("");
    setMetrics(null);

    // ExPASy ProtParam URL
    const target = `https://web.expasy.org/protparam/?sequence=${encodeURIComponent(
      sequence
    )}`;

    // use the JSON endpoint so we get { contents }
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(
      target
    )}`;

    try {
      const res = await fetch(proxy);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const { contents: html } = await res.json();

      // parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const out = {};

      doc.querySelectorAll("table tbody tr").forEach((tr) => {
        const label = tr.querySelector("th")?.textContent.trim();
        const value = tr.querySelector("td")?.textContent.trim();
        if (!label || !value) return;
        if (
          label === "Instability index" ||
          label === "Aliphatic index" ||
          label === "Grand average of hydropathicity"
        ) {
          out[label] = value;
        }
      });

      if (Object.keys(out).length === 0) {
        throw new Error("No metrics found in response");
      }
      setMetrics(out);
    } catch (e) {
      console.error(e);
      setError(
        "Unable to fetch ProtParam. " +
          "You can try the [ProtParam page](" +
          target +
          ") directly."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h3>ProtParam (ExPASy) Parameters</h3>
      {!metrics && !loading && !error && (
        <button onClick={fetchProtParam}>
          Fetch ProtParam
        </button>
      )}
      {loading && <p>Loading…</p>}
      {error && (
        <p style={{ color: "red" }}>
          {error}{" "}
          <a
            href={`https://web.expasy.org/protparam/?sequence=${encodeURIComponent(
              sequence
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open ProtParam
          </a>
        </p>
      )}
      {metrics && (
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            marginTop: 8,
          }}
        >
          <tbody>
            {Object.entries(metrics).map(([k, v]) => (
              <tr key={k}>
                <th
                  style={{
                    textAlign: "left",
                    padding: 8,
                    border: "1px solid #444",
                    background: "#f0f0f0",
                  }}
                >
                  {k}
                </th>
                <td
                  style={{
                    padding: 8,
                    border: "1px solid #444",
                    fontFamily: "monospace",
                  }}
                >
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
