/**
 * MissionPanel.js
 * Left panel driving the pedagogical interaction:
 * Story -> Mystery -> Prediction Options -> Socratic Guidance -> 4-Tier Hints -> Reasoning & Discovery.
 */

export class MissionPanel {
  constructor(container, missionEngine, onPredictionSubmit, onReasoningSubmit, onHintRequested, onOpenLog) {
    this.container = container;
    this.engine = missionEngine;
    this.onPredictionSubmit = onPredictionSubmit;
    this.onReasoningSubmit = onReasoningSubmit;
    this.onHintRequested = onHintRequested;
    this.onOpenLog = onOpenLog;
    this.render();
  }

  render() {
    const mission = this.engine.currentMission;
    if (!mission) {
      this.container.innerHTML = `<div class="mission-loading">Đang tải phòng nghiên cứu...</div>`;
      return;
    }

    const isCompleted = this.engine.progress.isCompleted(mission.id);

    this.container.innerHTML = `
      <div class="mission-panel-wrapper">
        <!-- Header -->
        <div class="mission-top">
          <span class="mission-code-badge">${mission.code}</span>
          <span class="rank-badge rank-${mission.rank.toLowerCase()}">${mission.rank}</span>
          ${isCompleted ? '<span class="status-completed-pill">✓ HOÀN THÀNH</span>' : ''}
        </div>

        <h2 class="mission-title">${mission.title}</h2>

        <!-- Story & Mystery Card -->
        <div class="card-briefing">
          <div class="briefing-story">
            <span class="icon">📖</span>
            <p>${mission.story}</p>
          </div>
          <div class="briefing-mystery">
            <span class="icon">❓</span>
            <p><strong>Bí ẩn khoa học:</strong> ${mission.mystery}</p>
          </div>
        </div>

        <!-- AI Instructor Dialogue Bubble -->
        <div class="ai-instructor-box">
          <div class="ai-header">
            <span class="ai-avatar">🤖</span>
            <span class="ai-name">FLIGHT INSTRUCTOR</span>
          </div>
          <div id="ai-speech-text" class="ai-speech">
            ${this.getInitialSpeech(mission)}
          </div>
        </div>

        <!-- STEP 1: PREDICTION -->
        <div id="section-prediction" class="mission-step-section ${this.engine.step === 'PREDICTION' ? 'active-step' : ''}">
          <h3 class="step-title">🧠 Bước 1: Dự đoán trước khi bay</h3>
          <p class="prompt-text">${mission.predictionPrompt}</p>
          
          <div class="options-group">
            ${mission.predictionOptions.map(opt => `
              <label class="option-label ${this.engine.studentPrediction && this.engine.studentPrediction.id === opt.id ? 'selected' : ''}">
                <input type="radio" name="prediction-opt" value="${opt.id}" ${this.engine.studentPrediction && this.engine.studentPrediction.id === opt.id ? 'checked' : ''} ${this.engine.step !== 'PREDICTION' ? 'disabled' : ''}>
                <span class="opt-id">${opt.id}.</span>
                <span class="opt-text">${opt.text}</span>
              </label>
            `).join('')}
          </div>

          ${this.engine.step === 'PREDICTION' ? `
            <button id="btn-submit-predict" class="btn btn-primary btn-block">Xác nhận Dự đoán & Tiến hành Bay</button>
          ` : ''}
        </div>

        <!-- STEP 2: FLIGHT EXPERIMENT -->
        <div id="section-flight" class="mission-step-section ${this.engine.step === 'EXPERIMENT' || this.engine.step === 'REASONING' ? 'active-step' : ''}">
          <h3 class="step-title">🔬 Bước 2: Thí nghiệm Chuyến bay</h3>
          <p class="task-desc">${mission.flightTask}</p>
          <div class="flight-hint-note">
            💡 Điều khiển máy bay ở cụm điều khiển trung tâm và quan sát bảng số liệu Hộp đen.
          </div>
        </div>

        <!-- STEP 3: REASONING & FORMULA DISCOVERY -->
        <div id="section-reasoning" class="mission-step-section ${this.engine.step === 'REASONING' || this.engine.step === 'COMPLETED' ? 'active-step' : ''}">
          <h3 class="step-title">💡 Bước 3: Tự suy luận & Phát hiện quy luật</h3>
          <p class="reasoning-prompt">${mission.reasoningPrompt}</p>

          ${this.renderReasoningInput(mission)}

          <div id="reasoning-feedback" class="feedback-area"></div>
        </div>

        <!-- 4-TIER HINT SYSTEM -->
        <div class="hints-accordion">
          <div class="hints-header">
            <span>💡 Hệ thống gợi ý 4 tầng</span>
            <button id="btn-request-hint" class="btn-hint" ${!this.engine.hintEngine.canRequestMore(mission) ? 'disabled' : ''}>
              Xin gợi ý (${this.engine.hintEngine.currentTier}/4)
            </button>
          </div>
          <div id="hints-list" class="hints-container">
            ${this.renderUnlockedHints(mission)}
          </div>
        </div>

        <!-- STEP 4: MISSION LOG BUTTON -->
        ${this.engine.step === 'COMPLETED' ? `
          <div class="completion-banner">
            <h3>🎉 NHIỆM VỤ HOÀN THÀNH!</h3>
            <p>Công thức toán học đã được mở khóa và lưu vào hồ sơ chuyến bay.</p>
            <div class="completion-actions">
              <button id="btn-view-log" class="btn btn-accent">📜 Xem Flight Log</button>
              <button id="btn-next-mission" class="btn btn-primary">Tiếp tục nhiệm vụ sau ➔</button>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    this.bindEvents();
  }

  getInitialSpeech(mission) {
    if (this.engine.step === 'PREDICTION') {
      return 'Đừng vội nhìn vào công thức! Hãy đưa ra dự đoán của trực giác em trước.';
    }
    if (this.engine.step === 'EXPERIMENT') {
      return 'Bây giờ hãy bấm [BAY THỬ] hoặc [Khảo sát x]. Dữ liệu hộp đen sẽ chứng minh dự đoán của em!';
    }
    if (this.engine.step === 'REASONING') {
      return 'Em quan sát thấy gì từ các con số? Hãy tổng kết quy luật vào ô bên dưới.';
    }
    return 'Xuất sắc! Em vừa tự khám phá bản chất toán học từ hiện tượng chuyến bay!';
  }

  renderReasoningInput(mission) {
    if (this.engine.step === 'COMPLETED') {
      return `
        <div class="unlocked-formula-box">
          <div class="unlocked-title">🔓 QUY LUẬT TOÁN HỌC ĐƯỢC MỞ KHÓA:</div>
          <div class="formula-latex">\\[ ${mission.unlockedFormula} \\]</div>
        </div>
      `;
    }

    if (mission.expectedAnswer.type === 'CHOICE') {
      return `
        <div class="reasoning-choice-box">
          <p>Chọn kết luận đúng nhất từ thực nghiệm:</p>
          <div class="choice-btns">
            ${mission.predictionOptions.map(opt => `
              <button class="btn-reason-choice" data-id="${opt.id}">${opt.id}. ${opt.text}</button>
            `).join('')}
          </div>
        </div>
      `;
    }

    const placeholder = mission.expectedAnswer.type === 'ASYMPTOTE_FORMULA' 
      ? 'Nhập x = ... hoặc y = ... hoặc -d/c'
      : 'Nhập giá trị số (ví dụ: 2, 3, -1.5)';

    return `
      <div class="reasoning-input-group">
        <input type="text" id="input-reasoning" class="input-text" placeholder="${placeholder}">
        <button id="btn-submit-reasoning" class="btn btn-accent">Kiểm tra Quy luật</button>
      </div>
    `;
  }

  renderUnlockedHints(mission) {
    const hints = this.engine.hintEngine.getAllUnlockedHints(mission);
    if (hints.length === 0) {
      return '<div class="hint-empty">Chưa có gợi ý nào được kích hoạt. Hãy thử tự suy luận trước!</div>';
    }
    return hints.map(h => `
      <div class="hint-card tier-${h.tier}">
        <div class="hint-tier-label">${h.label}</div>
        <div class="hint-tier-text">${h.text}</div>
      </div>
    `).join('');
  }

  bindEvents() {
    const btnPredict = document.getElementById('btn-submit-predict');
    if (btnPredict) {
      btnPredict.addEventListener('click', () => {
        const selected = this.container.querySelector('input[name="prediction-opt"]:checked');
        if (!selected) {
          alert('Vui lòng chọn một phương án dự đoán trước khi bay!');
          return;
        }
        if (this.onPredictionSubmit) this.onPredictionSubmit(selected.value);
      });
    }

    const btnReasoning = document.getElementById('btn-submit-reasoning');
    if (btnReasoning) {
      btnReasoning.addEventListener('click', () => {
        const input = document.getElementById('input-reasoning');
        if (!input || !input.value.trim()) {
          alert('Vui lòng nhập câu trả lời hoặc công thức em tìm được!');
          return;
        }
        if (this.onReasoningSubmit) this.onReasoningSubmit(input.value.trim());
      });
    }

    this.container.querySelectorAll('.btn-reason-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.onReasoningSubmit) this.onReasoningSubmit(btn.dataset.id);
      });
    });

    const btnHint = document.getElementById('btn-request-hint');
    if (btnHint) {
      btnHint.addEventListener('click', () => {
        if (this.onHintRequested) this.onHintRequested();
      });
    }

    const btnLog = document.getElementById('btn-view-log');
    if (btnLog) {
      btnLog.addEventListener('click', () => {
        if (this.onOpenLog) this.onOpenLog();
      });
    }

    const btnNext = document.getElementById('btn-next-mission');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const nextId = this.engine.getNextMissionId();
        if (nextId) {
          this.engine.loadMission(nextId);
        }
      });
    }
  }

  setSpeech(text) {
    const el = document.getElementById('ai-speech-text');
    if (el) el.innerHTML = text;
  }

  setFeedback(feedback) {
    const el = document.getElementById('reasoning-feedback');
    if (!el) return;

    if (feedback.isCorrect || feedback.isValid) {
      el.className = 'feedback-area feedback-success';
      el.innerHTML = `<strong>✓ CHÍNH XÁC:</strong> ${feedback.feedback}`;
    } else {
      el.className = 'feedback-area feedback-error';
      el.innerHTML = `<strong>✗ ${feedback.misconceptionCode ? 'PHÁT HIỆN LỖI' : 'CHƯA ĐÚNG'}:</strong> ${feedback.feedback}`;
    }
  }
}
