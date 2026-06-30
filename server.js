const https = require("https");
const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT || 3000;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

const store = { entries: {}, started: false, prize: "" };

require("http").createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  let body = "";
  req.on("data", c => body += c);
  req.on("end", () => {

    // Serve the lottery HTML app
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
      const file = path.join(__dirname, "index.html");
      if (fs.existsSync(file)) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fs.readFileSync(file));
      } else {
        res.writeHead(404); res.end("index.html not found");
      }
      return;
    }

    // POST to Slack
    if (req.method === "POST" && req.url === "/slack") {
      try {
        const { text } = JSON.parse(body);
        const payload = JSON.stringify({ text });
        const url = new URL(SLACK_WEBHOOK_URL);
        const opts = { hostname: url.hostname, path: url.pathname, method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } };
        const sr = https.request(opts, r => {
          console.log("Slack status:", r.statusCode);
          res.writeHead(200); res.end(JSON.stringify({ ok: r.statusCode === 200 }));
        });
        sr.on("error", e => { res.writeHead(500); res.end(JSON.stringify({ ok: false, error: e.message })); });
        sr.write(payload); sr.end();
      } catch (e) { res.writeHead(400); res.end(JSON.stringify({ ok: false })); }
      return;
    }

    // GET entries
    if (req.method === "GET" && req.url === "/entries") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(store.entries)); return;
    }

    // POST entry
    if (req.method === "POST" && req.url === "/entries") {
      try {
        const { name, picks } = JSON.parse(body);
        store.entries[name] = { picks, locked: true };
        res.writeHead(200); res.end(JSON.stringify({ ok: true }));
      } catch { res.writeHead(400); res.end(JSON.stringify({ ok: false })); }
      return;
    }

    // Reset entries
    if (req.method === "POST" && req.url === "/entries/reset") {
      store.entries = {};
      res.writeHead(200); res.end(JSON.stringify({ ok: true })); return;
    }

    // GET lottery status (started + prize)
    if (req.method === "GET" && req.url === "/status") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ started: store.started, prize: store.prize })); return;
    }

    // POST start lottery (sets prize + started flag)
    if (req.method === "POST" && req.url === "/start") {
      try {
        const { prize } = JSON.parse(body);
        store.started = true;
        store.prize = prize || "";
        store.entries = {};
        res.writeHead(200); res.end(JSON.stringify({ ok: true }));
      } catch { res.writeHead(400); res.end(JSON.stringify({ ok: false })); }
      return;
    }

    // POST stop lottery
    if (req.method === "POST" && req.url === "/stop") {
      store.started = false;
      res.writeHead(200); res.end(JSON.stringify({ ok: true })); return;
    }

    res.writeHead(404); res.end("Not found");
  });
}).listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
