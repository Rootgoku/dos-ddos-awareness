# TrafficLab — Educational DDoS Traffic Simulator

A local-first, interactive dashboard for teaching traffic volume, server capacity, queue saturation, request drops, and defensive mitigation concepts. It uses browser-side visual effects and a deterministic teaching model only.

## Safety boundary

- It does **not** generate, replay, or send DoS/DDoS traffic.
- It does **not** contact any remote host or target.
- The moving particles and request counters are simulated in the browser.
- The included Node server binds to `127.0.0.1` so it is only reachable from the same computer by default.
- Use the project to teach defensive concepts such as rate limiting, caching, load balancing, monitoring, and capacity planning.

## Requirements

- Node.js 18+ (recommended) and npm. The app itself has no third-party dependencies.
- A modern browser such as Chrome, Edge, or Firefox.

## Run on Windows

1. Extract `ddos-traffic-simulator.zip`.
2. Open the extracted `ddos-traffic-simulator` folder.
3. In File Explorer, click the address bar, type `cmd`, and press Enter.
4. Run:

   ```bat
   node --version
   npm start
   ```

5. Open **http://127.0.0.1:4173** in your browser.
6. Press `Ctrl+C` in the terminal to stop the server.

If Node.js is not installed, install the current LTS release from https://nodejs.org/ and reopen the terminal.

## Run on Linux / Kali Linux / macOS

Open a terminal in the project folder and run:

```bash
node --version
npm start
```

Then visit **http://127.0.0.1:4173**. Stop with `Ctrl+C`.

## No-Node alternative

You can serve the static frontend using Python:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Open **http://127.0.0.1:8000**. Stop with `Ctrl+C`.

## Student lab tasks

1. Set the attack rate to 30 req/s and server capacity to 120 req/s. Record incoming, served, and dropped rates.
2. Increase attack rate until incoming requests exceed capacity. Explain why dropped requests increase.
3. Increase capacity and compare the result.
4. Pause and resume the animation. Reset to return to the baseline.
5. Compare the conceptual DoS and DDoS tabs. Explain why a real distributed event can involve many source systems.
6. Propose a mitigation plan using rate limits, caching/CDN, load balancing, upstream filtering, and monitoring.

## Packaging and deployment

### Create a ZIP

From the parent folder, zip the complete `ddos-traffic-simulator` folder. On Windows, right-click the folder → **Compress to ZIP file**. On Linux/macOS:

```bash
zip -r ddos-traffic-simulator.zip ddos-traffic-simulator
```

### Deploy later

This project is a static frontend plus a tiny local preview server. For public static hosting, upload `index.html`, `styles.css`, and `app.js` to a static host such as GitHub Pages. `server.js` is only for local preview and is not required for static hosting. Do not expose a development server to the public internet. If you later add a backend, deploy it separately with authentication, rate limits, logging, and a clearly defined safe test environment.

## Project files

- `index.html` — semantic dashboard structure and controls
- `styles.css` — responsive neon / glass-panel design and CSS server/laptop illustration
- `app.js` — canvas traffic animation, safe simulation model, metrics, tabs, sliders, pause and reset
- `server.js` — localhost-only static file server
- `package.json` — start script, no external dependencies
