/**
 * AudioEngine.js
 * Procedural Web Audio synthesizer for aeronautical sound effects:
 * - Jet engine white-noise rumble with filter
 * - Stall warning pull-up siren
 * - Telemetry beep
 * - Mission success achievement chime
 * 100% client-side, zero external asset dependencies.
 */

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.jetGain = null;
    this.jetFilter = null;
    this.jetSource = null;
    this.isJetRunning = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn('Web Audio API not supported in this browser.', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.jetGain) {
      this.jetGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  startJetSound() {
    if (this.isMuted || !this.ctx || this.isJetRunning) return;
    this.resume();

    try {
      // Procedural White Noise buffer for jet turbine
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Lowpass filter to simulate deep jet exhaust roar
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();

      this.jetSource = whiteNoise;
      this.jetFilter = filter;
      this.jetGain = gain;
      this.isJetRunning = true;
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  updateJetPitch(speedMultiplier) {
    if (!this.jetFilter || !this.ctx) return;
    const targetFreq = 180 + Math.min(800, speedMultiplier * 100);
    this.jetFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
  }

  stopJetSound() {
    if (!this.isJetRunning) return;
    try {
      if (this.jetSource) {
        this.jetSource.stop();
        this.jetSource.disconnect();
      }
      this.isJetRunning = false;
    } catch (e) {}
  }

  playStallAlarm() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Alarm frequency alternating
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.12);
      osc.frequency.setValueAtTime(880, now + 0.24);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    } catch (e) {}
  }

  playBeep(freq = 600, duration = 0.08) {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playSuccessChime() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const startTime = this.ctx.currentTime + idx * 0.1;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    } catch (e) {}
  }
}
