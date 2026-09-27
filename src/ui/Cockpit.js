/**
 * Cockpit.js
 * Controls aircraft flight parameters (a, b, c, d sliders), Flight actions (Bay thử, Bay ngược, Nhảy tọa độ, Dừng), and Speed.
 */

export class Cockpit {
  constructor(container, flightEngine, onParamsChange) {
    this.container = container;
    this.engine = flightEngine;
    this.onParamsChange = onParamsChange;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="cockpit-panel">
        <div class="cockpit-header">
          <span class="cockpit-title">⚙️ THAM SỐ ĐIỀU KHIỂN</span>
          <span id="formula-display" class="formula-badge">f(x) = (2x + 1) / (x + 3)</span>
        </div>

        <div class="sliders-grid">
          <div class="slider-group">
            <div class="slider-label">
              <span>Hệ số a:</span>
              <span id="val-a" class="val-pill">2</span>
            </div>
            <input type="range" id="slider-a" min="-10" max="10" step="1" value="2">
          </div>

          <div class="slider-group">
            <div class="slider-label">
              <span>Hệ số b:</span>
              <span id="val-b" class="val-pill">1</span>
            </div>
            <input type="range" id="slider-b" min="-10" max="10" step="1" value="1">
          </div>

          <div class="slider-group">
            <div class="slider-label">
              <span>Hệ số c:</span>
              <span id="val-c" class="val-pill">1</span>
            </div>
            <input type="range" id="slider-c" min="-5" max="5" step="1" value="1">
          </div>

          <div class="slider-group">
            <div class="slider-label">
              <span>Hệ số d:</span>
              <span id="val-d" class="val-pill">3</span>
            </div>
            <input type="range" id="slider-d" min="-10" max="10" step="1" value="3">
          </div>
        </div>

        <div class="flight-actions-cluster">
          <div class="flight-btn-row">
            <button id="btn-takeoff" class="btn btn-primary">🛫 BAY THỬ (x → +∞)</button>
            <button id="btn-reverse" class="btn btn-secondary">🛬 BAY NGƯỢC (x → -∞)</button>
            <button id="btn-stop" class="btn btn-danger">⏹ DỪNG</button>
          </div>

          <div class="jump-coords-row">
            <span class="jump-label">Khảo sát x:</span>
            <button class="btn-jump" data-x="0">x = 0</button>
            <button class="btn-jump" data-x="1">x = 1</button>
            <button class="btn-jump" data-x="2.9">x = 2.9</button>
            <button class="btn-jump" data-x="10">x = 10</button>
            <button class="btn-jump" data-x="100">x = 100</button>
            <button class="btn-jump" data-x="1000">x = 1000</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const sliders = ['a', 'b', 'c', 'd'];
    sliders.forEach(key => {
      const slider = document.getElementById(`slider-${key}`);
      const valSpan = document.getElementById(`val-${key}`);
      slider.addEventListener('input', () => {
        valSpan.textContent = slider.value;
        this.emitChanges();
      });
    });

    document.getElementById('btn-takeoff').addEventListener('click', () => {
      this.engine.startFlight(this.engine.aircraft.x || 0, 1);
    });

    document.getElementById('btn-reverse').addEventListener('click', () => {
      this.engine.startFlight(this.engine.aircraft.x || 0, -1);
    });

    document.getElementById('btn-stop').addEventListener('click', () => {
      this.engine.stop();
    });

    this.container.querySelectorAll('.btn-jump').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetX = parseFloat(btn.dataset.x);
        this.engine.jumpTo(targetX);
      });
    });
  }

  setParams(a, b, c, d, isLocked = false) {
    ['a', 'b', 'c', 'd'].forEach(k => {
      const slider = document.getElementById(`slider-${k}`);
      const valSpan = document.getElementById(`val-${k}`);
      const val = { a, b, c, d }[k];
      slider.value = val;
      valSpan.textContent = val;
      slider.disabled = isLocked;
    });
    this.updateFormulaDisplay();
  }

  emitChanges() {
    const a = parseFloat(document.getElementById('slider-a').value);
    const b = parseFloat(document.getElementById('slider-b').value);
    const c = parseFloat(document.getElementById('slider-c').value);
    const d = parseFloat(document.getElementById('slider-d').value);
    this.updateFormulaDisplay();
    if (this.onParamsChange) {
      this.onParamsChange(a, b, c, d);
    }
  }

  updateFormulaDisplay() {
    const formulaBadge = document.getElementById('formula-display');
    if (this.engine.rf) {
      formulaBadge.textContent = `f(x) = ${this.engine.rf.toExpressionString()}`;
    }
  }
}
