(() => {
  const $ = (id) => document.getElementById(id);
  const canvas = $("trafficCanvas");
  const ctx = canvas.getContext("2d");
  const state = { attack: 90, legit: 40, capacity: 120, paused: false, mode: "ddos", particles: [], last: 0, elapsed: 0 };
  const defaults = { attack: 90, legit: 40, capacity: 120 };
  const colors = { attack: "#168bff", legit: "#26f0ae", reject: "#c66aff", served: "#00d8ff" };
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function metrics() {
    const attack = state.mode === "dos" ? Math.round(state.attack * 0.58) : state.attack;
    const legit = state.legit;
    const incoming = attack + legit;
    const served = Math.min(incoming, state.capacity);
    const dropped = Math.max(0, incoming - state.capacity);
    const utilization = Math.round((incoming / state.capacity) * 100);
    return { attack, legit, incoming, served, dropped, utilization };
  }
  function renderMetrics() {
    const m = metrics();
    $("attackLabel").textContent = `${m.attack} req/s`;
    $("legitLabel").textContent = `${m.legit} req/s`;
    $("servedLabel").textContent = `${m.served}/s`;
    $("rejectLabel").textContent = `Rejected ${m.dropped}/s`;
    $("capacityLabel").textContent = state.capacity;
    $("incomingMetric").innerHTML = `${m.incoming} <small>req/s</small>`;
    $("servedMetric").innerHTML = `${m.served} <small>req/s</small>`;
    $("droppedMetric").innerHTML = `${m.dropped} <small>req/s</small>`;
    $("utilMetric").innerHTML = `${m.utilization}<small>%</small>`;
    $("utilBar").style.width = `${clamp(m.utilization, 0, 100)}%`;
    $("utilState").textContent = m.utilization > 100 ? "Overloaded" : m.utilization > 80 ? "High" : "Stable";
    $("utilBar").style.background = m.utilization > 100 ? "linear-gradient(90deg,#ff9d52,#ff5572)" : "linear-gradient(90deg,#00d8ff,#26f0ae)";
    $("statusText").textContent = m.dropped ? "Over capacity — requests dropping" : m.utilization > 80 ? "High utilization" : "Operating within capacity";
    $("statusPill").style.borderColor = m.dropped ? "#71314b" : "#155844";
    $("statusPill").style.background = m.dropped ? "#281526" : "#08271f";
    $("statusPill").style.color = m.dropped ? "#ff9eb0" : "#8afbd2";
    $("statusPill").querySelector(".status-dot").style.background = m.dropped ? "var(--red)" : "var(--green)";
    $("statusPill").querySelector(".status-dot").style.boxShadow = m.dropped ? "0 0 12px var(--red)" : "0 0 12px var(--green)";
    $("queueLabel").textContent = `${Math.round(clamp(m.utilization, 0, 100) * .8)} / 80`;
    $("queueFoot").textContent = m.dropped ? "Queue full · excess requests are dropped" : "Queue stable · requests within capacity";
    $("attackValue").textContent = `${state.attack} req/s`;
    $("legitValue").textContent = `${state.legit} req/s`;
    $("capacityValue").textContent = `${state.capacity} req/s`;
    buildQueue(m);
    updateLesson(m);
  }
  function buildQueue(m) {
    const grid = $("queueGrid");
    grid.innerHTML = "";
    const attackCells = Math.round(clamp(m.attack / Math.max(1, m.incoming), 0, 1) * 24);
    const legitCells = 40 - attackCells;
    for (let i = 0; i < 40; i++) {
      const cell = document.createElement("span");
      cell.className = "queue-cell " + (i < attackCells ? "" : i < attackCells + legitCells ? "legit" : "drop");
      cell.style.animationDelay = `${(i % 8) * .08}s`;
      grid.appendChild(cell);
    }
  }
  function updateLesson(m) {
    if (state.mode === "overview") {
      $("pageTitle").textContent = "Live Traffic Overview";
      $("pageSubtitle").textContent = "A safe model of incoming requests, service capacity, and queue pressure.";
      $("lessonTitle").textContent = "Read the dashboard";
      $("lessonText").textContent = "Incoming requests are the combined modeled load. Served requests are capped by server capacity. When incoming traffic exceeds capacity, the model marks the difference as dropped requests.";
      $("learningTip").textContent = "Change one slider at a time and observe how the queue and throughput respond.";
    } else if (state.mode === "dos") {
      $("pageTitle").textContent = "Single-source DoS Model";
      $("pageSubtitle").textContent = "Conceptual single-source denial-of-service scenario; traffic remains simulated.";
      $("lessonTitle").textContent = "DoS vs. DDoS";
      $("lessonText").textContent = "A DoS scenario is modeled here as one source contributing a reduced share of the configured attack rate. Real incidents vary; this is an intentionally simplified teaching model.";
      $("learningTip").textContent = "Compare a single modeled source with server capacity; no network requests are generated.";
    } else {
      $("pageTitle").textContent = "Live DDoS Traffic Simulator";
      $("pageSubtitle").textContent = "Explore how traffic volume, queues, and server capacity interact.";
      $("lessonTitle").textContent = "What are you seeing?";
      $("lessonText").textContent = "A DDoS model represents many distributed sources sending more requests than a service can handle. In this safe simulation, moving dots are visual effects; no requests leave your browser.";
      $("learningTip").textContent = "Compare incoming traffic with server capacity to see why overload causes drops.";
    }
  }
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.particles = [];
    const w = rect.width, h = rect.height;
    for (let i = 0; i < 90; i++) state.particles.push({ lane: i % 3, t: Math.random(), speed: .00012 + Math.random() * .00022, r: 1 + Math.random() * 2.2, phase: Math.random() * 6.28 });
  }
  function pointAt(t, lane, w, h) {
    const startX = w * (lane === 2 ? .15 : .12);
    const endX = w * .89;
    const x = startX + (endX - startX) * t;
    const startY = lane === 0 ? h * .28 : lane === 1 ? h * .72 : h * .5;
    const endY = h * .5;
    const controlY = lane === 0 ? h * .16 : lane === 1 ? h * .84 : h * .5;
    const y = (1-t)*(1-t)*startY + 2*(1-t)*t*controlY + t*t*endY;
    return {x,y};
  }
  function drawFrame(timestamp) {
    const rect = canvas.getBoundingClientRect(), w = rect.width, h = rect.height;
    ctx.clearRect(0, 0, w, h);
    const m = metrics();
    // Draw glowing curved lanes: all graphics are local canvas effects.
    [0,1,2].forEach(lane => {
      const p0 = pointAt(0,lane,w,h), p1 = pointAt(1,lane,w,h);
      const cpX = w * .46;
      ctx.beginPath(); ctx.moveTo(p0.x,p0.y);
      ctx.quadraticCurveTo(cpX, lane===0?h*.28:lane===1?h*.72:h*.5, w*.49,h*.5);
      ctx.strokeStyle = lane===1 ? "#26f0ae35" : lane===0 ? "#168bff38" : "#00d8ff25";
      ctx.lineWidth = lane===2 ? 2 : 3; ctx.stroke();
    });
    if (!state.paused) {
      state.particles.forEach(p => { p.t += p.speed * (1 + m.incoming / 150); if (p.t > 1) p.t = 0; });
    }
    state.particles.forEach(p => {
      const lane = p.lane;
      const pt = pointAt(p.t,lane,w,h);
      const color = lane === 1 ? colors.legit : lane === 0 ? colors.attack : colors.served;
      const alpha = .35 + .65 * (Math.sin(timestamp*.003+p.phase)+1)/2;
      ctx.beginPath(); ctx.arc(pt.x,pt.y,p.r,0,Math.PI*2);
      ctx.fillStyle = color; ctx.globalAlpha = alpha; ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.fill();
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    // Animated dots entering queue and a served path.
    const qx=w*.49, qy=h*.5;
    for(let i=0;i<5;i++){
      const x=qx+Math.sin(timestamp*.0015+i)*9, y=qy-47+i*22;
      ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fillStyle=i<3?colors.attack:colors.legit;ctx.fill();
    }
    if (!state.paused) requestAnimationFrame(drawFrame);
  }
  function startAnimation() { requestAnimationFrame(drawFrame); }
  function syncInputs() {
    state.attack = Number($("attackRate").value);
    state.legit = Number($("legitRate").value);
    state.capacity = Number($("serverCapacity").value);
    renderMetrics();
  }
  ["attackRate","legitRate","serverCapacity"].forEach(id => $(id).addEventListener("input", syncInputs));
  document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
    state.mode = tab.dataset.tab;
    renderMetrics();
  }));
  $("pauseBtn").addEventListener("click", () => {
    state.paused = !state.paused;
    document.body.classList.toggle("paused", state.paused);
    $("pauseText").textContent = state.paused ? "Resume" : "Pause";
    $("pauseIcon").textContent = state.paused ? "▶" : "Ⅱ";
    if (!state.paused) startAnimation();
  });
  $("resetBtn").addEventListener("click", () => {
    Object.assign(state, defaults, { paused:false, mode:"ddos", particles:[] });
    $("attackRate").value = defaults.attack; $("legitRate").value = defaults.legit; $("serverCapacity").value = defaults.capacity;
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === "ddos"));
    document.body.classList.remove("paused");
    $("pauseText").textContent = "Pause"; $("pauseIcon").textContent = "Ⅱ";
    resizeCanvas(); syncInputs(); startAnimation();
  });
  function updateClock() {
    $("clock").textContent = new Intl.DateTimeFormat(undefined,{hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date());
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas(); syncInputs(); updateClock(); setInterval(updateClock,1000); startAnimation();
})();