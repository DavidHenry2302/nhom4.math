/**
 * GraphHUD.js
 * Aviation Cockpit Instrument Panel:
 * Altimeter, Pitch ladder, Distance to barrier, Live Telemetry feed, and Data Export.
 */

export class GraphHUD {
  constructor(container, flightRecorder) {
    this.container = container;
    this.recorder = flightRecorder;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="hud-instruments">
        <div class="instrument-card">
          <div class="inst-header">CAO ĐỘ f(x)</div>
          <div id="inst-altitude" class="inst-value font-digit">0.00</div>
          <div class="inst-sub">Mức bay FL</div>
        </div>

        <div class="instrument-card">
          <div class="inst-header">TỌA ĐỘ x</div>
          <div id="inst-x" class="inst-value font-digit">0.00</div>
          <div class="inst-sub">Vị trí hành trình</div>
        </div>

        <div class="instrument-card">
          <div class="inst-header">ĐỘ DỐC f'(x)</div>
          <div id="inst-slope" class="inst-value font-digit">0.00</div>
          <div class="inst-sub">Tiếp tuyến đường bay</div>
        </div>

        <div class="instrument-card">
          <div class="inst-header">CỰ LY TỚI TCĐ</div>
          <div id="inst-barrier" class="inst-value font-digit">N/A</div>
          <div class="inst-sub">Khoảng cách an toàn</div>
        </div>

        <div class="instrument-card">
          <div class="inst-header">TRẠNG THÁI BAY</div>
          <div id="inst-status" class="inst-badge status-normal">NORMAL</div>
          <div id="inst-sub-status" class="inst-sub">Ổn định</div>
        </div>
      </div>

      <div class="telemetry-section">
        <div class="telemetry-header">
          <div class="telemetry-title">
            <span>📡 FLIGHT RECORDER (HỘP ĐEN)</span>
            <span id="telemetry-count" class="badge-count">0 mẫu</span>
          </div>
          <div class="telemetry-actions">
            <button id="btn-copy-table" class="btn-sm">📋 Sao chép</button>
            <button id="btn-export-csv" class="btn-sm btn-accent">💾 Xuất CSV</button>
            <button id="btn-clear-rec" class="btn-sm">🗑 Xóa</button>
          </div>
        </div>

        <div class="telemetry-table-wrapper">
          <table class="telemetry-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Tọa độ x</th>
                <th>Cao độ f(x)</th>
                <th>Cự ly tới TCĐ</th>
                <th>Độ dốc f'(x)</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody id="telemetry-tbody">
              <tr><td colspan="6" class="text-muted">Chưa có dữ liệu chuyến bay. Bấm [BAY THỬ] để bắt đầu ghi.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  bindEvents() {
    document.getElementById('btn-export-csv').addEventListener('click', () => {
      const csv = this.recorder.toCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flight_recorder_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('btn-copy-table').addEventListener('click', () => {
      const txt = this.recorder.toFormattedTable();
      navigator.clipboard.writeText(txt).then(() => {
        alert('Đã sao chép bảng dữ liệu Hộp đen vào bộ nhớ đệm!');
      });
    });

    document.getElementById('btn-clear-rec').addEventListener('click', () => {
      this.recorder.clear();
      this.updateTelemetryTable();
    });
  }

  updateHUD(aircraft, rf, proximity) {
    const altEl = document.getElementById('inst-altitude');
    const xEl = document.getElementById('inst-x');
    const slopeEl = document.getElementById('inst-slope');
    const barrierEl = document.getElementById('inst-barrier');
    const statusEl = document.getElementById('inst-status');
    const subStatusEl = document.getElementById('inst-sub-status');

    if (!altEl) return;

    altEl.textContent = aircraft.y !== null && Number.isFinite(aircraft.y) ? aircraft.y.toFixed(2) : '---';
    xEl.textContent = aircraft.x.toFixed(2);

    const slope = rf && rf.isDefined ? rf.derivative(aircraft.x) : null;
    slopeEl.textContent = slope !== null && Number.isFinite(slope) ? slope.toFixed(3) : '---';

    if (proximity && proximity.distance !== null) {
      barrierEl.textContent = proximity.distance.toFixed(2);
    } else {
      barrierEl.textContent = 'N/A';
    }

    if (proximity) {
      statusEl.textContent = proximity.status;
      statusEl.className = `inst-badge status-${proximity.status.toLowerCase()}`;
      subStatusEl.textContent = proximity.status === 'STALL' ? 'DỪNG KHẨN CẤP' :
                                proximity.status === 'CRITICAL' ? 'CẢNH BÁO ĐỎ' :
                                proximity.status === 'CAUTION' ? 'CHÚ Ý' : 'BÌNH THƯỜNG';
    }
  }

  updateTelemetryTable() {
    const tbody = document.getElementById('telemetry-tbody');
    const countEl = document.getElementById('telemetry-count');
    if (!tbody) return;

    const recent = this.recorder.getRecent(8).reverse();
    countEl.textContent = `${this.recorder.records.length} mẫu`;

    if (recent.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-muted">Chưa có dữ liệu chuyến bay. Bấm [BAY THỬ] để bắt đầu ghi.</td></tr>';
      return;
    }

    tbody.innerHTML = recent.map(r => `
      <tr class="row-${r.status.toLowerCase()}">
        <td>${r.time}s</td>
        <td class="font-digit">${r.x}</td>
        <td class="font-digit font-bold">${r.fx}</td>
        <td class="font-digit">${r.distanceToVA}</td>
        <td class="font-digit">${r.slope}</td>
        <td><span class="badge-${r.status.toLowerCase()}">${r.status}</span></td>
      </tr>
    `).join('');
  }
}
