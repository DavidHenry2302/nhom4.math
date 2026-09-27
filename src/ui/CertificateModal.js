/**
 * CertificateModal.js
 * Renders the "FLIGHT RESEARCHER CERTIFIED" Graduation Diploma for students who conquer the Capstone mission.
 */

export class CertificateModal {
  constructor() {
    this.modalEl = null;
    this.createModalDOM();
  }

  createModalDOM() {
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'modal-backdrop hidden';
    this.modalEl.id = 'certificate-modal';
    this.modalEl.innerHTML = `
      <div class="modal-dialog certificate-dialog">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">🏆</span>
            <div>
              <h2>CHỨNG CHỈ TỐT NGHIỆP HÀNG KHÔNG TOÁN HỌC</h2>
              <span class="modal-subtitle">Học viện Hàng không Nghiên cứu AI Flight Math Lab</span>
            </div>
          </div>
          <button id="btn-close-cert" class="btn-close">&times;</button>
        </div>

        <div class="modal-body">
          <div class="certificate-frame">
            <div class="cert-gold-border">
              <div class="cert-header">
                <div class="cert-insignia">✈️ FLIGHT MATH LAB 🔬</div>
                <h1 class="cert-title">CHỨNG NHẬN DANH DỰ</h1>
                <p class="cert-statement">Chứng chỉ này trang trọng trao tặng cho:</p>
                <div class="cert-recipient-name">NHÀ NGHIÊN CỨU CHUYẾN BAY XUẤT SẮC</div>
              </div>

              <div class="cert-body-text">
                <p>Đã hoàn thành xuất sắc toàn bộ khóa huấn luyện thực nghiệm giải tích hàm phân thức, giới hạn và tiệm cận. Đã chứng minh năng lực tư duy phản biện khoa học, bác bỏ ngộ nhận và làm chủ mô hình hóa toán học.</p>
              </div>

              <div class="cert-rank-seal-wrap">
                <div class="cert-seal">
                  <div class="seal-inner">★ GOLD SEAL ★<br>FLIGHT RESEARCHER<br>CERTIFIED</div>
                </div>
                <div class="cert-signatures">
                  <div class="sig-block">
                    <div class="sig-line">Flight Instructor AI</div>
                    <div class="sig-title">Trợ giảng Thông minh Socratic</div>
                  </div>
                  <div class="sig-block">
                    <div class="sig-line">Mathematical Engine</div>
                    <div class="sig-title">Hệ thống Thẩm định Giải tích</div>
                  </div>
                </div>
              </div>

              <div class="cert-footer-motto">
                <em>“Đừng học công thức trước. Hãy thử nghiệm để tự phát hiện ra nó.”</em>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button id="btn-print-cert" class="btn btn-primary">🖨 In Chứng chỉ</button>
          <button id="btn-dismiss-cert" class="btn btn-accent">Đóng</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);

    this.modalEl.querySelector('#btn-close-cert').addEventListener('click', () => this.hide());
    this.modalEl.querySelector('#btn-dismiss-cert').addEventListener('click', () => this.hide());
    this.modalEl.querySelector('#btn-print-cert').addEventListener('click', () => window.print());
  }

  show() {
    this.modalEl.classList.remove('hidden');
  }

  hide() {
    this.modalEl.classList.add('hidden');
  }
}
