/**
 * StageManager.js
 * Dynamic UI Engine for the 9-Stage Flight Training Journey.
 * Renders an uncluttered, tailored layout for each specific stage.
 */

import { JOURNEY_STAGES } from '../learning/JourneyData.js';
import { RationalFunction } from '../math/RationalFunction.js';
import { AsymptoteEngine } from '../math/AsymptoteEngine.js';

export class StageManager {
  constructor(container, flightEngine, renderer, audio, progress, onStageComplete) {
    this.container = container;
    this.engine = flightEngine;
    this.renderer = renderer;
    this.audio = audio;
    this.progress = progress;
    this.onStageComplete = onStageComplete;
    this.currentStageData = null;
  }

  loadStage(stageNum) {
    const data = JOURNEY_STAGES.find(s => s.stage === stageNum) || JOURNEY_STAGES[0];
    this.currentStageData = data;
    this.progress.setStage(stageNum);

    // Update math function for current stage
    const p = data.initialParams || { a: 2, b: 1, c: 1, d: 3 };
    const rf = new RationalFunction(p.a, p.b, p.c, p.d);
    this.engine.setFunction(rf);
    this.engine.stop();
    this.engine.aircraft.reset(data.startX || 0, rf.evaluate(data.startX || 0));

    this.render();
  }

  render() {
    const s = this.currentStageData;
    const isCompleted = this.progress.isCompleted(s.stage);

    this.container.innerHTML = `
      <!-- TOP STAGE STEPPER MAP -->
      <nav class="stage-stepper-bar">
        <div class="stepper-track">
          ${JOURNEY_STAGES.map(st => {
            const unlocked = this.progress.isUnlocked(st.stage);
            const done = this.progress.isCompleted(st.stage);
            const active = st.stage === s.stage;
            const cls = active ? 'step-pill active' : done ? 'step-pill done' : unlocked ? 'step-pill unlocked' : 'step-pill locked';
            return `
              <button class="${cls}" data-stage="${st.stage}" ${!unlocked ? 'disabled' : ''}>
                <span class="step-num">${done ? '✓' : st.stage}</span>
                <span class="step-label">${st.code}: ${st.title.split('—')[0].trim()}</span>
              </button>
            `;
          }).join('<span class="stepper-arrow">➔</span>')}
        </div>
      </nav>

      <!-- STAGE CONTENT WRAPPER -->
      <div class="stage-main-view">
        
        <!-- STAGE HEADER BANNER -->
        <header class="stage-header-card ${s.stage === 5 ? 'theme-critical' : ''}">
          <div class="stage-meta">
            <span class="stage-badge-phase">GIAI ĐOẠN ${s.phase}: ${s.phase === 1 ? 'HỌC & KHÁM PHÁ' : s.phase === 2 ? 'LUYỆN TẬP' : 'THỰC HÀNH BAY'}</span>
            <span class="stage-badge-role">🎖️ ${s.badgeName}</span>
            ${isCompleted ? '<span class="badge-done-tag">✓ ĐÃ HOÀN THÀNH</span>' : ''}
          </div>
          <h1 class="stage-title">${s.title}</h1>
          <p class="stage-subtitle">${s.subtitle}</p>
        </header>

        <!-- DYNAMIC STAGE BODY CONTAINER -->
        <div id="stage-body-slot" class="stage-body-slot">
          <!-- Injected dynamically based on stage -->
        </div>

      </div>
    `;

    this.bindStepperEvents();
    this.renderStageBody();
  }

  bindStepperEvents() {
    this.container.querySelectorAll('.step-pill:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = parseInt(btn.dataset.stage);
        this.loadStage(target);
      });
    });
  }

  renderStageBody() {
    const slot = document.getElementById('stage-body-slot');
    const s = this.currentStageData;

    switch (s.stage) {
      case 1:
        this.renderStage1_Academy(slot, s);
        break;
      case 2:
        this.renderStage2_Theory(slot, s);
        break;
      case 3:
        this.renderStage3_Observation(slot, s);
        break;
      case 4:
        this.renderStage4_Limit(slot, s);
        break;
      case 5:
        this.renderStage5_Critical(slot, s);
        break;
      case 6:
        this.renderStage6_Exercises(slot, s);
        break;
      case 7:
        this.renderStage7_Problem(slot, s);
        break;
      case 8:
        this.renderStage8_Simulator(slot, s);
        break;
      case 9:
        this.renderStage9_FinalFlight(slot, s);
        break;
      default:
        slot.innerHTML = `<p>Đang tải ải...</p>`;
    }
  }

  // ================= ẢI 1: FLIGHT ACADEMY =================
  renderStage1_Academy(slot, s) {
    slot.innerHTML = `
      <div class="academy-layout">
        <div class="academy-screen">
          <div class="visual-canvas-box">
            <canvas id="stage-mini-canvas" width="640" height="240"></canvas>
          </div>

          <div class="flight-gauges-row">
            <div class="gauge-card">
              <span class="gauge-title">VỊ TRÍ CẦN GẠT (x)</span>
              <span id="gauge-x" class="gauge-val font-digit">0.0</span>
              <span class="gauge-sub">Đầu vào (Input)</span>
            </div>
            <div class="gauge-card accent-card">
              <span class="gauge-title">CAO ĐỘ MÁY BAY f(x)</span>
              <span id="gauge-y" class="gauge-val font-digit">1.0</span>
              <span class="gauge-sub">Đầu ra: f(x) = 2x + 1</span>
            </div>
          </div>

          <div class="throttle-control-box">
            <label for="throttle-slider">
              <span>✈️ CẦN GẠT VỊ TRÍ (THROTTLE x):</span>
              <span id="throttle-val" class="throttle-pill font-digit">x = 0</span>
            </label>
            <input type="range" id="throttle-slider" min="0" max="8" step="1" value="0">
          </div>
        </div>

        <div class="academy-briefing">
          <div class="brief-card">
            <h3>📖 Hướng Dẫn Huấn Luyện:</h3>
            <p>${s.theoryBrief}</p>
            <p class="task-hint">👉 <strong>Thao tác:</strong> ${s.taskInstruction}</p>
          </div>

          <div class="quiz-card">
            <h4>❓ Câu hỏi kiểm tra vượt ải:</h4>
            <p>${s.quizQuestion}</p>
            <div class="quiz-options">
              ${s.quizOptions.map(opt => `
                <button class="btn-quiz-opt" data-correct="${opt.correct}">${opt.id}. ${opt.text}</button>
              `).join('')}
            </div>
            <div id="quiz-feedback" class="quiz-feedback"></div>
          </div>
        </div>
      </div>
    `;

    // Hook mini canvas and throttle slider
    const miniCanvas = document.getElementById('stage-mini-canvas');
    const miniCtx = miniCanvas.getContext('2d');
    const slider = document.getElementById('throttle-slider');
    const gaugeX = document.getElementById('gauge-x');
    const gaugeY = document.getElementById('gauge-y');
    const throttleVal = document.getElementById('throttle-val');

    const drawMiniFlight = (xVal) => {
      const yVal = 2 * xVal + 1;
      miniCtx.fillStyle = '#0a0f1d';
      miniCtx.fillRect(0, 0, miniCanvas.width, miniCanvas.height);

      // Draw grid line
      miniCtx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      miniCtx.lineWidth = 1;
      miniCtx.beginPath();
      miniCtx.moveTo(40, 200);
      miniCtx.lineTo(600, 200);
      miniCtx.stroke();

      // Draw flight line
      miniCtx.strokeStyle = '#38bdf8';
      miniCtx.lineWidth = 3;
      miniCtx.beginPath();
      miniCtx.moveTo(40, 200 - 1 * 10);
      miniCtx.lineTo(600, 200 - (2 * 8 + 1) * 10);
      miniCtx.stroke();

      // Draw plane position
      const px = 40 + (xVal / 8) * 540;
      const py = 200 - yVal * 10;
      miniCtx.fillStyle = '#f8fafc';
      miniCtx.font = '22px sans-serif';
      miniCtx.fillText('✈️', px - 12, py + 8);

      gaugeX.textContent = xVal.toFixed(1);
      gaugeY.textContent = yVal.toFixed(1);
      throttleVal.textContent = `x = ${xVal}`;
    };

    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      drawMiniFlight(val);
      this.audio.playBeep(400 + val * 40, 0.04);
    });

    drawMiniFlight(0);
    this.bindQuizPass(s);
  }

  // ================= ẢI 2: THEORY LAB =================
  renderStage2_Theory(slot, s) {
    slot.innerHTML = `
      <div class="theory-lab-layout">
        <div class="equation-stage-box">
          <div class="formula-master-hero">
            <span class="func-name">f(x) =</span>
            <div class="fraction-display">
              <span class="numerator"><span class="param-hl param-a">a</span>x + <span class="param-hl param-b">b</span></span>
              <span class="fraction-bar"></span>
              <span class="denominator"><span class="param-hl param-c">c</span>x + <span class="param-hl param-d">d</span></span>
            </div>
          </div>
          <p class="formula-caption">Nhấp vào từng tham số bên dưới để giải mã vai trò của nó:</p>

          <div class="params-cards-grid">
            <div class="param-card card-a">
              <span class="p-letter">HỆ SỐ a</span>
              <p>${s.paramGuides.a}</p>
            </div>
            <div class="param-card card-b">
              <span class="p-letter">HỆ SỐ b</span>
              <p>${s.paramGuides.b}</p>
            </div>
            <div class="param-card card-c">
              <span class="p-letter">HỆ SỐ c</span>
              <p>${s.paramGuides.c}</p>
            </div>
            <div class="param-card card-d">
              <span class="p-letter">HỆ SỐ d</span>
              <p>${s.paramGuides.d}</p>
            </div>
          </div>
        </div>

        <div class="academy-briefing">
          <div class="brief-card">
            <h3>📖 Cốt lõi cần nhớ:</h3>
            <p>${s.theoryBrief}</p>
          </div>

          <div class="quiz-card">
            <h4>❓ Câu hỏi xác nhận:</h4>
            <p>${s.quizQuestion}</p>
            <div class="quiz-options">
              ${s.quizOptions.map(opt => `
                <button class="btn-quiz-opt" data-correct="${opt.correct}">${opt.id}. ${opt.text}</button>
              `).join('')}
            </div>
            <div id="quiz-feedback" class="quiz-feedback"></div>
          </div>
        </div>
      </div>
    `;
    this.bindQuizPass(s);
  }

  // ================= ẢI 3: OBSERVATION LAB =================
  renderStage3_Observation(slot, s) {
    slot.innerHTML = `
      <div class="observation-layout">
        <div class="observation-left">
          <div class="obs-header">
            <h3>🔬 DỮ LIỆU ĐO ĐẠC CHUYẾN BAY: f(x) = (2x + 1) / (x + 3)</h3>
            <span class="obs-sub">Theo dõi cao độ thực tế khi x tăng dần từ 0 lên 1000:</span>
          </div>

          <table class="obs-table">
            <thead>
              <tr>
                <th>Vị trí x</th>
                <th>Cao độ f(x)</th>
                <th>Ghi nhận hiện tượng</th>
                <th>Thao tác bay</th>
              </tr>
            </thead>
            <tbody>
              ${s.samplePoints.map(pt => `
                <tr>
                  <td class="font-digit font-bold">x = ${pt.x}</td>
                  <td class="font-digit font-accent">${pt.y}</td>
                  <td>${pt.note}</td>
                  <td>
                    <button class="btn-sm btn-sample-jump" data-x="${pt.x}">Bay tới x=${pt.x}</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="obs-insight-box">
            <span class="icon">💡</span>
            <span><strong>Điều kỳ lạ:</strong> x tiếp tục tăng vọt từ 100 lên 1000, nhưng độ cao chỉ nhích nhẹ từ 1.95 lên 1.995!</span>
          </div>
        </div>

        <div class="academy-briefing">
          <div class="brief-card">
            <h3>📖 Nhiệm vụ Quan sát:</h3>
            <p>${s.theoryBrief}</p>
          </div>

          <div class="quiz-card">
            <h4>❓ Rút ra kết luận từ số liệu:</h4>
            <p>${s.quizQuestion}</p>
            <div class="quiz-options">
              ${s.quizOptions.map(opt => `
                <button class="btn-quiz-opt" data-correct="${opt.correct}">${opt.id}. ${opt.text}</button>
              `).join('')}
            </div>
            <div id="quiz-feedback" class="quiz-feedback"></div>
          </div>
        </div>
      </div>
    `;

    slot.querySelectorAll('.btn-sample-jump').forEach(btn => {
      btn.addEventListener('click', () => {
        const x = parseFloat(btn.dataset.x);
        this.engine.jumpTo(x);
        this.audio.playBeep(650, 0.05);
      });
    });

    this.bindQuizPass(s);
  }

  // ================= ẢI 4: LIMIT LAB =================
  renderStage4_Limit(slot, s) {
    slot.innerHTML = `
      <div class="limit-layout">
        <div class="limit-graph-view">
          <div class="limit-radar-box">
            <div class="ceiling-indicator">
              <span class="ceiling-line"></span>
              <span class="ceiling-badge">TRẦN BAY ỔN ĐỊNH: y = 2</span>
            </div>
            <div class="plane-flight-scene">
              <span class="plane-icon-flight">✈️</span>
              <span class="curve-trail">············································➔</span>
            </div>
          </div>

          <div class="limit-controls-row">
            <button id="btn-fly-pos-inf" class="btn btn-primary">🚀 Bay ra dương vô cực (x ➔ +∞)</button>
            <button id="btn-fly-neg-inf" class="btn btn-secondary">🛬 Bay ra âm vô cực (x ➔ -∞)</button>
          </div>
        </div>

        <div class="academy-briefing">
          <div class="brief-card">
            <h3>📖 Giới hạn là gì?</h3>
            <p>${s.theoryBrief}</p>
          </div>

          <div class="quiz-card">
            <h4>❓ Mở khóa công thức Tiệm cận ngang:</h4>
            <p>${s.quizQuestion}</p>
            <div class="quiz-options">
              ${s.quizOptions.map(opt => `
                <button class="btn-quiz-opt" data-correct="${opt.correct}">${opt.id}. ${opt.text}</button>
              `).join('')}
            </div>
            <div id="quiz-feedback" class="quiz-feedback"></div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-fly-pos-inf').addEventListener('click', () => {
      this.engine.jumpTo(1000);
      this.audio.playBeep(800, 0.08);
      alert('Máy bay đã bay tới x = 1000! Cao độ ghi nhận: 1.995... tiến sát y = 2.');
    });

    document.getElementById('btn-fly-neg-inf').addEventListener('click', () => {
      this.engine.jumpTo(-1000);
      this.audio.playBeep(800, 0.08);
      alert('Máy bay đã bay tới x = -1000! Cao độ ghi nhận: 2.005... cũng tiến sát y = 2.');
    });

    this.bindQuizPass(s);
  }

  // ================= ẢI 5: CRITICAL LAB =================
  renderStage5_Critical(slot, s) {
    slot.innerHTML = `
      <div class="critical-layout">
        <div class="critical-radar-stage">
          <div class="alert-status-banner">
            <span class="alert-icon">⚠️</span>
            <span class="alert-txt">HỆ THỐNG CẢNH BÁO: PHÁT HIỆN VÙNG CẤM BAY</span>
          </div>

          <div class="critical-meter-grid">
            <div class="meter-box">
              <span class="m-label">VỊ TRÍ HIỆN TẠI (x)</span>
              <span id="crit-x" class="m-val font-digit">0.0</span>
            </div>
            <div class="meter-box">
              <span class="m-label">CỰ LY TỚI ĐIỂM NGUY HIỂM</span>
              <span id="crit-dist" class="m-val font-digit text-danger">3.00</span>
            </div>
            <div class="meter-box">
              <span class="m-label">TRẠNG THÁI</span>
              <span id="crit-status" class="m-val text-warning">THEO DÕI</span>
            </div>
          </div>

          <div class="critical-probe-row">
            <span>Tiếp cận dần:</span>
            <button class="btn-probe" data-x="2.0">x = 2.0</button>
            <button class="btn-probe" data-x="2.5">x = 2.5</button>
            <button class="btn-probe" data-x="2.9">x = 2.9 (Cảnh báo)</button>
            <button class="btn-probe text-danger" data-x="2.99">x = 2.99 (Báo động)</button>
            <button class="btn-probe btn-danger" data-x="3.0">x = 3.0 (STALL)</button>
          </div>
        </div>

        <div class="academy-briefing">
          <div class="brief-card">
            <h3>🚨 Bức tường cấm bay:</h3>
            <p>${s.theoryBrief}</p>
          </div>

          <div class="quiz-card">
            <h4>❓ Giải mã nguyên nhân:</h4>
            <p>${s.quizQuestion}</p>
            <div class="quiz-options">
              ${s.quizOptions.map(opt => `
                <button class="btn-quiz-opt" data-correct="${opt.correct}">${opt.id}. ${opt.text}</button>
              `).join('')}
            </div>
            <div id="quiz-feedback" class="quiz-feedback"></div>
          </div>
        </div>
      </div>
    `;

    const critX = document.getElementById('crit-x');
    const critDist = document.getElementById('crit-dist');
    const critStatus = document.getElementById('crit-status');

    slot.querySelectorAll('.btn-probe').forEach(btn => {
      btn.addEventListener('click', () => {
        const x = parseFloat(btn.dataset.x);
        critX.textContent = x.toFixed(2);
        const dist = Math.abs(x - 3.0);
        critDist.textContent = dist.toFixed(3);

        if (dist === 0) {
          this.audio.playStallAlarm();
          critStatus.textContent = '🚨 DỪNG KHẨN CẤP (STALL)';
          critStatus.className = 'm-val text-danger';
        } else if (dist < 0.1) {
          this.audio.playBeep(900, 0.1);
          critStatus.textContent = '⚠️ BÁO ĐỘNG ĐỎ';
          critStatus.className = 'm-val text-danger';
        } else {
          this.audio.playBeep(500, 0.05);
          critStatus.textContent = 'CHÚ Ý';
          critStatus.className = 'm-val text-warning';
        }
      });
    });

    this.bindQuizPass(s);
  }

  // ================= ẢI 6: EXERCISES ROOM =================
  renderStage6_Exercises(slot, s) {
    slot.innerHTML = `
      <div class="exercises-layout">
        <div class="exercise-sheet-card">
          <div class="ex-header">
            <h3>📝 BÀI TẬP SÁT HẠCH PHẢN XẠ PHI CÔNG</h3>
            <p>Áp dụng 2 công thức: <strong>TCĐ: x = -d/c</strong> và <strong>TCN: y = a/c</strong></p>
          </div>

          <div class="challenge-item">
            <h4>Thử thách 1:</h4>
            <p>${s.challenges[0].question}</p>
            <div class="ex-input-row">
              <span>x = </span>
              <input type="text" id="ex-input-1" class="input-text font-digit" placeholder="Nhập giá trị x (ví dụ: 2)">
              <button id="btn-check-ex1" class="btn btn-accent">Kiểm tra</button>
            </div>
            <div id="ex-fb-1" class="quiz-feedback"></div>
          </div>

          <div class="challenge-item">
            <h4>Thử thách 2:</h4>
            <p>${s.challenges[1].question}</p>
            <div class="ex-input-row">
              <span>y = </span>
              <input type="text" id="ex-input-2" class="input-text font-digit" placeholder="Nhập giá trị y (ví dụ: 1.5 hoặc 3/2)">
              <button id="btn-check-ex2" class="btn btn-accent">Kiểm tra</button>
            </div>
            <div id="ex-fb-2" class="quiz-feedback"></div>
          </div>
        </div>

        <div class="academy-briefing">
          <div class="brief-card">
            <h3>📖 Mẹo giải nhanh:</h3>
            <p>1. Tiệm cận đứng: Cho mẫu số = 0 rồi tìm x.</p>
            <p>2. Tiệm cận ngang: Lấy hệ số trước x ở tử chia cho hệ số trước x ở mẫu (a chia c).</p>
          </div>

          <div class="pass-next-card hidden" id="ex-pass-card">
            <h4>🎉 XUẤT SẮC! ĐÃ VƯỢT QUA SÁT HẠCH</h4>
            <button id="btn-ex-next" class="btn btn-primary btn-block">➔ Mở khóa Ải 7: Problem Lab</button>
          </div>
        </div>
      </div>
    `;

    let q1Pass = false;
    let q2Pass = false;

    const checkDone = () => {
      if (q1Pass && q2Pass) {
        document.getElementById('ex-pass-card').classList.remove('hidden');
        this.audio.playSuccessChime();
        this.progress.completeStage(s.stage);
        document.getElementById('btn-ex-next').addEventListener('click', () => {
          this.loadStage(7);
        });
      }
    };

    document.getElementById('btn-check-ex1').addEventListener('click', () => {
      const val = document.getElementById('ex-input-1').value.trim();
      const fb = document.getElementById('ex-fb-1');
      if (val === '2') {
        fb.className = 'quiz-feedback success';
        fb.textContent = '✓ Chính xác! 2x - 4 = 0 => x = 2.';
        q1Pass = true;
        checkDone();
      } else {
        fb.className = 'quiz-feedback error';
        fb.textContent = '✗ Chưa đúng. Gợi ý: Hãy giải 2x - 4 = 0.';
        this.audio.playBeep(250, 0.1);
      }
    });

    document.getElementById('btn-check-ex2').addEventListener('click', () => {
      const val = document.getElementById('ex-input-2').value.trim();
      const fb = document.getElementById('ex-fb-2');
      if (val === '1.5' || val === '3/2') {
        fb.className = 'quiz-feedback success';
        fb.textContent = '✓ Chính xác! y = 3/2 = 1.5.';
        q2Pass = true;
        checkDone();
      } else {
        fb.className = 'quiz-feedback error';
        fb.textContent = '✗ Chưa đúng. Gợi ý: y = a/c = 3/2.';
        this.audio.playBeep(250, 0.1);
      }
    });
  }

  // ================= ẢI 7: PROBLEM LAB =================
  renderStage7_Problem(slot, s) {
    slot.innerHTML = `
      <div class="problem-layout">
        <div class="problem-left-card">
          <div class="prob-section">
            <h3>🛠️ BÀI TOÁN 1: THIẾT KẾ CHUYẾN BAY (BÀI TOÁN NGƯỢC)</h3>
            <p>${s.taskDesign}</p>
            <div class="quiz-options">
              ${s.quizOptions.map(opt => `
                <button class="btn-quiz-opt" data-correct="${opt.correct}">${opt.id}. ${opt.text}</button>
              `).join('')}
            </div>
            <div id="prob-fb-1" class="quiz-feedback"></div>
          </div>

          <div class="prob-section" style="margin-top: 20px;">
            <h3>🤖 BÀI TOÁN 2: PHẢN BIỆN "ĐỪNG TIN AI"</h3>
            <p>${s.critiqueQuestion}</p>
            <div class="quiz-options">
              ${s.critiqueOptions.map(opt => `
                <button class="btn-quiz-opt" data-correct="${opt.correct}">${opt.id}. ${opt.text}</button>
              `).join('')}
            </div>
            <div id="prob-fb-2" class="quiz-feedback"></div>
          </div>
        </div>

        <div class="academy-briefing">
          <div class="brief-card">
            <h3>💡 Tư duy Kỹ sư Trưởng:</h3>
            <p>${s.theoryBrief}</p>
          </div>

          <div class="pass-next-card hidden" id="prob-pass-card">
            <h4>🎉 HOÀN THÀNH XUẤT SẮC ẢI 7!</h4>
            <p>Em đã nắm vững cả bài toán thiết kế ngược và tư duy phản biện khoa học.</p>
            <button id="btn-prob-next" class="btn btn-primary btn-block">➔ Mở khóa Ải 8: Buồng Lái Toàn Diện</button>
          </div>
        </div>
      </div>
    `;

    let p1Done = false;
    let p2Done = false;

    const checkAll = () => {
      if (p1Done && p2Done) {
        document.getElementById('prob-pass-card').classList.remove('hidden');
        this.audio.playSuccessChime();
        this.progress.completeStage(s.stage);
        document.getElementById('btn-prob-next').addEventListener('click', () => {
          this.loadStage(8);
        });
      }
    };

    slot.querySelectorAll('.prob-section:nth-child(1) .btn-quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const isOk = btn.dataset.correct === 'true';
        const fb = document.getElementById('prob-fb-1');
        if (isOk) {
          fb.className = 'quiz-feedback success';
          fb.textContent = '✓ Chính xác! a = 3, d = -2.';
          p1Done = true;
          checkAll();
        } else {
          fb.className = 'quiz-feedback error';
          fb.textContent = '✗ Chưa đúng. Thử lại nhé!';
        }
      });
    });

    slot.querySelectorAll('.prob-section:nth-child(2) .btn-quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const isOk = btn.dataset.correct === 'true';
        const fb = document.getElementById('prob-fb-2');
        if (isOk) {
          fb.className = 'quiz-feedback success';
          fb.textContent = '✓ Tuyệt vời! Em vừa bác bỏ một giả định chưa đầy đủ của AI.';
          p2Done = true;
          checkAll();
        } else {
          fb.className = 'quiz-feedback error';
          fb.textContent = '✗ Hãy xem lại trường hợp c mang dấu âm.';
        }
      });
    });
  }

  // ================= ẢI 8: FLIGHT SIMULATOR (BUỒNG LÁI TOÀN DIỆN) =================
  renderStage8_Simulator(slot, s) {
    slot.innerHTML = `
      <div class="simulator-full-layout">
        <!-- Center Canvas -->
        <div class="sim-canvas-panel">
          <canvas id="stage-full-canvas" width="600" height="340"></canvas>
          <div class="sim-flight-actions">
            <button id="btn-sim-takeoff" class="btn btn-primary">🛫 BAY TIẾN (x ➔ +∞)</button>
            <button id="btn-sim-reverse" class="btn btn-secondary">🛬 BAY LÙI (x ➔ -∞)</button>
            <button id="btn-sim-stop" class="btn btn-danger">⏹ DỪNG BAY</button>
            <button id="btn-sim-complete" class="btn btn-accent" style="margin-left: auto;">✓ HOÀN THÀNH NHIỆM VỤ ẢI 8</button>
          </div>
        </div>

        <!-- Instruments and Sliders -->
        <div class="sim-right-instruments">
          <div class="sim-card">
            <h4>✈️ ĐỒNG HỒ PHI HÀNH</h4>
            <div class="sim-inst-grid">
              <div>Vị trí x: <strong id="sim-x" class="font-digit">0.0</strong></div>
              <div>Cao độ f(x): <strong id="sim-y" class="font-digit">0.25</strong></div>
              <div>Trần bay TCN: <strong class="text-accent font-digit">y = 2.0</strong></div>
              <div>Bức tường TCĐ: <strong class="text-danger font-digit">x = 4.0</strong></div>
            </div>
          </div>

          <div class="sim-card">
            <h4>⚙️ TINH CHỈNH THAM SỐ a, b, c, d</h4>
            <div class="sim-slider-row">
              <span>a: <b id="sim-val-a">2</b></span>
              <input type="range" id="sim-slider-a" min="-5" max="5" value="2">
            </div>
            <div class="sim-slider-row">
              <span>b: <b id="sim-val-b">1</b></span>
              <input type="range" id="sim-slider-b" min="-5" max="5" value="1">
            </div>
            <div class="sim-slider-row">
              <span>c: <b id="sim-val-c">1</b></span>
              <input type="range" id="sim-slider-c" min="-5" max="5" value="1">
            </div>
            <div class="sim-slider-row">
              <span>d: <b id="sim-val-d">-4</b></span>
              <input type="range" id="sim-slider-d" min="-10" max="10" value="-4">
            </div>
          </div>
        </div>
      </div>
    `;

    // Hook full canvas into renderer
    const fullCanvas = document.getElementById('stage-full-canvas');
    this.renderer.canvas = fullCanvas;
    this.renderer.ctx = fullCanvas.getContext('2d');
    this.renderer.resize(fullCanvas.width, fullCanvas.height);

    document.getElementById('btn-sim-takeoff').addEventListener('click', () => {
      this.engine.startFlight(this.engine.aircraft.x, 1);
      this.audio.startJetSound();
    });

    document.getElementById('btn-sim-reverse').addEventListener('click', () => {
      this.engine.startFlight(this.engine.aircraft.x, -1);
      this.audio.startJetSound();
    });

    document.getElementById('btn-sim-stop').addEventListener('click', () => {
      this.engine.stop();
      this.audio.stopJetSound();
    });

    // Slider hooks
    ['a', 'b', 'c', 'd'].forEach(k => {
      const sl = document.getElementById(`sim-slider-${k}`);
      sl.addEventListener('input', () => {
        document.getElementById(`sim-val-${k}`).textContent = sl.value;
        const a = parseFloat(document.getElementById('sim-slider-a').value);
        const b = parseFloat(document.getElementById('sim-slider-b').value);
        const c = parseFloat(document.getElementById('sim-slider-c').value);
        const d = parseFloat(document.getElementById('sim-slider-d').value);
        this.engine.rf.setCoefficients(a, b, c, d);
      });
    });

    document.getElementById('btn-sim-complete').addEventListener('click', () => {
      this.audio.playSuccessChime();
      this.progress.completeStage(s.stage);
      alert('Tuyệt vời! Em đã hoàn thành xuất sắc chuyến bay mô phỏng trên buồng lái toàn diện.');
      this.loadStage(9);
    });
  }

  // ================= ẢI 9: FINAL FLIGHT (TỐT NGHIỆP) =================
  renderStage9_FinalFlight(slot, s) {
    slot.innerHTML = `
      <div class="final-flight-layout">
        <div class="final-card-left">
          <div class="final-badge-header">
            <span class="final-trophy">🏆</span>
            <div>
              <h3>BÀI SÁT HẠCH TỐT NGHIỆP: CHUYẾN BAY BÍ ẨN</h3>
              <p>Phi cơ thử nghiệm đã ẩn công thức toán học. Hãy dùng các mốc bay khảo sát để tìm ra tiệm cận.</p>
            </div>
          </div>

          <div class="final-probe-toolbar">
            <span>Dò tìm dữ liệu:</span>
            <button class="btn-jump-final" data-x="0">Tại x = 0 (Cao độ: -0.33)</button>
            <button class="btn-jump-final" data-x="2.9">Tại x = 2.9 (Cao độ: 68.0)</button>
            <button class="btn-jump-final" data-x="3.0">Tại x = 3.0 (Còi STALL hú!)</button>
            <button class="btn-jump-final" data-x="1000">Tại x = 1000 (Cao độ: 1.998)</button>
          </div>

          <div class="final-quiz-wrap">
            <h4>❓ Trình nộp kết quả điều tra hệ thống:</h4>
            <p>${s.quizQuestion}</p>
            <div class="quiz-options">
              ${s.quizOptions.map(opt => `
                <button class="btn-quiz-opt" data-correct="${opt.correct}">${opt.id}. ${opt.text}</button>
              `).join('')}
            </div>
            <div id="quiz-feedback" class="quiz-feedback"></div>
          </div>
        </div>

        <div class="final-diploma-preview" id="diploma-box">
          <div class="diploma-border">
            <div class="dip-seal">★ CERTIFIED ★</div>
            <h3>CHỨNG NHẬN PHI CÔNG NGHIÊN CỨU</h3>
            <p class="dip-sub">FLIGHT RESEARCHER DIPLOMA</p>
            <p class="dip-congrats">Sẽ được trao tặng ngay khi em vượt qua bài sát hạch bí ẩn!</p>
          </div>
        </div>
      </div>
    `;

    slot.querySelectorAll('.btn-jump-final').forEach(btn => {
      btn.addEventListener('click', () => {
        const x = parseFloat(btn.dataset.x);
        if (x === 3.0) {
          this.audio.playStallAlarm();
        } else {
          this.audio.playBeep(700, 0.06);
        }
      });
    });

    this.bindQuizPass(s, () => {
      // Show diploma!
      const dipBox = document.getElementById('diploma-box');
      dipBox.innerHTML = `
        <div class="diploma-border diploma-awarded">
          <div class="dip-seal seal-gold">★ GOLD SEAL ★<br>FLIGHT RESEARCHER</div>
          <h2>CHỨNG CHỈ TỐT NGHIỆP DANH DỰ</h2>
          <p class="dip-sub">HỌC VIỆN HÀNG KHÔNG TOÁN HỌC FLIGHT MATH LAB</p>
          <div class="dip-student-name">PHI CÔNG NGHIÊN CỨU XUẤT SẮC</div>
          <p class="dip-award-body">Đã hoàn thành xuất sắc toàn bộ 9 Ải huấn luyện bay, làm chủ trọn vẹn giải tích hàm phân thức, giới hạn và tiệm cận!</p>
          <button id="btn-print-dip" class="btn btn-primary">🖨 In Chứng Chỉ Tốt Nghiệp</button>
        </div>
      `;
      document.getElementById('btn-print-dip').addEventListener('click', () => window.print());
    });
  }

  bindQuizPass(s, onAwardCallback = null) {
    const slot = document.getElementById('stage-body-slot');
    slot.querySelectorAll('.btn-quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const isOk = btn.dataset.correct === 'true';
        const fb = document.getElementById('quiz-feedback');
        if (isOk) {
          fb.className = 'quiz-feedback success';
          fb.innerHTML = `
            <strong>✓ CHÍNH XÁC!</strong> ${s.unlockedConcept || 'Đã hoàn thành mục tiêu của ải.'}
            ${s.unlockedFormula ? `<div class="unlocked-math">\\[ ${s.unlockedFormula} \\]</div>` : ''}
          `;
          this.audio.playSuccessChime();
          this.progress.completeStage(s.stage);

          // Add next stage button if not final
          if (s.stage < 9) {
            const nextBtn = document.createElement('button');
            nextBtn.className = 'btn btn-primary btn-block';
            nextBtn.style.marginTop = '12px';
            nextBtn.textContent = `➔ TIẾN LÊN ẢI ${s.stage + 1}`;
            nextBtn.addEventListener('click', () => {
              this.loadStage(s.stage + 1);
            });
            fb.appendChild(nextBtn);
          } else if (onAwardCallback) {
            onAwardCallback();
          }

          if (window.renderMathInElement) {
            window.renderMathInElement(fb);
          }
        } else {
          fb.className = 'quiz-feedback error';
          fb.innerHTML = `<strong>✗ Chưa đúng:</strong> ${s.hint || 'Hãy đọc lại hướng dẫn và thử lại nhé!'}`;
          this.audio.playBeep(250, 0.12);
        }
      });
    });
  }
}
