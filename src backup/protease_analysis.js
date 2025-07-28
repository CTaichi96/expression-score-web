
import React from "react";

export function findCleavageSites(sequence) {
  const rules = {
    "Pep4 (Proteinase A)": ["K", "R"],
    "Prb1 (Proteinase B)": ["K", "R"],
    "Kex2": ["KR", "RR", "RRR"],
    "Ste13": ["XP", "XPX"],
    "Carboxypeptidase Y": [],  // Not matchable in sequence directly
    "Trypsin": ["K", "R"],
    "Chymotrypsin": ["F", "Y", "W", "L"],
    "Thrombin": ["LVPRGS"]
  };

  const results = [];

  for (const [enzyme, patterns] of Object.entries(rules)) {
    for (const pattern of patterns) {
      const len = pattern.length;
      for (let i = 0; i <= sequence.length - len; i++) {
        const seg = sequence.slice(i, i + len);
        let match = true;
        for (let j = 0; j < len; j++) {
          if (pattern[j] !== "X" && pattern[j] !== seg[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          results.push({
            enzyme,
            pattern,
            position: i + 1,
            context: sequence.slice(Math.max(0, i - 3), i + len + 3)
          });
        }
      }
    }
  }
  return results;
}
