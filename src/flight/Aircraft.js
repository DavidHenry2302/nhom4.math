/**
 * Aircraft.js
 * Represents the research aircraft in math coordinate space.
 * 
 * DISCLAIMER:
 * Mô hình máy bay trong Flight Math Lab là mô phỏng trực quan phục vụ học Toán,
 * không nhằm mô phỏng chính xác khí động học hoặc hệ thống điều khiển máy bay thực tế.
 * 
 * Visual Mapping:
 * slope = f'(x) => pitch = Math.atan(slope) * PITCH_SCALE
 */

export class Aircraft {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.pitch = 0; // in radians
    this.targetPitch = 0;
    this.speed = 1.0; // flight delta x per step
    this.state = 'GROUND'; // 'GROUND', 'CRUISING', 'APPROACHING_LIMIT', 'CRITICAL_ZONE', 'EMERGENCY_HALT'
    this.particles = [];
    this.trail = [];
    this.maxTrailLength = 120;
    this.pitchScale = 0.65;
  }

  reset(startX = 0, startY = 0) {
    this.x = startX;
    this.y = startY;
    this.pitch = 0;
    this.targetPitch = 0;
    this.state = 'GROUND';
    this.particles = [];
    this.trail = [];
  }

  update(currentX, currentY, rationalFunction) {
    this.x = currentX;
    this.y = currentY !== null ? currentY : this.y;

    // Visual pitch mapping from derivative
    if (rationalFunction && rationalFunction.isDefined) {
      this.targetPitch = rationalFunction.getVisualPitch(this.x, this.pitchScale);
      // Smooth pitch interpolation (slerp-like)
      this.pitch += (this.targetPitch - this.pitch) * 0.25;
    }

    // Add point to trail if valid
    if (currentY !== null && Number.isFinite(currentY)) {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.maxTrailLength) {
        this.trail.shift();
      }
    }

    // Update jet exhaust particles
    this.updateParticles();
  }

  spawnExhaustParticle(worldPos, canvasCoords) {
    if (this.particles.length > 40) return;
    this.particles.push({
      x: canvasCoords.cx,
      y: canvasCoords.cy,
      vx: -(Math.cos(this.pitch) * (1.5 + Math.random())),
      vy: -(Math.sin(this.pitch) * (1.5 + Math.random())) + (Math.random() - 0.5) * 0.5,
      life: 1.0,
      decay: 0.04 + Math.random() * 0.03,
      size: 3 + Math.random() * 3,
      color: Math.random() > 0.4 ? '#38bdf8' : '#f59e0b'
    });
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.size *= 0.95;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
}
