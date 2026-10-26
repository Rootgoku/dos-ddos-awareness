const $ = (id) => document.getElementById(id);
const mode = document.body.dataset.mode || 'ddos';
const state = { running: true, attack: 90, legitimate: 40, capacity: 120, queue: 80, rejected: 10, tick: 0 };

function drawDevices() {
  if ($('devices')) return;
  const laptop = (x, y, scale = 1) => `<g class="laptop" transform="translate(${x} ${y}) scale(${scale})"><path class="laptop-shadow" d="M2 104 L68 116 L143 101 L76 88 Z"/><rect class="laptop-lid" x="10" y="2" width="106" height="70" rx="5"/><rect class="laptop-bezel" x="16" y="8" width="94" height="57" rx="2"/><rect class="laptop-screen-glow" x="21" y="13" width="84" height="47" rx="1"/><path class="screen-shine" d="M22 14 H53 L92 59 H69 Z"/><circle class="camera" cx="63" cy="5" r="1.5"/><path class="laptop-hinge" d="M24 72 H102 L108 78 H18 Z"/><path class="laptop-base" d="M18 76 L108 76 L143 98 L4 98 Z"/><path class="keyboard" d="M31 79 L99 79 L119 93 L19 93 Z"/><path class="key-row" d="M35 82 H98 M30 86 H104 M25 90 H110"/><path class="trackpad" d="M57 88 H79 L85 93 H51 Z"/><path class="laptop-front" d="M4 98 H143 L137 106 H10 Z"/></g>`;
  const devices = mode === 'dos' ? laptop(20, 120, 0.85) : laptop(8, 10, 0.62) + laptop(8, 145, 0.62) + laptop(8, 280, 0.62);
  $('packets').insertAdjacentHTML('beforebegin', `<g id="devices">${devices}</g>`);
}

function drawPackets() {
  drawDevices();
  const packets = $('packets'); const queue = $('queueCells'); const served = $('servedPackets');
  $('network').appendChild(queue);
  packets.innerHTML = ''; queue.innerHTML = ''; served.innerHTML = '';
  const attackCount = mode === 'dos' ? Math.min(7, Math.max(2, Math.ceil(state.attack / 20))) : Math.min(8, Math.max(2, Math.ceil(state.attack / 18)));
  for (let i = 0; i < attackCount; i += 1) { const p = (state.tick * .009 + i / attackCount) % 1; const lane = i % 3; const sy = mode === 'dos' ? 168 : [70,125,180][lane]; packets.insertAdjacentHTML('beforeend', `<circle class="packet" cx="${125 + p * 285}" cy="${sy + (168 - sy) * p}" r="4" fill="#438aff"/>`); }
  for (let i = 0; i < 4; i += 1) { const p = (state.tick * .007 + i / 4) % 1; packets.insertAdjacentHTML('beforeend', `<circle class="packet" cx="${125 + p * 285}" cy="${235 - p * 67}" r="4" fill="#35d98d"/>`); }
  const cells = Math.min(20, Math.max(1, Math.ceil(state.queue / 4)));
  for (let i = 0; i < cells; i += 1) { const x = 414 + (i % 5) * 21; const y = 140 + Math.floor(i / 5) * 27; queue.insertAdjacentHTML('beforeend', `<rect class="queue-cell" x="${x}" y="${y}" width="15" height="15" fill="${i < 10 ? '#438aff' : '#35d98d'}"/>`); }
  const servedCount = Math.min(6, Math.max(2, Math.ceil(state.capacity / 25)));
  for (let i = 0; i < servedCount; i += 1) { const p = (state.tick * .012 + i / servedCount) % 1; served.insertAdjacentHTML('beforeend', `<circle class="packet" cx="${732 + p * 115}" cy="168" r="4" fill="${i % 2 ? '#438aff' : '#35d98d'}"/>`); }
}

function render() {
  const incoming = state.attack + state.legitimate; const dropped = Math.max(0, incoming - state.capacity); const utilization = Math.round((incoming / state.capacity) * 100);
  $('attackSvg').textContent = state.attack; $('legitSvg').textContent = state.legitimate; $('queueValue').textContent = Math.round(state.queue); $('rejectedSvg').textContent = Math.round(dropped); $('servedSvg').textContent = Math.min(incoming, state.capacity); $('capacitySvg').textContent = state.capacity;
  $('incomingValue').textContent = incoming; $('servedValue').textContent = Math.min(incoming, state.capacity); $('droppedValue').textContent = Math.round(dropped); $('utilizationValue').textContent = utilization; $('rateValue').textContent = state.attack; $('statusText').textContent = dropped > 0 ? 'Over capacity — requests dropping' : 'Within capacity — traffic flowing'; $('statusText').parentElement.classList.toggle('healthy', dropped === 0); $('toggleButton').textContent = state.running ? 'Pause' : 'Resume'; drawPackets();
}

function animate() { if (state.running) { state.tick += 1; state.queue = Math.max(0, Math.min(80, state.queue + (state.attack + state.legitimate - state.capacity) * .01)); render(); } requestAnimationFrame(animate); }
$('attackRate').addEventListener('input', (event) => { state.attack = Number(event.target.value); render(); });
$('toggleButton').addEventListener('click', () => { state.running = !state.running; render(); });
$('resetButton').addEventListener('click', () => { Object.assign(state, { running: true, attack: 90, queue: 80, tick: 0 }); $('attackRate').value = 90; render(); });
render(); requestAnimationFrame(animate);
