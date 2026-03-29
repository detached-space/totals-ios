// ============================================
// DEFENSIVE PARSER
// ============================================
const Parser = {
  // Parse dirty number strings: "1,500.00." -> 1500.00
  parseAmount(str) {
    if (str === null || str === undefined || str === "") return 0;
    if (typeof str === "number") return str;
    // Remove commas and trailing dots
    const cleaned = String(str).replace(/,/g, "").replace(/\.+$/, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  },

  // Parse NDJSON (Newline Delimited JSON)
  // Handles concatenated objects on a single line (e.g. {...}{...})
  parseNDJSON(raw) {
    if (!raw || raw.trim() === "") {
      return [];
    }
    const lines = raw.trim().split("\n");
    const results = [];
    for (const line of lines) {
      var trimmed = line.trim();
      if (!trimmed) continue;
      try {
        results.push(JSON.parse(trimmed));
      } catch (e) {
        // Try splitting concatenated JSON objects: }{
        if (trimmed.indexOf("}{") !== -1) {
          var parts = trimmed.split(/\}\s*\{/);
          for (var pi = 0; pi < parts.length; pi++) {
            var part = (pi > 0 ? "{" : "") + parts[pi] + (pi < parts.length - 1 ? "}" : "");
            try { results.push(JSON.parse(part)); } catch (e2) {}
          }
        }
      }
    }
    return results;
  },

  // Parse banks JSON
  parseBanks(raw) {
    if (!raw || raw.trim() === "") {
      return { banks: [] };
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to parse banks:", e);
      return { banks: [] };
    }
  },

  // Parse failed transactions log (NDJSON: {message, timestamp})
  parseFailed(raw) {
    if (!raw || raw.trim() === "") {
      return [];
    }
    var lines = raw.trim().split("\n");
    var results = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      try {
        var obj = JSON.parse(line);
        if (obj.message !== undefined) {
          results.push(obj);
        }
      } catch (e) {
        // Legacy plain-text line
        results.push({ message: line, timestamp: null });
      }
    }
    return results;
  },
};

// ============================================
// CATEGORIES
// ============================================
const CATEGORIES = {
  Food: { color: "#f97316", type: "expense" },
  Transport: { color: "#3b82f6", type: "expense" },
  Utilities: { color: "#a855f7", type: "expense" },
  Shopping: { color: "#ec4899", type: "expense" },
  Entertainment: { color: "#eab308", type: "expense" },
  Health: { color: "#ef4444", type: "expense" },
  Education: { color: "#06b6d4", type: "both" },
  Salary: { color: "#22c55e", type: "income" },
  Self: { color: "#6366f1", type: "both" },
  Other: { color: "#71717a", type: "both" },
  Freelance: { color: "#14b8a6", type: "income" },
  Gift: { color: "#f472b6", type: "both" },
  Investment: { color: "#8b5cf6", type: "income" },
  Rent: { color: "#f59e0b", type: "expense" },
};

const CATEGORY_NAMES = Object.keys(CATEGORIES);

function getCategoryInfo(name) {
  if (CATEGORIES[name]) return CATEGORIES[name];
  const custom = State.customCategories
    ? State.customCategories.find((c) => c.name === name)
    : null;
  if (custom) return { color: custom.color, type: custom.type || "both" };
  return CATEGORIES["Other"];
}

function getAllCategoryNames() {
  const customNames = State.customCategories
    ? State.customCategories.map((c) => c.name)
    : [];
  return [...CATEGORY_NAMES, ...customNames];
}

function getCategoryNamesByType(txType) {
  var type = txType === "expense" ? "expense" : "income";
  return getAllCategoryNames().filter(function(name) {
    var info = getCategoryInfo(name);
    return info.type === type || info.type === "both";
  });
}

