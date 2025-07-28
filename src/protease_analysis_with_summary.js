// src/protease_analysis_with_summary.js

export const proteaseRecognitionSites = {
  Kex2:           { regex: /[KR]{2}[A-Z]/g,   description: "K/R-K/R-X" },
  Prb1:           { regex: /[DE][A-Z]{1,2}[A-Z]/g, description: "D/E-X" },
  Ste13:          { regex: /[AE][A-Z][A-Z]/g, description: "A/E-X-X" },
  Pep4:           { regex: /[FL][A-Z]{2}/g,   description: "F/L-X-X" },
  Trypsin:           { regex: /[KR](?!P)/g,      description: "Trypsin (K/R not followed by P)" },
  Chymotrypsin:           { regex: /[FYW](?!P)/g,     description: "Chymotrypsin (F/Y/W not followed by P)" },
  Thrombin:         { regex: /[R](?!P)/g,       description: "Thrombin (R not followed by P)" },
  Carboxypeptidase:        { regex: /[A-Z]$/g,        description: "Carboxypeptidase Y (C‑terminal residue)" },
};

export function findProteaseSites(sequence) {
  const results = [];

  for (const [enzyme, { regex: proto }] of Object.entries(proteaseRecognitionSites)) {
    // Create a fresh, global RegExp so lastIndex always starts at 0
    const flags = proto.flags.includes("g") ? proto.flags : proto.flags + "g";
    const regex = new RegExp(proto.source, flags);

    let match;
    while ((match = regex.exec(sequence)) !== null) {
      results.push({
        enzyme,
        site: match[0],
        position: match.index + 1,  // 1‑based
        context: sequence.substring(
          Math.max(0, match.index - 3),
          match.index + match[0].length + 3
        ),
      });
    }
  }

  return results;
}

export function summarizeProteaseSites(siteList) {
  const summary = {};
  for (const { enzyme, position } of siteList) {
    if (!summary[enzyme]) {
      summary[enzyme] = { count: 0, positions: [] };
    }
    summary[enzyme].count++;
    summary[enzyme].positions.push(position);
  }
  return Object.entries(summary).map(([enzyme, data]) => ({
    enzyme,
    count: data.count,
    positions: data.positions.sort((a, b) => a - b).join(", "),
  }));
}
