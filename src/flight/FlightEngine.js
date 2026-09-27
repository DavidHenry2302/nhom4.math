/**
 * FlightEngine.js
 * Controls aircraft state machine, simulation stepping, safety detection, and telemetry feeds.
 */

import { Aircraft } from './Aircraft.js';
import { FlightRecorder } from './FlightRecorder.js';
import { AsymptoteEngine } from '../math/AsymptoteEngine.js';

export class FlightEngine {
  constructor(rationalFunction) {
    this.rf = rationalFunction;
    this.aircraft = new Aircraft();
    this.recorder = new FlightRecorder();
    this.mode = 'IDLE'; // 'IDLE', 'CRUISING', 'REVERSE', 'CRITICAL_HALT', 'PAUSED'
    this.speed = 1.2; // base coordinate units per second
    this.direction = 1; // 1: forward (x -> +inf), -1: reverse (x -> -inf)
    this.lastTimestamp = null;
    this.onStateChange = null;
    this.onTelemetry = null;
    this.onEmergencyStop = null;
  }

  setFunction(rationalFunction) {
    this.rf = rationalFunction;
  }

  setSpeed(speedMultiplier) {
    this.speed = Math.max(0.2, Math.min(10.0, speedMultiplier));
  }

  startFlight(startX = 0, direction = 1) {
    this.direction = direction;
    this.mode = direction >= 0 ? 'CRUISING' : 'REVERSE';
    const startY = this.rf.evaluate(startX);
    this.aircraft.reset(startX, startY !== null ? startY : 0);
    this.recorder.clear();
    this.recorder.start();
    this.lastTimestamp = performance.now();

    if (this.onStateChange) this.onStateChange(this.mode);
  }

  pause() {
    if (this.mode === 'CRUISING' || this.mode === 'REVERSE') {
      this.mode = 'PAUSED';
      if (this.onStateChange) this.onStateChange(this.mode);
    }
  }

  resume() {
    if (this.mode === 'PAUSED') {
      this.mode = this.direction >= 0 ? 'CRUISING' : 'REVERSE';
      this.lastTimestamp = performance.now();
      if (this.onStateChange) this.onStateChange(this.mode);
    }
  }

  stop() {
    this.mode = 'IDLE';
    this.recorder.stop();
    if (this.onStateChange) this.onStateChange(this.mode);
  }

  /**
   * Directly test a specific x coordinate (for Missions testing x = 10, 50, 100, 1000)
   */
  jumpTo(targetX) {
    const y = this.rf.evaluate(targetX);
    const distToVA = this.rf.distanceToVerticalAsymptote(targetX);
    const slope = this.rf.derivative(targetX);
    const prox = AsymptoteEngine.evaluateFlightProximity(this.rf, targetX);

    this.aircraft.x = targetX;
    this.aircraft.y = y !== null ? y : 0;
    this.aircraft.update(targetX, y, this.rf);

    const logEntry = this.recorder.log(targetX, y, distToVA, slope, prox.status);
    if (this.onTelemetry) this.onTelemetry(logEntry);

    if (prox.status === 'STALL') {
      this.mode = 'CRITICAL_HALT';
      if (this.onEmergencyStop) this.onEmergencyStop(prox);
      if (this.onStateChange) this.onStateChange(this.mode);
    }
  }

  /**
   * Main simulation frame tick
   */
  update(timestamp) {
    if (this.mode !== 'CRUISING' && this.mode !== 'REVERSE') {
      return;
    }

    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }

    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1); // clamp dt
    this.lastTimestamp = timestamp;

    const nextX = this.aircraft.x + this.direction * this.speed * dt;
    
    // Check flight safety proximity
    const prox = AsymptoteEngine.evaluateFlightProximity(this.rf, nextX);

    if (prox.status === 'STALL') {
      this.mode = 'CRITICAL_HALT';
      this.aircraft.state = 'EMERGENCY_HALT';
      const lastSafeY = this.rf.evaluate(this.aircraft.x);
      this.aircraft.update(this.aircraft.x, lastSafeY, this.rf);
      
      const logEntry = this.recorder.log(this.aircraft.x, lastSafeY, prox.distance, this.rf.derivative(this.aircraft.x), 'STALL');
      if (this.onTelemetry) this.onTelemetry(logEntry);
      if (this.onEmergencyStop) this.onEmergencyStop(prox);
      if (this.onStateChange) this.onStateChange(this.mode);
      return;
    }

    const currentY = this.rf.evaluate(nextX);
    const distToVA = this.rf.distanceToVerticalAsymptote(nextX);
    const slope = this.rf.derivative(nextX);

    this.aircraft.update(nextX, currentY, this.rf);
    this.aircraft.state = prox.status;

    const logEntry = this.recorder.log(nextX, currentY, distToVA, slope, prox.status);
    if (this.onTelemetry) this.onTelemetry(logEntry);
  }
}
