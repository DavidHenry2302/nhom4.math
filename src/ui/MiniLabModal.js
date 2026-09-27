/**
 * MiniLabModal.js
 * Adaptive remediation mini-lab when student struggles with linear denominator solving.
 */

export class MiniLabModal {
  constructor(onSuccess) {
    this.onSuccess = onSuccess;
    this.currentStep = 0;
    this.miniLab = null;
    this.createModalDOM();
  }

  createModalDOM() {
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'modal-backdrop hidden';
    this.modalEl.id = 'mini-lab-modal';
    this.modalEl.innerHTML = `
      <div class="modal-dialog mini-lab-dialog">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">🧪</span>
            <div>
              <h2 id="mini-lab-title">MINI-LAB BỔ TRỢ NỀN TẢNG</h2>
              <span class="modal-subtitle">Ôn tập giải phương trình mẫu số bằng 0</span>
            </div>
          </div>
          <button id="btn-close-mini" class="btn-close">&times;</button>
        </div>

        <div class="modal-body" id="mini-lab-body">
          <p id="mini-lab-desc" class="mini-desc"></p>
          
          <div class="mini-step-card">
            <div id="mini-step-eq" class="mini-eq font-digit">x + 2 = 0</div>
            <p id="mini-step-hint" class="mini-hint text-muted"></p>
            
            <div class="mini-input-wrap">
              <input type="text" id="mini-input" class="input-text" placeholder="Nhập giá trị x (ví dụ: -2)">
              <button id="btn-submit-mini" class="btn btn-primary">Kiểm tra</button>
            </div>
            <div id="mini-feedback" class="feedback-area"></div>
          </div>
        </div>

        <div class="modal-footer">
          <span id="mini-step-counter" class="text-muted">Bước 1/3</span>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);

    this.modalEl.querySelector('#btn-close-mini').addEventListener('click', () => this.hide());
    this.modalEl.querySelector('#btn-submit-mini').addEventListener('click', () => this.checkStep());
    this.modalEl.querySelector('#mini-input').addEventListener('keyup', (e) => {
      if (e.key === 'Enter') this.checkStep();
    });
  }

  show(miniLabData) {
    this.miniLab = miniLabData;
    this.currentStep = 0;
    document.getElementById('mini-lab-desc').textContent = miniLabData.message;
    this.renderCurrentStep();
    this.modalEl.classList.remove('hidden');
  }

  hide() {
    this.modalEl.classList.add('hidden');
  }

  renderCurrentStep() {
    const step = this.miniLab.steps[this.currentStep];
    document.getElementById('mini-step-eq').textContent = step.equation;
    document.getElementById('mini-step-hint').textContent = `💡 Gợi ý: ${step.hint}`;
    document.getElementById('mini-step-counter').textContent = `Bước ${this.currentStep + 1}/${this.miniLab.steps.length}`;
    document.getElementById('mini-input').value = '';
    document.getElementById('mini-feedback').innerHTML = '';
    document.getElementById('mini-input').focus();
  }

  checkStep() {
    const step = this.miniLab.steps[this.currentStep];
    const val = document.getElementById('mini-input').value.trim().toLowerCase().replace(/\s+/g, '');
    const fb = document.getElementById('mini-feedback');

    let isOk = false;
    if (step.symbolic) {
      isOk = (val === step.symbolic || val === '-(d/c)');
    } else {
      isOk = (parseFloat(val) === step.answer);
    }

    if (isOk) {
      fb.className = 'feedback-area feedback-success';
      fb.textContent = '✓ Chính xác!';
      setTimeout(() => {
        this.currentStep++;
        if (this.currentStep < this.miniLab.steps.length) {
          this.renderCurrentStep();
        } else {
          alert('Chúc mừng em đã hoàn thành xuất sắc bài Mini-Lab! Kỹ năng giải phương trình mẫu số đã vững chắc.');
          this.hide();
          if (this.onSuccess) this.onSuccess();
        }
      }, 700);
    } else {
      fb.className = 'feedback-area feedback-error';
      fb.textContent = '✗ Chưa đúng. Chú ý quy tắc chuyển vế đổi dấu!';
    }
  }
}
