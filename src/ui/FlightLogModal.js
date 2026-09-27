/**
 * FlightLogModal.js
 * Renders the scientific Flight Log #XX report card, honoring the student's research discovery.
 */

export class FlightLogModal {
  constructor() {
    this.modalEl = null;
    this.createModalDOM();
  }

  createModalDOM() {
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'modal-backdrop hidden';
    this.modalEl.id = 'flight-log-modal';
    this.modalEl.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">✈️</span>
            <div>
              <h2 id="log-modal-title">FLIGHT LOG #00</h2>
              <span class="modal-subtitle">BÁO CÁO THỰC NGHIỆM HÀNG KHÔNG TOÁN HỌC</span>
            </div>
          </div>
          <button id="btn-close-log" class="btn-close">&times;</button>
        </div>

        <div class="modal-body" id="log-modal-body">
          <!-- Content injected dynamically -->
        </div>

        <div class="modal-footer">
          <button id="btn-copy-log" class="btn btn-secondary">📋 Sao chép báo cáo</button>
          <button id="btn-print-log" class="btn btn-primary">🖨 In báo cáo</button>
          <button id="btn-dismiss-log" class="btn btn-accent">Đóng</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);

    // Bind events
    this.modalEl.querySelector('#btn-close-log').addEventListener('click', () => this.hide());
    this.modalEl.querySelector('#btn-dismiss-log').addEventListener('click', () => this.hide());
    this.modalEl.querySelector('#btn-copy-log').addEventListener('click', () => {
      const text = document.getElementById('log-modal-body').innerText;
      navigator.clipboard.writeText(text).then(() => alert('Đã sao chép nội dung Flight Log!'));
    });
    this.modalEl.querySelector('#btn-print-log').addEventListener('click', () => {
      window.print();
    });
  }

  show(logReport, telemetryTable = '') {
    if (!logReport) return;

    const titleEl = document.getElementById('log-modal-title');
    const bodyEl = document.getElementById('log-modal-body');

    titleEl.textContent = `FLIGHT LOG #${logReport.missionId}`;

    bodyEl.innerHTML = `
      <div class="log-sheet">
        <div class="log-meta-bar">
          <div><strong>Nhiệm vụ:</strong> ${logReport.missionTitle}</div>
          <div><strong>Cấp bậc:</strong> ${logReport.rank}</div>
          <div><strong>Thời gian:</strong> ${logReport.timestamp}</div>
        </div>

        <div class="log-section">
          <h4>1. GIẢ THUYẾT / DỰ ĐOÁN BAN ĐẦU</h4>
          <div class="log-box prediction-box">${logReport.prediction}</div>
        </div>

        <div class="log-section">
          <h4>2. DỮ LIỆU THỰC NGHIỆM HỘP ĐEN (EVIDENCE)</h4>
          <div class="log-box telemetry-box font-digit">
            ${telemetryTable ? `<pre>${telemetryTable}</pre>` : '<p>Dữ liệu chuyến bay đã được mã hóa an toàn.</p>'}
          </div>
        </div>

        <div class="log-section">
          <h4>3. KẾT LUẬN TOÁN HỌC & SUY LUẬN</h4>
          <div class="log-box conclusion-box">${logReport.conclusion}</div>
        </div>

        <div class="log-section">
          <h4>4. CÔNG THỨC MỞ KHÓA (FORMULA UNLOCKED)</h4>
          <div class="log-formula-badge font-digit">
            \\[ ${logReport.formula} \\]
          </div>
        </div>

        <div class="log-instructor-verdict">
          <div class="verdict-icon">✓</div>
          <div>
            <strong>ĐÁNH GIÁ CỦA AI FLIGHT INSTRUCTOR:</strong>
            <p>Học viên đã quan sát tỉ mỉ dữ liệu thực tế, kiểm chứng thành công giả thuyết khoa học và tự rút ra bản chất giải tích của bài toán.</p>
            <span class="hint-count-pill">Số lượng gợi ý đã dùng: ${logReport.hintsUsed}/4</span>
          </div>
        </div>
      </div>
    `;

    this.modalEl.classList.remove('hidden');
  }

  hide() {
    this.modalEl.classList.add('hidden');
  }
}
