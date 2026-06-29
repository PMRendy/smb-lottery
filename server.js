const https = require("https");
const PORT = process.env.PORT || 3000;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

require("http").createServer((req, res) => {
  // Allow ALL origins including Claude artifact sandbox
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  // Health check
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200); res.end("SMB Lottery Proxy is running"); return;
  }

  if (req.method === "POST" && req.url === "/slack") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const { text } = JSON.parse(body);
        const payload = JSON.stringify({ text });
        const url = new URL(SLACK_WEBHOOK_URL);
        const options = {
          hostname: url.hostname,
          path: url.pathname,
          method: "POST",
          headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }
        };
        const slackReq = https.request(options, slackRes => {
          let data = "";
          slackRes.on("data", c => data += c);
          slackRes.on("end", () => {
            console.log(`Slack response: ${slackRes.statusCode} — ${data}`);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: slackRes.statusCode === 200, status: slackRes.statusCode, body: data }));
          });
        });
        slackReq.on("error", err => {
          console.error("Slack error:", err.message);
          res.writeHead(500); res.end(JSON.stringify({ ok: false, error: err.message }));
        });
        slackReq.write(payload);
        slackReq.end();
      } catch (e) {
        console.error("Parse error:", e.message);
        res.writeHead(400); res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404); res.end("Not found");
}).listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
