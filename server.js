const https = require("https");
const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT || 3000;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const SITE_URL = process.env.SITE_URL || "https://smb-lottery-proxy.onrender.com";

// ── STATE ──
const store = {
  entries: {}, started: false, prize: "", entriesLocked: false,
  config: {
    drawTimes: ["23:00","00:00","01:00","02:00","03:00","04:00"],
    autoStartTime: "22:30",
    lockTime: "23:00",
    announceTime: "04:55",
    defaultPrize: "PHP 250.00"
  },
  history: [],   // {label, nums, date, time, test:false}
  log: []
};
function addLog(msg){
  const t = phtParts();
  store.log.unshift(`[${t.hh}:${t.mm}:${String(t.sec).padStart(2,"0")} PHT] ${msg}`);
  store.log = store.log.slice(0, 100);
  console.log(msg);
}

// ── PHT TIME (UTC+8, independent of server timezone) ──
function phtParts(d = new Date()){
  const p = new Date(d.getTime() + 8 * 3600 * 1000); // shift to UTC+8, read as UTC
  return {
    day: p.getUTCDay(),                       // 0=Sun..6=Sat (PHT)
    hh: String(p.getUTCHours()).padStart(2,"0"),
    mm: String(p.getUTCMinutes()).padStart(2,"0"),
    sec: p.getUTCSeconds(),
    minOfDay: p.getUTCHours()*60 + p.getUTCMinutes(),
    dateKey: p.toISOString().slice(0,10),     // YYYY-MM-DD in PHT
    dateStr: p.toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"}),
    timeStr: `${String(p.getUTCHours()).padStart(2,"0")}:${String(p.getUTCMinutes()).padStart(2,"0")}`
  };
}
const isWeekendPHT = () => { const d = phtParts().day; return d === 0 || d === 6; };
const toMin = t => { const [h,m] = t.split(":").map(Number); return h*60 + m; };

// ── SLACK ──
function postToSlack(text){
  return new Promise(resolve => {
    if (!SLACK_WEBHOOK_URL) { addLog("SLACK_WEBHOOK_URL not set — skipped post"); return resolve(false); }
    try {
      const payload = JSON.stringify({ text });
      const url = new URL(SLACK_WEBHOOK_URL);
      const opts = { hostname: url.hostname, path: url.pathname, method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } };
      const sr = https.request(opts, r => resolve(r.statusCode === 200));
      sr.on("error", () => resolve(false));
      sr.write(payload); sr.end();
    } catch { resolve(false); }
  });
}

// ── LOTTERY ACTIONS (server-owned) ──
const QUOTES = [
  { quote: "Ang taong nagtitiyaga, may nilaga.", attr: "Filipino proverb" },
  { quote: "Success is the sum of small efforts, repeated day in and day out.", attr: "Robert Collier" },
  { quote: "Great things never come from comfort zones.", attr: "Unknown" },
  { quote: "Kapag may tiyaga, may nilaga — at may premyo pa!", attr: "Sir Rendy" },
  { quote: "The night shift builds the heroes of tomorrow.", attr: "Bayaning Puyat" }
];

async function startLottery(prize, auto){
  store.started = true;
  store.prize = prize || store.config.defaultPrize;
  store.entries = {};
  store.entriesLocked = false;
  addLog(`Lottery ${auto ? "auto-" : ""}started — Prize: ${store.prize}`);
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  await postToSlack(
    `:lottery: *SMB Lottery — Bayaning Puyat Draw* is now OPEN! 🎉\n\n` +
    `🏆 *Tonight's Prize:* ${store.prize}\n` +
    `🔢 *Pick your 5 lucky numbers* (1–42) before the draw!\n` +
    `👉 *Enter here:* ${SITE_URL}\n\n` +
    `⏰ Entries lock at ${store.config.lockTime} PHT — don't miss out!\n` +
    `📸 *Screenshot your numbers as proof in case you win!*\n\n` +
    `💬 _A message from Sir Rendy:_\n> "${q.quote}"\n> — ${q.attr}\n\n` +
    `Sir Rendy is proud of every single one of you. Keep up the amazing work tonight! 💙\n\n` +
    `_SMB VS — Bayaning Puyat Shift_`
  );
}

async function lockEntries(){
  store.entriesLocked = true;
  addLog("Entries locked");
  await postToSlack(`:lock: *SMB Lottery* — Entries are now *LOCKED* (${store.config.lockTime} PHT). Good luck, mga Bayani! 🍀`);
}

function drawNumbers(){
  const pool = Array.from({length: 42}, (_, i) => i + 1);
  const nums = [];
  while (nums.length < 5) nums.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return nums;
}

async function runDraw(label, isTest = false){
  const nums = drawNumbers();
  const t = phtParts();
  store.history.unshift({ label, nums, date: t.dateStr, time: t.timeStr, test: isTest });
  store.history = store.history.slice(0, 50);
  addLog(`${label} — ${nums.join(", ")}${isTest ? " (test)" : ""}`);
  await postToSlack(
    `:lottery: *SMB Lottery — ${label}*${isTest ? " _(test)_" : ""}\n` +
    `:eight_spoked_asterisk: Numbers drawn: *${nums.join(" · ")}*`
  );
  return nums;
}

async function postSummaryAndStop(){
  const real = store.history.filter(r => !r.test && r.date === phtParts().dateStr);
  if (real.length){
    let text = `:trophy: *SMB Lottery — Shift Summary* _(auto)_\n\n`;
    [...real].reverse().forEach(r => {
      const winners = Object.entries(store.entries)
        .filter(([, e]) => e.picks.filter(n => r.nums.includes(n)).length === 5)
        .map(([n]) => n);
      text += `:eight_spoked_asterisk: *${r.label}*\n   📅 ${r.date} · ${r.time}\n   Numbers: \`${r.nums.join(" · ")}\`\n`;
      text += winners.length ? `   :tada: Jackpot: ${winners.join(", ")}\n\n` : `   _No jackpot_\n\n`;
    });
    await postToSlack(text);
    addLog("Shift summary posted");
  }
  store.started = false;
  store.entriesLocked = false;
  addLog("Lottery auto-stopped");
}

// ── SCHEDULER (window-based; never misses a minute even if ticks drift) ──
const fired = new Set(); // keys: `${dateKey}|${type}|${time}`
let lastMin = null, lastDateKey = null;

function crossed(targetMin, prevMin, nowMin){
  if (prevMin === null) return targetMin === nowMin;
  if (prevMin <= nowMin) return targetMin > prevMin && targetMin <= nowMin;   // normal
  return targetMin > prevMin || targetMin <= nowMin;                          // wrapped midnight
}

async function tick(){
  const t = phtParts();
  if (t.dateKey !== lastDateKey){ // new PHT day — clear old fire keys
    for (const k of fired) if (!k.startsWith(t.dateKey)) fired.delete(k);
    lastDateKey = t.dateKey;
  }
  const prevMin = lastMin;
  lastMin = t.minOfDay;
  if (isWeekendPHT()) return;

  const c = store.config;
  const fire = async (type, time, fn) => {
    const key = `${t.dateKey}|${type}|${time}`;
    if (!fired.has(key) && crossed(toMin(time), prevMin, t.minOfDay)){
      fired.add(key);
      try { await fn(); } catch (e) { addLog(`${type} failed: ${e.message}`); }
    }
  };

  await fire("autostart", c.autoStartTime, () => { if (!store.started) return startLottery(null, true); });
  await fire("lock", c.lockTime, () => { if (store.started && !store.entriesLocked) return lockEntries(); });
  for (const dt of c.drawTimes)
    await fire("draw", dt, () => { if (store.started) return runDraw(`Draw at ${dt} PHT`); });
  await fire("announce", c.announceTime, () => { if (store.started) return postSummaryAndStop(); });
}
setInterval(tick, 15000);
tick();

// Keep-alive self-ping (helps on Render free tier; pair with external pinger for reliability)
setInterval(() => { try { https.get(SITE_URL, () => {}); } catch {} }, 10 * 60 * 1000);

// ── HTTP SERVER ──
require("http").createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  const json = (code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };

  let body = "";
  req.on("data", c => body += c);
  req.on("end", async () => {
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
      const file = path.join(__dirname, "index.html");
      if (fs.existsSync(file)) { res.writeHead(200, { "Content-Type": "text/html" }); res.end(fs.readFileSync(file)); }
      else { res.writeHead(404); res.end("index.html not found"); }
      return;
    }

    if (req.method === "POST" && req.url === "/slack") {
      try { const { text } = JSON.parse(body); json(200, { ok: await postToSlack(text) }); }
      catch { json(400, { ok: false }); }
      return;
    }

    if (req.method === "GET" && req.url === "/entries") return json(200, store.entries);

    if (req.method === "POST" && req.url === "/entries") {
      if (store.entriesLocked) return json(403, { ok: false, error: "Entries are locked" });
      try {
        const { name, picks } = JSON.parse(body);
        if (!name || !Array.isArray(picks) || picks.length !== 5) return json(400, { ok: false });
        store.entries[name] = { picks, locked: true };
        json(200, { ok: true });
      } catch { json(400, { ok: false }); }
      return;
    }

    if (req.method === "POST" && req.url === "/entries/reset") { store.entries = {}; return json(200, { ok: true }); }

    if (req.method === "GET" && req.url === "/status")
      return json(200, {
        started: store.started, prize: store.prize, entriesLocked: store.entriesLocked,
        config: store.config, history: store.history, log: store.log.slice(0, 20),
        serverTimePHT: `${phtParts().hh}:${phtParts().mm}`, weekend: isWeekendPHT()
      });

    if (req.method === "GET" && req.url === "/config") return json(200, store.config);

    if (req.method === "POST" && req.url === "/config") {
      try {
        const c = JSON.parse(body);
        const valid = t => /^\d{2}:\d{2}$/.test(t);
        if (Array.isArray(c.drawTimes) && c.drawTimes.every(valid)) store.config.drawTimes = c.drawTimes;
        if (valid(c.autoStartTime)) store.config.autoStartTime = c.autoStartTime;
        if (valid(c.lockTime)) store.config.lockTime = c.lockTime;
        if (valid(c.announceTime)) store.config.announceTime = c.announceTime;
        if (typeof c.defaultPrize === "string" && c.defaultPrize.trim()) store.config.defaultPrize = c.defaultPrize.trim();
        // allow re-firing today at newly set times
        addLog("Config updated: " + JSON.stringify(store.config));
        json(200, { ok: true, config: store.config });
      } catch { json(400, { ok: false }); }
      return;
    }

    if (req.method === "POST" && req.url === "/start") {
      try { const { prize } = JSON.parse(body || "{}"); await startLottery(prize, false); json(200, { ok: true }); }
      catch { json(400, { ok: false }); }
      return;
    }

    if (req.method === "POST" && req.url === "/stop") { store.started = false; store.entriesLocked = false; addLog("Lottery stopped (manual)"); return json(200, { ok: true }); }

    if (req.method === "POST" && req.url === "/lock") { store.entriesLocked = true; addLog("Entries locked (manual)"); return json(200, { ok: true }); }

    if (req.method === "POST" && req.url === "/draw") {
      try {
        const { label, test } = JSON.parse(body || "{}");
        const nums = await runDraw(label || "Manual draw", !!test);
        json(200, { ok: true, nums });
      } catch { json(400, { ok: false }); }
      return;
    }

    res.writeHead(404); res.end("Not found");
  });
}).listen(PORT, () => { addLog(`Server running on port ${PORT} — scheduler active (PHT)`); });
