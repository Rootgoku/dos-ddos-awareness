// Tiny local static server. It serves this folder only and generates no attack traffic.
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = __dirname;
const port = Number(process.env.PORT || 4173);
const types = {".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".png":"image/png",".svg":"image/svg+xml"};
http.createServer((req,res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname); }
  catch { res.writeHead(400); return res.end("Bad request"); }
  if (pathname === "/") pathname = "/index.html";
  const file = path.resolve(root, "." + pathname);
  if (!file.startsWith(root + path.sep) && file !== path.join(root,"index.html")) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(file, (err,data) => {
    if (err) { res.writeHead(404, {"Content-Type":"text/plain; charset=utf-8"}); return res.end("Not found"); }
    res.writeHead(200, {"Content-Type": types[path.extname(file)] || "application/octet-stream", "X-Content-Type-Options":"nosniff", "Cache-Control":"no-store"});
    res.end(data);
  });
}).listen(port, "127.0.0.1", () => console.log(`TrafficLab ready at http://127.0.0.1:${port}\nLocal-only server. No real traffic generation.`));
