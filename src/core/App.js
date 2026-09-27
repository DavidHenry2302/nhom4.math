/**
 * App.js
 * Master Application Controller for Flight Math Lab (9-Stage Training Journey).
 */

import { RationalFunction } from '../math/RationalFunction.js';
import { FlightEngine } from '../flight/FlightEngine.js';
import { Renderer } from '../simulation/Renderer.js';
import { AudioEngine } from '../simulation/AudioEngine.js';
import { JourneyProgress } from '../learning/JourneyProgress.js';
import { StageManager } from '../ui/StageManager.js';

export class App {
  constructor() {
    this.progress = new JourneyProgress();
    this.audio = new AudioEngine();
    this.rf = new RationalFunction(2, 1, 1, 3);
    this.flightEngine = new FlightEngine(this.rf);

    // Dummy canvas initially; StageManager attaches active canvas as needed
    this.renderer = new Renderer(document.createElement('canvas'));

    this.initApp();
  }

  initApp() {
    const stageContainer = document.getElementById('stage-container');
    this.stageManager = new StageManager(
      stageContainer,
      this.flightEngine,
      this.renderer,
      this.audio,
      this.progress,
      (stageNum) => this.handleStageComplete(stageNum)
    );

    this.setupTopHeader();

    // Load saved or initial stage
    const currentStage = this.progress.data.currentStage || 1;
    this.stageManager.loadStage(currentStage);

    this.bindGlobalAudioEvents();
    this.startSimulationLoop();
  }

  setupTopHeader() {
    // Rank & XP display
    this.updateRankDisplay();

    // Audio toggle
    const btnAudio = document.getElementById('btn-toggle-audio');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        this.audio.init();
        const isMuted = this.audio.toggleMute();
        btnAudio.textContent = isMuted ? '🔇 ÂM: TẮT' : '🔊 ÂM: BẬT';
      });
    }

    // Reset journey
    const btnReset = document.getElementById('btn-reset-journey');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Bạn có muốn xóa tiến độ và bắt đầu lại từ Ải 1 không?')) {
          this.progress.resetAll();
          location.reload();
        }
      });
    }
  }

  updateRankDisplay() {
    const rank = this.progress.getRank();
    const rankEl = document.getElementById('header-rank-badge');
    const xpEl = document.getElementById('header-xp-badge');
    const pctEl = document.getElementById('header-progress-pct');

    if (rankEl) {
      rankEl.innerHTML = `${rank.badge} ${rank.name}`;
      rankEl.className = `rank-pill rank-${rank.code.toLowerCase()}`;
    }
    if (xpEl) {
      xpEl.textContent = `${this.progress.data.xp} XP`;
    }
    if (pctEl) {
      pctEl.textContent = `Tiến độ: ${this.progress.getProgressPercentage()}%`;
    }
  }

  handleStageComplete(stageNum) {
    this.updateRankDisplay();
  }

  bindGlobalAudioEvents() {
    const resumeAudio = () => {
      this.audio.init();
      this.audio.resume();
    };
    window.addEventListener('click', resumeAudio, { once: true });
    window.addEventListener('keydown', resumeAudio, { once: true });
  }

  startSimulationLoop() {
    const loop = (timestamp) => {
      this.flightEngine.update(timestamp);
      if (this.renderer.canvas && this.renderer.canvas.parentElement) {
        this.renderer.render(this.flightEngine.rf, this.flightEngine.aircraft);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
