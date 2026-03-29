// ============================================
// CHART DRAWING
// ============================================
let chartDataCache = null;

// Get filtered data applying both main filters and chart-local filter
function getChartFilteredData() {
  var filtered = getFilteredTransactions();
  var cf = State.chartFilter || "all";
  if (cf === "expense") {
    filtered = filtered.filter(function (tx) { return tx.isExpense; });
  } else if (cf === "income") {
    filtered = filtered.filter(function (tx) { return !tx.isExpense; });
  }
  return filtered;
}

// Chart canvas setup helper
function setupCanvas(canvas) {
  var ctx = canvas.getContext("2d");
  var dpr = window.devicePixelRatio || 1;
  var rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  return { ctx: ctx, width: rect.width, height: rect.height };
}

function getChartColors() {
  var style = getComputedStyle(document.documentElement);
  return {
    textMuted: style.getPropertyValue("--text-muted").trim() || "#71717a",
    borderColor: style.getPropertyValue("--border-color").trim() || "#27272a",
    textPrimary: style.getPropertyValue("--text-primary").trim() || "#e4e4e7",
  };
}

// Build daily aggregation from filtered data
function buildDailyData(filtered) {
  var dailyData = new Map();
  for (var i = 0; i < filtered.length; i++) {
    var tx = filtered[i];
    if (!tx.timestamp) continue;
    var dateKey = tx.timestamp.toDateString();
    if (!dailyData.has(dateKey)) {
      dailyData.set(dateKey, { expense: 0, income: 0 });
    }
    var data = dailyData.get(dateKey);
    if (tx.isExpense) {
      data.expense += tx.amount;
    } else {
      data.income += tx.amount;
    }
  }
  return [...dailyData.entries()]
    .sort(function (a, b) { return new Date(a[0]) - new Date(b[0]); })
    .slice(-14);
}

// ============================================
// LINE CHART (existing, extracted)
// ============================================
function drawLineChart(canvas) {
  var setup = setupCanvas(canvas);
  var ctx = setup.ctx, width = setup.width, height = setup.height;
  var padLeft = 48, padRight = 16, padTop = 16, padBottom = 32;

  ctx.clearRect(0, 0, width, height);
  var colors = getChartColors();
  var filtered = getChartFilteredData();

  if (filtered.length === 0) {
    ctx.fillStyle = colors.textMuted;
    ctx.font = "14px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No data to display", width / 2, height / 2);
    chartDataCache = null;
    return;
  }

  var sortedDays = buildDailyData(filtered);

  if (sortedDays.length < 2) {
    ctx.fillStyle = colors.textMuted;
    ctx.font = "14px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Need more data for chart", width / 2, height / 2);
    chartDataCache = null;
    return;
  }

  var cf = State.chartFilter || "all";
  var maxValue = Math.max(
    ...sortedDays.map(function (d) {
      if (cf === "expense") return d[1].expense;
      if (cf === "income") return d[1].income;
      return Math.max(d[1].expense, d[1].income);
    }),
    1,
  );

  var chartW = width - padLeft - padRight;
  var chartH = height - padTop - padBottom;
  var stepX = chartW / (sortedDays.length - 1);

  function yPos(val) { return padTop + chartH - (val / maxValue) * chartH; }
  function xPos(i) { return padLeft + i * stepX; }

  // Grid lines & y-axis labels
  var gridLines = 4;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.font = "10px -apple-system, system-ui, sans-serif";
  for (var i = 0; i <= gridLines; i++) {
    var val = (maxValue / gridLines) * i;
    var y = yPos(val);
    ctx.beginPath();
    ctx.strokeStyle = colors.borderColor;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = colors.textMuted;
    var label;
    if (maxValue >= 1000000) label = (val / 1000000).toFixed(1) + "M";
    else if (maxValue >= 1000) label = (val / 1000).toFixed(0) + "K";
    else label = val.toFixed(0);
    ctx.fillText(label, padLeft - 8, y);
  }

  // X-axis labels
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "10px -apple-system, system-ui, sans-serif";
  ctx.fillStyle = colors.textMuted;
  var maxLabels = Math.min(sortedDays.length, 7);
  var labelStep = Math.max(1, Math.floor((sortedDays.length - 1) / (maxLabels - 1)));
  for (var i = 0; i < sortedDays.length; i += labelStep) {
    var d = new Date(sortedDays[i][0]);
    var lbl = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    ctx.fillText(lbl, xPos(i), height - padBottom + 8);
  }
  if ((sortedDays.length - 1) % labelStep !== 0) {
    var d = new Date(sortedDays[sortedDays.length - 1][0]);
    var lbl = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    ctx.fillText(lbl, xPos(sortedDays.length - 1), height - padBottom + 8);
  }

  // Bezier curve helpers
  function getControlPoints(pts) {
    var cps = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i];
      var p1 = pts[i];
      var p2 = pts[i + 1];
      var p3 = pts[i + 2] || p2;
      var tension = 0.3;
      cps.push({
        cp1x: p1.x + (p2.x - p0.x) * tension,
        cp1y: p1.y + (p2.y - p0.y) * tension,
        cp2x: p2.x - (p3.x - p1.x) * tension,
        cp2y: p2.y - (p3.y - p1.y) * tension,
      });
    }
    return cps;
  }

  function drawSmoothLine(points, strokeColor, fillColor) {
    if (points.length < 2) return;
    var cps = getControlPoints(points);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 0; i < cps.length; i++) {
      ctx.bezierCurveTo(cps[i].cp1x, cps[i].cp1y, cps[i].cp2x, cps[i].cp2y, points[i + 1].x, points[i + 1].y);
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    var grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    grad.addColorStop(0, fillColor);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 0; i < cps.length; i++) {
      ctx.bezierCurveTo(cps[i].cp1x, cps[i].cp1y, cps[i].cp2x, cps[i].cp2y, points[i + 1].x, points[i + 1].y);
    }
    ctx.lineTo(points[points.length - 1].x, padTop + chartH);
    ctx.lineTo(points[0].x, padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    for (var j = 0; j < points.length; j++) {
      ctx.beginPath();
      ctx.arc(points[j].x, points[j].y, 3, 0, Math.PI * 2);
      ctx.fillStyle = strokeColor;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(points[j].x, points[j].y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }
  }

  var incomePoints = sortedDays.map(function (d, i) { return { x: xPos(i), y: yPos(d[1].income) }; });
  var expensePoints = sortedDays.map(function (d, i) { return { x: xPos(i), y: yPos(d[1].expense) }; });

  if (cf !== "expense") drawSmoothLine(incomePoints, "#22c55e", "rgba(34, 197, 94, 0.18)");
  if (cf !== "income") drawSmoothLine(expensePoints, "#ef4444", "rgba(239, 68, 68, 0.18)");

  chartDataCache = {
    sortedDays: sortedDays, incomePoints: incomePoints, expensePoints: expensePoints,
    padLeft: padLeft, padRight: padRight, padTop: padTop, padBottom: padBottom,
    chartW: chartW, chartH: chartH, stepX: stepX, width: width, height: height,
  };

  var startDate = new Date(sortedDays[0][0]);
  var endDate = new Date(sortedDays[sortedDays.length - 1][0]);
  var periodEl = DOM.$("#analytics-period");
  if (periodEl) {
    periodEl.textContent = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " - " + endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
}

// ============================================
// BAR CHART
// ============================================
function drawBarChart(canvas) {
  var setup = setupCanvas(canvas);
  var ctx = setup.ctx, width = setup.width, height = setup.height;
  var padLeft = 48, padRight = 16, padTop = 16, padBottom = 32;
  ctx.clearRect(0, 0, width, height);
  var colors = getChartColors();
  var filtered = getChartFilteredData();

  if (filtered.length === 0) {
    ctx.fillStyle = colors.textMuted;
    ctx.font = "14px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No data to display", width / 2, height / 2);
    chartDataCache = null;
    return;
  }

  var sortedDays = buildDailyData(filtered);
  if (sortedDays.length === 0) {
    ctx.fillStyle = colors.textMuted;
    ctx.font = "14px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No data to display", width / 2, height / 2);
    chartDataCache = null;
    return;
  }

  var cf = State.chartFilter || "all";
  var maxValue = Math.max(
    ...sortedDays.map(function (d) {
      if (cf === "expense") return d[1].expense;
      if (cf === "income") return d[1].income;
      return Math.max(d[1].expense, d[1].income);
    }),
    1,
  );

  var chartW = width - padLeft - padRight;
  var chartH = height - padTop - padBottom;
  var barGroupWidth = chartW / sortedDays.length;
  var barPad = barGroupWidth * 0.2;
  var showBoth = cf === "all";
  var barWidth = showBoth ? (barGroupWidth - barPad * 2) / 2 : barGroupWidth - barPad * 2;

  // Grid lines
  var gridLines = 4;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.font = "10px -apple-system, system-ui, sans-serif";
  for (var i = 0; i <= gridLines; i++) {
    var val = (maxValue / gridLines) * i;
    var y = padTop + chartH - (val / maxValue) * chartH;
    ctx.beginPath();
    ctx.strokeStyle = colors.borderColor;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = colors.textMuted;
    var label;
    if (maxValue >= 1000000) label = (val / 1000000).toFixed(1) + "M";
    else if (maxValue >= 1000) label = (val / 1000).toFixed(0) + "K";
    else label = val.toFixed(0);
    ctx.fillText(label, padLeft - 8, y);
  }

  // Helper to draw a bar with rounded top corners
  function drawBar(x, y, w, h, color) {
    if (h < 1) return;
    ctx.fillStyle = color;
    var r = Math.min(3, h / 2);
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
  }

  // Draw bars
  for (var i = 0; i < sortedDays.length; i++) {
    var d = sortedDays[i][1];
    var groupX = padLeft + i * barGroupWidth + barPad;
    var baseY = padTop + chartH;

    if (cf !== "income" && d.expense > 0) {
      var eH = (d.expense / maxValue) * chartH;
      var ex = showBoth ? groupX : groupX;
      drawBar(ex, baseY - eH, barWidth, eH, "rgba(239, 68, 68, 0.8)");
    }
    if (cf !== "expense" && d.income > 0) {
      var iH = (d.income / maxValue) * chartH;
      var ix = showBoth ? groupX + barWidth : groupX;
      drawBar(ix, baseY - iH, barWidth, iH, "rgba(34, 197, 94, 0.8)");
    }
  }

  // X-axis labels
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "10px -apple-system, system-ui, sans-serif";
  ctx.fillStyle = colors.textMuted;
  var maxLabels = Math.min(sortedDays.length, 7);
  var labelStep = Math.max(1, Math.floor((sortedDays.length - 1) / (maxLabels - 1)));
  for (var i = 0; i < sortedDays.length; i += labelStep) {
    var dt = new Date(sortedDays[i][0]);
    var lbl = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    ctx.fillText(lbl, padLeft + i * barGroupWidth + barGroupWidth / 2, height - padBottom + 8);
  }

  chartDataCache = {
    sortedDays: sortedDays, padLeft: padLeft, padRight: padRight,
    padTop: padTop, padBottom: padBottom, chartW: chartW, chartH: chartH,
    stepX: barGroupWidth, width: width, height: height,
    incomePoints: [], expensePoints: [],
  };
}

// ============================================
// PIE CHART (donut)
// ============================================
function drawPieChart(canvas) {
  var setup = setupCanvas(canvas);
  var ctx = setup.ctx, width = setup.width, height = setup.height;
  ctx.clearRect(0, 0, width, height);
  var colors = getChartColors();
  var filtered = getChartFilteredData();

  if (filtered.length === 0) {
    ctx.fillStyle = colors.textMuted;
    ctx.font = "14px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No data to display", width / 2, height / 2);
    chartDataCache = null;
    return;
  }

  var cf = State.chartFilter || "all";
  var cx = width / 2;
  var cy = height / 2;
  var outerR = Math.min(width, height) / 2 - 20;
  var innerR = outerR * 0.6;

  if (cf === "all") {
    // Show income vs expense donut
    var totalIncome = 0, totalExpense = 0;
    for (var i = 0; i < filtered.length; i++) {
      if (filtered[i].isExpense) totalExpense += filtered[i].amount;
      else totalIncome += filtered[i].amount;
    }
    var total = totalIncome + totalExpense;
    if (total === 0) {
      ctx.fillStyle = colors.textMuted;
      ctx.font = "14px -apple-system, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No data to display", cx, cy);
      return;
    }

    var segments = [
      { value: totalIncome, color: "#22c55e", label: "Income" },
      { value: totalExpense, color: "#ef4444", label: "Expense" },
    ];
    var startAngle = -Math.PI / 2;
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      if (seg.value === 0) continue;
      var sliceAngle = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
      ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      startAngle += sliceAngle;
    }

    // Center text
    var net = totalIncome - totalExpense;
    ctx.fillStyle = colors.textPrimary;
    ctx.font = "bold 18px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((net >= 0 ? "+" : "-") + "ETB " + Math.abs(net).toLocaleString(undefined, { maximumFractionDigits: 0 }), cx, cy - 8);
    ctx.fillStyle = colors.textMuted;
    ctx.font = "12px -apple-system, system-ui, sans-serif";
    ctx.fillText("Net Flow", cx, cy + 12);
  } else {
    // Show category breakdown
    var catTotals = {};
    for (var i = 0; i < filtered.length; i++) {
      var tx = filtered[i];
      var cats = tx.categories && tx.categories.length > 0 ? tx.categories : ["Other"];
      for (var c = 0; c < cats.length; c++) {
        catTotals[cats[c]] = (catTotals[cats[c]] || 0) + tx.amount;
      }
    }
    var catEntries = Object.entries(catTotals).sort(function (a, b) { return b[1] - a[1]; });
    var total = catEntries.reduce(function (s, e) { return s + e[1]; }, 0);
    if (total === 0) {
      ctx.fillStyle = colors.textMuted;
      ctx.font = "14px -apple-system, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No data to display", cx, cy);
      return;
    }

    var startAngle = -Math.PI / 2;
    for (var i = 0; i < catEntries.length; i++) {
      var catInfo = getCategoryInfo(catEntries[i][0]);
      var sliceAngle = (catEntries[i][1] / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
      ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = catInfo.color;
      ctx.fill();
      startAngle += sliceAngle;
    }

    // Center text
    ctx.fillStyle = colors.textPrimary;
    ctx.font = "bold 18px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ETB " + total.toLocaleString(undefined, { maximumFractionDigits: 0 }), cx, cy - 8);
    ctx.fillStyle = colors.textMuted;
    ctx.font = "12px -apple-system, system-ui, sans-serif";
    ctx.fillText(cf === "expense" ? "Total Expense" : "Total Income", cx, cy + 12);
  }

  chartDataCache = null;
}

// ============================================
// HEATMAP (HTML calendar)
// ============================================
function renderHeatmap() {
  var grid = DOM.$("#heatmap-grid");
  var titleEl = DOM.$("#heatmap-month-title");
  if (!grid) return;

  // Init month if needed
  if (!State.heatmapMonth) {
    var now = new Date();
    State.heatmapMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  var month = State.heatmapMonth;
  var year = month.getFullYear();
  var mon = month.getMonth();

  if (titleEl) {
    titleEl.textContent = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  // Build daily P&L for this month from chart-filtered data
  var filtered = getChartFilteredData();
  var dailyNet = {};
  for (var i = 0; i < filtered.length; i++) {
    var tx = filtered[i];
    if (!tx.timestamp) continue;
    var d = tx.timestamp;
    if (d.getFullYear() !== year || d.getMonth() !== mon) continue;
    var day = d.getDate();
    if (!dailyNet[day]) dailyNet[day] = 0;
    dailyNet[day] += tx.isExpense ? -tx.amount : tx.amount;
  }

  // Find max for intensity scaling
  var maxAbs = 0;
  for (var k in dailyNet) {
    if (Math.abs(dailyNet[k]) > maxAbs) maxAbs = Math.abs(dailyNet[k]);
  }
  if (maxAbs === 0) maxAbs = 1;

  // Calendar layout: Mon=0 ... Sun=6
  var daysInMonth = new Date(year, mon + 1, 0).getDate();
  var firstDow = new Date(year, mon, 1).getDay(); // 0=Sun
  // Convert to Mon-start: Mon=0, Tue=1, ..., Sun=6
  var startOffset = (firstDow + 6) % 7;

  var html = "";
  // Day-of-week headers
  var dowLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (var i = 0; i < 7; i++) {
    html += '<div class="heatmap-dow">' + dowLabels[i] + '</div>';
  }

  // Empty cells before first day
  for (var i = 0; i < startOffset; i++) {
    html += '<div class="heatmap-cell empty"></div>';
  }

  // Day cells
  for (var day = 1; day <= daysInMonth; day++) {
    var net = dailyNet[day] || 0;
    var cls = "heatmap-cell";
    var amountStr = "";

    if (net > 0) {
      cls += " positive";
      if (Math.abs(net) / maxAbs > 0.5) cls += " strong";
      amountStr = "+" + formatCompactAmount(Math.abs(net));
    } else if (net < 0) {
      cls += " negative";
      if (Math.abs(net) / maxAbs > 0.5) cls += " strong";
      amountStr = "-" + formatCompactAmount(Math.abs(net));
    } else {
      cls += " empty";
    }

    html += '<div class="' + cls + '">' +
      '<span class="heatmap-cell-day">' + day + '</span>' +
      (amountStr ? '<span class="heatmap-cell-amount">' + amountStr + '</span>' : '') +
      '</div>';
  }

  grid.innerHTML = html;
}

function formatCompactAmount(val) {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
  if (val >= 1000) return (val / 1000).toFixed(1) + "K";
  return val.toFixed(0);
}

// ============================================
// EXPENSE CHART HELPERS
// ============================================
function getExpensePeriodRange(allExpenses) {
  var period = State.expenseChartPeriod || "weekly";
  var latest = null;
  for (var i = 0; i < allExpenses.length; i++) {
    if (allExpenses[i].timestamp && (!latest || allExpenses[i].timestamp > latest))
      latest = allExpenses[i].timestamp;
  }
  if (!latest) return null;

  var start, end;
  if (period === "weekly") {
    var d = new Date(latest); d.setHours(0,0,0,0);
    var dow = d.getDay();
    var mondayOffset = dow === 0 ? -6 : 1 - dow;
    start = new Date(d); start.setDate(d.getDate() + mondayOffset);
    end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
  } else if (period === "monthly") {
    start = new Date(latest.getFullYear(), latest.getMonth(), 1);
    end = new Date(latest.getFullYear(), latest.getMonth() + 1, 0, 23, 59, 59, 999);
  } else {
    start = new Date(latest.getFullYear(), 0, 1);
    end = new Date(latest.getFullYear(), 11, 31, 23, 59, 59, 999);
  }
  return { start: start, end: end };
}

function buildExpenseEntries(filtered) {
  var catTotals = {};
  for (var i = 0; i < filtered.length; i++) {
    var tx = filtered[i];
    var cats = tx.categories && tx.categories.length > 0 ? tx.categories : ["Other"];
    for (var c = 0; c < cats.length; c++) {
      catTotals[cats[c]] = (catTotals[cats[c]] || 0) + tx.amount;
    }
  }
  var entries = Object.entries(catTotals)
    .sort(function (a, b) { return b[1] - a[1]; })
    .slice(0, 8);
  var allEntries = Object.entries(catTotals).sort(function (a, b) { return b[1] - a[1]; });
  if (allEntries.length > 8) {
    var otherTotal = 0;
    for (var i = 8; i < allEntries.length; i++) otherTotal += allEntries[i][1];
    if (otherTotal > 0) entries.push(["Other", otherTotal]);
  }
  var total = entries.reduce(function (s, e) { return s + e[1]; }, 0);
  return { entries: entries, total: total };
}

function getExpenseData() {
  var filtered = getFilteredTransactions().filter(function (tx) { return tx.isExpense; });
  var result = buildExpenseEntries(filtered);
  return { filtered: filtered, entries: result.entries, total: result.total };
}

function getPeriodExpenseData() {
  var allExpenses = getFilteredTransactions().filter(function (tx) { return tx.isExpense; });
  var range = getExpensePeriodRange(allExpenses);
  if (!range) return { filtered: [], entries: [], total: 0 };
  var filtered = allExpenses.filter(function (tx) {
    return tx.timestamp && tx.timestamp >= range.start && tx.timestamp <= range.end;
  });
  var result = buildExpenseEntries(filtered);
  return { filtered: filtered, entries: result.entries, total: result.total };
}

// Build weekly bars: 7 bars (Mon-Sun), all data aggregated by day of week
function buildWeeklyBars(filtered) {
  var DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var bars = [];
  for (var i = 0; i < 7; i++) bars.push({});

  for (var i = 0; i < filtered.length; i++) {
    var tx = filtered[i];
    if (!tx.timestamp) continue;
    var dow = tx.timestamp.getDay();
    var idx = dow === 0 ? 6 : dow - 1; // Sun=6, Mon=0..Sat=5

    var cats = tx.categories && tx.categories.length > 0 ? tx.categories : ["Other"];
    for (var c = 0; c < cats.length; c++) {
      bars[idx][cats[c]] = (bars[idx][cats[c]] || 0) + tx.amount;
    }
  }

  return { bars: bars, labels: DAY_LABELS, title: "Weekly Expense" };
}

// Build monthly bars: 5 bars (W1-W5), all data aggregated by week-of-month
function buildMonthlyBars(filtered) {
  var WEEK_LABELS = ["W1", "W2", "W3", "W4", "W5"];
  var bars = [];
  for (var i = 0; i < 5; i++) bars.push({});

  for (var i = 0; i < filtered.length; i++) {
    var tx = filtered[i];
    if (!tx.timestamp) continue;
    var weekIdx = Math.min(4, Math.floor((tx.timestamp.getDate() - 1) / 7));

    var cats = tx.categories && tx.categories.length > 0 ? tx.categories : ["Other"];
    for (var c = 0; c < cats.length; c++) {
      bars[weekIdx][cats[c]] = (bars[weekIdx][cats[c]] || 0) + tx.amount;
    }
  }

  return { bars: bars, labels: WEEK_LABELS, title: "Monthly Expense" };
}

// Build yearly bars: 12 bars (Jan-Dec) for the most recent year with data
// Build yearly bars: 12 bars (Jan-Dec), all data aggregated by month regardless of year
function buildYearlyBars(filtered) {
  var MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  var bars = [];
  for (var i = 0; i < 12; i++) bars.push({});

  for (var i = 0; i < filtered.length; i++) {
    var tx = filtered[i];
    if (!tx.timestamp) continue;
    var m = tx.timestamp.getMonth();
    var cats = tx.categories && tx.categories.length > 0 ? tx.categories : ["Other"];
    for (var c = 0; c < cats.length; c++) {
      bars[m][cats[c]] = (bars[m][cats[c]] || 0) + tx.amount;
    }
  }

  return { bars: bars, labels: MONTH_LABELS, title: "Yearly Expense" };
}

function renderExpenseLegend(entries, total) {
  var legendEl = DOM.$("#expense-chart-legend");
  if (!legendEl) return;
  if (entries.length === 0) { legendEl.innerHTML = ""; return; }
  var html = "";
  for (var i = 0; i < entries.length; i++) {
    var name = entries[i][0];
    var val = entries[i][1];
    var catInfo = getCategoryInfo(name);
    html += '<div class="expense-legend-item">' +
      '<span class="expense-legend-dot" style="background:' + catInfo.color + '"></span>' +
      '<span class="expense-legend-name">' + name + '</span>' +
      '<span class="expense-legend-amount">ETB ' + val.toLocaleString(undefined, { maximumFractionDigits: 0 }) + '</span>' +
      '</div>';
  }
  legendEl.innerHTML = html;
}

function updateExpenseSubtitle(filtered) {
  var subEl = DOM.$("#expense-chart-subtitle");
  if (!subEl) return;
  if (filtered.length === 0) { subEl.textContent = ""; return; }
  var dates = filtered
    .filter(function (tx) { return tx.timestamp; })
    .map(function (tx) { return tx.timestamp; });
  if (dates.length === 0) { subEl.textContent = ""; return; }
  var minDate = new Date(Math.min.apply(null, dates));
  var maxDate = new Date(Math.max.apply(null, dates));
  var opts = { day: "numeric", month: "short", year: "numeric" };
  subEl.textContent = minDate.toLocaleDateString("en-US", opts) + " - " + maxDate.toLocaleDateString("en-US", opts);
}

// ============================================
// STACKED BAR CHART (weekly/monthly, color-coded by category)
// ============================================
function drawCategoryBarChart(canvas) {
  if (!canvas) return;
  var data = getPeriodExpenseData();
  var filtered = data.filtered;
  var catEntries = data.entries;

  var setup = setupCanvas(canvas);
  var ctx = setup.ctx, width = setup.width, height = setup.height;
  ctx.clearRect(0, 0, width, height);
  var colors = getChartColors();

  if (filtered.length === 0) {
    renderExpenseLegend([], 0);
    ctx.fillStyle = colors.textMuted;
    ctx.font = "14px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No expense data", width / 2, height / 2);
    updateExpenseSubtitle(filtered);
    return;
  }

  var period = State.expenseChartPeriod || "weekly";
  var result = period === "yearly" ? buildYearlyBars(filtered) : period === "monthly" ? buildMonthlyBars(filtered) : buildWeeklyBars(filtered);
  var bars = result.bars;
  var labels = result.labels;

  // Build legend from bar data (sum each category across all bars)
  var barCatTotals = {};
  for (var bi = 0; bi < bars.length; bi++) {
    for (var cat in bars[bi]) {
      barCatTotals[cat] = (barCatTotals[cat] || 0) + bars[bi][cat];
    }
  }
  var barEntries = Object.entries(barCatTotals).sort(function (a, b) { return b[1] - a[1]; });
  var barTotal = barEntries.reduce(function (s, e) { return s + e[1]; }, 0);
  renderExpenseLegend(barEntries, barTotal);

  // Update subtitle with period title
  var subEl = DOM.$("#expense-chart-subtitle");
  if (subEl) subEl.textContent = result.title;

  var catNames = barEntries.map(function (e) { return e[0]; });

  if (bars.length === 0) return;

  // Find max stack height
  var maxStack = 0;
  for (var i = 0; i < bars.length; i++) {
    var sum = 0;
    for (var k in bars[i]) sum += bars[i][k];
    if (sum > maxStack) maxStack = sum;
  }
  if (maxStack === 0) maxStack = 1;

  var padLeft = 8, padRight = 8, padTop = 12, padBottom = 28;
  var chartW = width - padLeft - padRight;
  var chartH = height - padTop - padBottom;
  var barGroupW = chartW / bars.length;
  var barPad = Math.max(1, barGroupW * 0.1);
  var barW = barGroupW - barPad * 2;

  // Grid lines (dotted, no y-axis labels — legend shows amounts)
  var gridLines = 4;
  for (var i = 1; i <= gridLines; i++) {
    var val = (maxStack / gridLines) * i;
    var y = padTop + chartH - (val / maxStack) * chartH;
    ctx.beginPath();
    ctx.strokeStyle = colors.borderColor;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw stacked bars with clip-based rounded tops (no destination-in)
  for (var i = 0; i < bars.length; i++) {
    var bucket = bars[i];
    var x = padLeft + i * barGroupW + barPad;
    var baseY = padTop + chartH;

    // Calculate total bar height first
    var totalH = 0;
    for (var ci = 0; ci < catNames.length; ci++) {
      totalH += (bucket[catNames[ci]] || 0) / maxStack * chartH;
    }
    if (totalH < 1) continue;

    // Clip to rounded rect for this bar only
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, baseY - totalH, barW, totalH, [4, 4, 0, 0]);
    ctx.clip();

    // Draw segments bottom-up within the clip
    var curY = baseY;
    for (var ci = catNames.length - 1; ci >= 0; ci--) {
      var catVal = bucket[catNames[ci]] || 0;
      if (catVal === 0) continue;
      var segH = (catVal / maxStack) * chartH;
      var catInfo = getCategoryInfo(catNames[ci]);
      ctx.fillStyle = catInfo.color;
      ctx.fillRect(x, curY - segH, barW, segH);
      curY -= segH;
    }

    ctx.restore();
  }

  // X-axis labels (drawn after all bars to avoid destination-in wiping them)
  ctx.fillStyle = colors.textMuted;
  ctx.font = "10px -apple-system, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (var i = 0; i < bars.length; i++) {
    var x = padLeft + i * barGroupW + barPad;
    ctx.fillText(labels[i], x + barW / 2, height - padBottom + 6);
  }
}

// ============================================
// BUBBLE CHART (packed circles with %)
// ============================================
function drawCategoryBubbleChart(canvas) {
  if (!canvas) return;
  var data = getPeriodExpenseData();
  var filtered = data.filtered;
  var catEntries = data.entries;
  var totalAmount = data.total;

  // Set subtitle using the same period title as the bar chart
  var period = State.expenseChartPeriod || "weekly";
  var periodResult = period === "yearly" ? buildYearlyBars(filtered) : period === "monthly" ? buildMonthlyBars(filtered) : buildWeeklyBars(filtered);
  var subEl = DOM.$("#expense-chart-subtitle");
  if (subEl) subEl.textContent = periodResult.title;
  renderExpenseLegend(catEntries, totalAmount);

  var setup = setupCanvas(canvas);
  var ctx = setup.ctx, width = setup.width, height = setup.height;
  ctx.clearRect(0, 0, width, height);
  var colors = getChartColors();

  if (catEntries.length === 0 || totalAmount === 0) {
    ctx.fillStyle = colors.textMuted;
    ctx.font = "14px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No expense data", width / 2, height / 2);
    return;
  }

  // Build circles with radius proportional to sqrt of percentage
  var maxPct = catEntries[0][1] / totalAmount;
  var maxRadius = Math.min(width, height) * 0.32;
  var minRadius = 20;
  var circles = [];
  for (var i = 0; i < catEntries.length; i++) {
    var pct = catEntries[i][1] / totalAmount;
    var ratio = Math.sqrt(pct / maxPct);
    var r = Math.max(minRadius, ratio * maxRadius);
    var catInfo = getCategoryInfo(catEntries[i][0]);
    circles.push({
      name: catEntries[i][0],
      value: catEntries[i][1],
      pct: pct,
      r: r,
      x: width / 2,
      y: height / 2,
      color: catInfo.color,
    });
  }

  // Circle packing: place largest at center, spiral outward for others
  circles[0].x = width / 2;
  circles[0].y = height / 2;

  for (var i = 1; i < circles.length; i++) {
    var placed = false;
    var startDist = circles[0].r + circles[i].r + 5;
    for (var dist = startDist; dist < Math.max(width, height); dist += 3) {
      for (var a = 0; a < 48; a++) {
        var angle = (a / 48) * Math.PI * 2 + i * 0.7; // offset per circle
        var testX = width / 2 + dist * Math.cos(angle);
        var testY = height / 2 + dist * Math.sin(angle);
        var overlap = false;
        for (var j = 0; j < i; j++) {
          var dx = testX - circles[j].x;
          var dy = testY - circles[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < circles[i].r + circles[j].r + 4) {
            overlap = true;
            break;
          }
        }
        if (!overlap && testX - circles[i].r > 2 && testX + circles[i].r < width - 2 && testY - circles[i].r > 2 && testY + circles[i].r < height - 2) {
          circles[i].x = testX;
          circles[i].y = testY;
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
    if (!placed) {
      // Fallback: reduce radius and place roughly
      circles[i].r = minRadius;
      circles[i].x = width * 0.2 + (i * 50) % (width * 0.6);
      circles[i].y = height * 0.3 + (i * 30) % (height * 0.4);
    }
  }

  // Draw circles — solid fill with subtle gradient and shadow
  for (var i = 0; i < circles.length; i++) {
    var c = circles[i];

    // Shadow
    ctx.save();
    ctx.shadowColor = c.color + "40";
    ctx.shadowBlur = c.r * 0.4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = c.r * 0.1;

    // Radial gradient fill for depth
    var grad = ctx.createRadialGradient(
      c.x - c.r * 0.25, c.y - c.r * 0.25, c.r * 0.1,
      c.x, c.y, c.r
    );
    grad.addColorStop(0, c.color + "ee");
    grad.addColorStop(1, c.color + "bb");

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // Subtle highlight arc at top-left
    ctx.beginPath();
    ctx.arc(c.x - c.r * 0.2, c.y - c.r * 0.2, c.r * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fill();

    // Percentage label — white text
    var pctStr = Math.round(c.pct * 100) + "%";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    if (c.r >= 30) {
      ctx.font = "bold " + Math.max(14, Math.min(24, c.r * 0.5)) + "px -apple-system, system-ui, sans-serif";
      ctx.fillText(pctStr, c.x, c.y);
    } else if (c.r >= 20) {
      ctx.font = "bold 11px -apple-system, system-ui, sans-serif";
      ctx.fillText(pctStr, c.x, c.y);
    }
  }
}

// ============================================
// HOME CHART (line chart with 7D/30D period)
// ============================================
var homeChartCache = null;

function drawChartOnCanvas(canvas) {
  var setup = setupCanvas(canvas);
  var ctx = setup.ctx, width = setup.width, height = setup.height;
  var padLeft = 48, padRight = 16, padTop = 16, padBottom = 32;

  ctx.clearRect(0, 0, width, height);
  var colors = getChartColors();
  var filtered = getProfileTransactions();

  if (filtered.length === 0) {
    ctx.fillStyle = colors.textMuted;
    ctx.font = "14px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No data to display", width / 2, height / 2);
    homeChartCache = null;
    return;
  }

  // Build daily data for the selected period
  var days = State.homeChartPeriod === "30D" ? 30 : 7;
  var dailyData = new Map();
  for (var i = 0; i < filtered.length; i++) {
    var tx = filtered[i];
    if (!tx.timestamp) continue;
    var dateKey = tx.timestamp.toDateString();
    if (!dailyData.has(dateKey)) {
      dailyData.set(dateKey, { expense: 0, income: 0 });
    }
    var data = dailyData.get(dateKey);
    if (tx.isExpense) data.expense += tx.amount;
    else data.income += tx.amount;
  }

  // Fill in missing days for the period
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var sortedDays = [];
  for (var d = days - 1; d >= 0; d--) {
    var date = new Date(today);
    date.setDate(date.getDate() - d);
    var key = date.toDateString();
    var val = dailyData.get(key) || { expense: 0, income: 0 };
    sortedDays.push([key, val]);
  }

  if (sortedDays.length < 2) {
    ctx.fillStyle = colors.textMuted;
    ctx.font = "14px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Need more data for chart", width / 2, height / 2);
    homeChartCache = null;
    return;
  }

  var maxValue = Math.max(
    ...sortedDays.map(function (d) { return Math.max(d[1].expense, d[1].income); }),
    1,
  );

  var chartW = width - padLeft - padRight;
  var chartH = height - padTop - padBottom;
  var stepX = chartW / (sortedDays.length - 1);

  function yPos(val) { return padTop + chartH - (val / maxValue) * chartH; }
  function xPos(i) { return padLeft + i * stepX; }

  // Grid lines
  var gridLines = 4;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.font = "10px -apple-system, system-ui, sans-serif";
  for (var i = 0; i <= gridLines; i++) {
    var val = (maxValue / gridLines) * i;
    var y = yPos(val);
    ctx.beginPath();
    ctx.strokeStyle = colors.borderColor;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = colors.textMuted;
    var label;
    if (maxValue >= 1000000) label = (val / 1000000).toFixed(1) + "M";
    else if (maxValue >= 1000) label = (val / 1000).toFixed(0) + "K";
    else label = val.toFixed(0);
    ctx.fillText(label, padLeft - 8, y);
  }

  // X-axis labels
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "10px -apple-system, system-ui, sans-serif";
  ctx.fillStyle = colors.textMuted;
  var maxLabels = Math.min(sortedDays.length, 7);
  var labelStep = Math.max(1, Math.floor((sortedDays.length - 1) / (maxLabels - 1)));
  for (var i = 0; i < sortedDays.length; i += labelStep) {
    var dd = new Date(sortedDays[i][0]);
    var lbl = dd.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    ctx.fillText(lbl, xPos(i), height - padBottom + 8);
  }
  if ((sortedDays.length - 1) % labelStep !== 0) {
    var dd = new Date(sortedDays[sortedDays.length - 1][0]);
    var lbl = dd.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    ctx.fillText(lbl, xPos(sortedDays.length - 1), height - padBottom + 8);
  }

  // Bezier curve helpers
  function getControlPoints(pts) {
    var cps = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i];
      var p1 = pts[i];
      var p2 = pts[i + 1];
      var p3 = pts[i + 2] || p2;
      var tension = 0.3;
      cps.push({
        cp1x: p1.x + (p2.x - p0.x) * tension,
        cp1y: p1.y + (p2.y - p0.y) * tension,
        cp2x: p2.x - (p3.x - p1.x) * tension,
        cp2y: p2.y - (p3.y - p1.y) * tension,
      });
    }
    return cps;
  }

  function drawSmoothLine(points, strokeColor, fillColor) {
    if (points.length < 2) return;
    var cps = getControlPoints(points);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 0; i < cps.length; i++) {
      ctx.bezierCurveTo(cps[i].cp1x, cps[i].cp1y, cps[i].cp2x, cps[i].cp2y, points[i + 1].x, points[i + 1].y);
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    var grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    grad.addColorStop(0, fillColor);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 0; i < cps.length; i++) {
      ctx.bezierCurveTo(cps[i].cp1x, cps[i].cp1y, cps[i].cp2x, cps[i].cp2y, points[i + 1].x, points[i + 1].y);
    }
    ctx.lineTo(points[points.length - 1].x, padTop + chartH);
    ctx.lineTo(points[0].x, padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    for (var j = 0; j < points.length; j++) {
      ctx.beginPath();
      ctx.arc(points[j].x, points[j].y, 3, 0, Math.PI * 2);
      ctx.fillStyle = strokeColor;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(points[j].x, points[j].y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }
  }

  var incomePoints = sortedDays.map(function (d, i) { return { x: xPos(i), y: yPos(d[1].income) }; });
  var expensePoints = sortedDays.map(function (d, i) { return { x: xPos(i), y: yPos(d[1].expense) }; });

  drawSmoothLine(incomePoints, "#22c55e", "rgba(34, 197, 94, 0.18)");
  drawSmoothLine(expensePoints, "#ef4444", "rgba(239, 68, 68, 0.18)");

  homeChartCache = {
    sortedDays: sortedDays,
    incomePoints: incomePoints,
    expensePoints: expensePoints,
    padLeft: padLeft,
    stepX: stepX,
    width: width,
  };
}

function initHomeChartInteraction() {
  var canvas = DOM.$("#home-chart-canvas");
  var tooltip = DOM.$("#home-chart-tooltip");
  if (!canvas || !tooltip) return;

  function handlePointer(e) {
    if (!homeChartCache || !homeChartCache.sortedDays) return;
    var rect = canvas.getBoundingClientRect();
    var px = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    var sortedDays = homeChartCache.sortedDays;
    var stepX = homeChartCache.stepX;
    var padLeft = homeChartCache.padLeft;
    var idx = Math.round((px - padLeft) / stepX);
    idx = Math.max(0, Math.min(sortedDays.length - 1, idx));

    var dateStr = sortedDays[idx][0];
    var data = sortedDays[idx][1];
    var d = new Date(dateStr);
    DOM.$("#home-tooltip-date").textContent = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    DOM.$("#home-tooltip-income").textContent = "+" + Format.compact(data.income);
    DOM.$("#home-tooltip-expense").textContent = "-" + Format.compact(data.expense);

    var tipX = padLeft + idx * stepX;
    var container = canvas.parentElement;
    var containerRect = container.getBoundingClientRect();
    var tipWidth = 150;
    var left = tipX - tipWidth / 2;
    if (left < 4) left = 4;
    if (left + tipWidth > containerRect.width - 4) left = containerRect.width - tipWidth - 4;
    tooltip.style.left = left + "px";
    tooltip.style.top = "0px";
    tooltip.classList.add("visible");
  }

  function hideTooltip() { tooltip.classList.remove("visible"); }

  canvas.addEventListener("touchstart", function(e) { e.preventDefault(); handlePointer(e); }, { passive: false });
  canvas.addEventListener("touchmove", function(e) { e.preventDefault(); handlePointer(e); }, { passive: false });
  canvas.addEventListener("touchend", hideTooltip, { passive: true });
  canvas.addEventListener("mousemove", handlePointer);
  canvas.addEventListener("mouseleave", hideTooltip);
}

// ============================================
// CHART DISPATCHER
// ============================================
function drawChart() {
  var type = State.chartType || "line";
  var canvasView = DOM.$("#chart-canvas-view");
  var heatmapView = DOM.$("#chart-heatmap-view");

  if (type === "heatmap") {
    if (canvasView) canvasView.classList.add("hidden");
    if (heatmapView) heatmapView.classList.remove("hidden");
    renderHeatmap();
  } else {
    if (canvasView) canvasView.classList.remove("hidden");
    if (heatmapView) heatmapView.classList.add("hidden");
    var canvas = DOM.$("#chart-canvas");
    if (!canvas) return;
    if (type === "line") drawLineChart(canvas);
    else if (type === "bar") drawBarChart(canvas);
    else if (type === "pie") drawPieChart(canvas);
  }
}

function drawExpenseChart() {
  var canvas = DOM.$("#chart-expense");
  if (!canvas) return;
  var type = State.expenseChartType || "bar";
  if (type === "bar") drawCategoryBarChart(canvas);
  else if (type === "bubble") drawCategoryBubbleChart(canvas);
}

function drawAllCharts() {
  drawChart();
  drawExpenseChart();
}

// Chart tooltip interaction
function initChartInteraction() {
  var canvas = DOM.$("#chart-canvas");
  var tooltip = DOM.$("#chart-tooltip");
  if (!canvas || !tooltip) return;

  function handleChartPointer(e) {
    if (!chartDataCache || !chartDataCache.sortedDays) return;
    var rect = canvas.getBoundingClientRect();
    var px = e.touches
      ? e.touches[0].clientX - rect.left
      : e.clientX - rect.left;

    var sortedDays = chartDataCache.sortedDays;
    var stepX = chartDataCache.stepX;
    var padLeft = chartDataCache.padLeft;
    var idx = Math.round((px - padLeft) / stepX);
    idx = Math.max(0, Math.min(sortedDays.length - 1, idx));

    var dateStr = sortedDays[idx][0];
    var data = sortedDays[idx][1];
    var d = new Date(dateStr);
    DOM.$("#chart-tooltip-date").textContent = d.toLocaleDateString(
      "en-US",
      { weekday: "short", month: "short", day: "numeric" },
    );
    DOM.$("#chart-tooltip-income").textContent =
      "Income: ETB " + data.income.toLocaleString();
    DOM.$("#chart-tooltip-expense").textContent =
      "Expense: ETB " + data.expense.toLocaleString();

    var tipX = padLeft + idx * stepX;
    var chartContainer = canvas.parentElement;
    var containerRect = chartContainer.getBoundingClientRect();
    var tipWidth = 180;
    var left = tipX - tipWidth / 2;
    if (left < 4) left = 4;
    if (left + tipWidth > containerRect.width - 4)
      left = containerRect.width - tipWidth - 4;
    tooltip.style.left = left + "px";
    tooltip.style.top = "0px";
    tooltip.classList.add("visible");
  }

  function hideTooltip() {
    tooltip.classList.remove("visible");
  }

  canvas.addEventListener(
    "touchstart",
    function (e) {
      e.preventDefault();
      handleChartPointer(e);
    },
    { passive: false },
  );
  canvas.addEventListener(
    "touchmove",
    function (e) {
      e.preventDefault();
      handleChartPointer(e);
    },
    { passive: false },
  );
  canvas.addEventListener("touchend", hideTooltip);
  canvas.addEventListener("mousemove", handleChartPointer);
  canvas.addEventListener("mouseleave", hideTooltip);
}
