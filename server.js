const https = require("https");

const PORT = process.env.PORT || 3000;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

require("http").createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  if (req.method === "POST" && req.url === "/slack") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
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
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, status: slackRes.statusCode }));
      });
      slackReq.on("error", err => {
        res.writeHead(500); res.end(JSON.stringify({ ok: false, error: err.message }));
      });
      slackReq.write(payload);
      slackReq.end();
    });
    return;
  }

  res.writeHead(404); res.end("Not found");
}).listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
