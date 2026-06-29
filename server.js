const https = require("https");
const PORT = process.env.PORT || 3000;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// In-memory store (persists while Render is awake)
const store = { entries: {}, drawHistory: [] };

require("http").createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  let body = "";
  req.on("data", c => body += c);
  req.on("end", () => {

    // Health check
    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200); res.end("SMB Lottery Proxy running"); return;
    }

    // POST to Slack
    if (req.method === "POST" && req.url === "/slack") {
      try {
        const { text } = JSON.parse(body);
        const payload = JSON.stringify({ text });
        const url = new URL(SLACK_WEBHOOK_URL);
        const opts = { hostname: url.hostname, path: url.pathname, method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } };
        const sr = https.request(opts, r => { res.writeHead(200); res.end(JSON.stringify({ ok: r.statusCode === 200 })); });
        sr.on("error", e => { res.writeHead(500); res.end(JSON.stringify({ ok: false, error: e.message })); });
        sr.write(payload); sr.end();
      } catch (e) { res.writeHead(400); res.end(JSON.stringify({ ok: false })); }
      return;
    }

    // GET all entries
    if (req.method === "GET" && req.url === "/entries") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(store.entries)); return;
    }

    // POST submit entry
    if (req.method === "POST" && req.url === "/entries") {
      try {
        const { name, picks } = JSON.parse(body);
        store.entries[name] = { picks, locked: true };
        res.writeHead(200); res.end(JSON.stringify({ ok: true }));
      } catch { res.writeHead(400); res.end(JSON.stringify({ ok: false })); }
      return;
    }

    // DELETE reset entries
    if (req.method === "POST" && req.url === "/entries/reset") {
      store.entries = {};
      res.writeHead(200); res.end(JSON.stringify({ ok: true })); return;
    }

    res.writeHead(404); res.end("Not found");
  });
}).listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
