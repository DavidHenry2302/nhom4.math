/**
 * Renderer.js
 * High-performance 2D Canvas Renderer for Flight Math Lab.
 * Renders Radar Grid, Mathematical Function Curve, Asymptotes, Holes, Jet Particles, and HUD Aircraft.
 */

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // Viewport transform
    this.view = {
      originX: this.width * 0.4, // screen pixels of (0, 0)
      originY: this.height * 0.55,
      scaleX: 35, // pixels per math unit
      scaleY: 35,
      minScale: 10,
      maxScale: 150
    };

    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };
    this.autoFollow = true;

    this.setupInteractions();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    if (this.autoFollow) {
      this.view.originX = this.width * 0.35;
      this.view.originY = this.height * 0.55;
    }
  }

  setupInteractions() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouse = { x: e.clientX, y: e.clientY };
      this.autoFollow = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouse.x;
      const dy = e.clientY - this.lastMouse.y;
      this.view.originX += dx;
      this.view.originY += dy;
      this.lastMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const newScaleX = Math.max(this.view.minScale, Math.min(this.view.maxScale, this.view.scaleX * zoomFactor));
      const newScaleY = Math.max(this.view.minScale, Math.min(this.view.maxScale, this.view.scaleY * zoomFactor));

      // Zoom toward mouse pointer
      const rect = this.canvas.getBoundingClientRect();
      const mouseCanvasX = e.clientX - rect.left;
      const mouseCanvasY = e.clientY - rect.top;

      this.view.originX = mouseCanvasX - (mouseCanvasX - this.view.originX) * (newScaleX / this.view.scaleX);
      this.view.originY = mouseCanvasY - (mouseCanvasY - this.view.originY) * (newScaleY / this.view.scaleY);

      this.view.scaleX = newScaleX;
      this.view.scaleY = newScaleY;
    }, { passive: false });
  }

  toScreen(mathX, mathY) {
    return {
      x: this.view.originX + mathX * this.view.scaleX,
      y: this.view.originY - mathY * this.view.scaleY
    };
  }

  toMath(screenX, screenY) {
    return {
      x: (screenX - this.view.originX) / this.view.scaleX,
      y: (this.view.originY - screenY) / this.view.scaleY
    };
  }

  render(rf, aircraft, options = {}) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Smooth auto-follow aircraft if active
    if (this.autoFollow && aircraft) {
      const planeScreen = this.toScreen(aircraft.x, aircraft.y);
      const targetScreenX = this.width * 0.4;
      const targetScreenY = this.height * 0.55;
      this.view.originX += (targetScreenX - planeScreen.x) * 0.05;
      this.view.originY += (targetScreenY - planeScreen.y) * 0.05;
    }

    // 1. Draw Radar Military Coordinate Grid
    this.drawGrid();

    // 2. Draw Asymptotes & Critical Barriers
    this.drawAsymptotes(rf);

    // 3. Draw Function Curve
    this.drawCurve(rf);

    // 4. Draw Removable Discontinuity (Hole) if present
    this.drawHole(rf);

    // 5. Draw Aircraft Trail & Particles
    if (aircraft) {
      this.drawTrail(aircraft);
      this.drawParticles(aircraft);
      this.drawAircraft(aircraft, rf);
    }
  }

  drawGrid() {
    const ctx = this.ctx;
    const { originX, originY, scaleX, scaleY } = this.view;

    // Grid background
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, this.width, this.height);

    // Minor Grid Lines
    const stepX = scaleX > 60 ? 1 : scaleX > 25 ? 2 : 5;
    const stepY = scaleY > 60 ? 1 : scaleY > 25 ? 2 : 5;

    const minX = Math.floor(-originX / scaleX / stepX) * stepX;
    const maxX = Math.ceil((this.width - originX) / scaleX / stepX) * stepX;
    const minY = Math.floor(-(this.height - originY) / scaleY / stepY) * stepY;
    const maxY = Math.ceil(originY / scaleY / stepY) * stepY;

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';

    // Vertical grid
    for (let x = minX; x <= maxX; x += stepX) {
      const sx = originX + x * scaleX;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, this.height);
      ctx.stroke();

      if (x !== 0) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.font = '10px Consolas, monospace';
        ctx.fillText(`${x}`, sx + 3, originY + 14);
      }
    }

    // Horizontal grid
    for (let y = minY; y <= maxY; y += stepY) {
      const sy = originY - y * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(this.width, sy);
      ctx.stroke();

      if (y !== 0) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.font = '10px Consolas, monospace';
        ctx.fillText(`${y}`, originX + 5, sy - 3);
      }
    }

    // Main Axes
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';

    // X Axis (Horizon)
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(this.width, originY);
    ctx.stroke();

    // Y Axis (Altitude Axis)
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, this.height);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px Consolas, monospace';
    ctx.fillText('x (Vị trí)', this.width - 65, originY - 8);
    ctx.fillText('f(x) (Cao độ)', originX + 10, 20);
  }

  drawAsymptotes(rf) {
    if (!rf || !rf.isDefined) return;
    const ctx = this.ctx;

    // 1. Vertical Asymptote (Red Hazard Line)
    if (rf.hasVerticalAsymptote && rf.verticalAsymptoteX !== null) {
      const sx = this.toScreen(rf.verticalAsymptoteX, 0).x;

      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);

      // Glow effect
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, this.height);
      ctx.stroke();

      // Label
      ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px Consolas, monospace';
      ctx.fillText(`TC ĐỨNG: x = ${rf.verticalAsymptoteX.toFixed(2)} [VÙNG CẤM]`, sx + 8, 40);
      ctx.restore();
    }

    // 2. Horizontal Asymptote (Cyan/Emerald Beacon)
    if (rf.hasHorizontalAsymptote && rf.horizontalAsymptoteY !== null) {
      const sy = this.toScreen(0, rf.horizontalAsymptoteY).y;

      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);

      // Glow effect
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(this.width, sy);
      ctx.stroke();

      // Label
      ctx.setLineDash([]);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 11px Consolas, monospace';
      ctx.fillText(`TC NGANG: y = ${rf.horizontalAsymptoteY.toFixed(2)} [TRẦN BAY ỔN ĐỊNH]`, 30, sy - 8);
      ctx.restore();
    }
  }

  drawCurve(rf) {
    if (!rf || !rf.isDefined) return;
    const ctx = this.ctx;

    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
    ctx.shadowBlur = 6;

    const mathLeft = this.toMath(0, 0).x;
    const mathRight = this.toMath(this.width, 0).x;
    const stepPx = 2; // sample every 2 pixels

    let isDrawing = false;
    let prevScreenY = null;
    ctx.beginPath();

    for (let px = 0; px <= this.width; px += stepPx) {
      const mathX = this.toMath(px, 0).x;

      // Skip near vertical asymptote or hole to avoid vertical connecting artifacts
      if (rf.hasVerticalAsymptote && Math.abs(mathX - rf.verticalAsymptoteX) < 0.04) {
        isDrawing = false;
        continue;
      }
      if (rf.isHole && Math.abs(mathX - rf.holeX) < 0.04) {
        isDrawing = false;
        continue;
      }

      const mathY = rf.evaluate(mathX);
      if (mathY === null || !Number.isFinite(mathY)) {
        isDrawing = false;
        continue;
      }

      const screenPos = this.toScreen(mathX, mathY);

      // Break path if vertical delta is wildly huge (crossing singularity)
      if (prevScreenY !== null && Math.abs(screenPos.y - prevScreenY) > this.height * 0.7) {
        isDrawing = false;
      }

      if (!isDrawing) {
        ctx.moveTo(screenPos.x, screenPos.y);
        isDrawing = true;
      } else {
        ctx.lineTo(screenPos.x, screenPos.y);
      }
      prevScreenY = screenPos.y;
    }

    ctx.stroke();
    ctx.restore();
  }

  drawHole(rf) {
    if (!rf || !rf.isHole) return;
    const ctx = this.ctx;
    const screenPos = this.toScreen(rf.holeX, rf.holeY);

    ctx.save();
    ctx.fillStyle = '#0a0f1d';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;

    // Outer circle
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cross inside
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px Consolas, monospace';
    ctx.fillText(`ĐIỂM THỦNG (${rf.holeX.toFixed(1)}, ${rf.holeY.toFixed(1)})`, screenPos.x + 12, screenPos.y - 6);
    ctx.restore();
  }

  drawTrail(aircraft) {
    if (!aircraft || aircraft.trail.length < 2) return;
    const ctx = this.ctx;

    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    let started = false;
    for (let i = 0; i < aircraft.trail.length; i++) {
      const pt = aircraft.trail[i];
      const s = this.toScreen(pt.x, pt.y);
      if (!started) {
        ctx.moveTo(s.x, s.y);
        started = true;
      } else {
        ctx.lineTo(s.x, s.y);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  drawParticles(aircraft) {
    if (!aircraft) return;
    const ctx = this.ctx;
    ctx.save();
    for (const p of aircraft.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawAircraft(aircraft, rf) {
    const ctx = this.ctx;
    const pos = this.toScreen(aircraft.x, aircraft.y);

    // Spawn engine particle at plane's tail
    aircraft.spawnExhaustParticle({ x: aircraft.x, y: aircraft.y }, { cx: pos.x, cy: pos.y });

    ctx.save();
    ctx.translate(pos.x, pos.y);
    // Rotate canvas by aircraft pitch (note: screen Y is inverted relative to math Y)
    ctx.rotate(-aircraft.pitch);

    // Draw Vector Jet
    ctx.fillStyle = aircraft.state === 'EMERGENCY_HALT' ? '#ef4444' : '#f8fafc';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    // Nose
    ctx.moveTo(18, 0);
    // Upper body & Cockpit
    ctx.lineTo(4, -4);
    ctx.lineTo(-4, -14); // Top Wing tip
    ctx.lineTo(-6, -4);
    ctx.lineTo(-14, -7); // Tail top
    ctx.lineTo(-12, 0);  // Engine nozzle
    // Lower body
    ctx.lineTo(-14, 7);  // Tail bottom
    ctx.lineTo(-6, 4);
    ctx.lineTo(-4, 14);  // Bottom wing tip
    ctx.lineTo(4, 4);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    // Cockpit canopy glow
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(4, 0, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Floating Target HUD badge
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = aircraft.state === 'EMERGENCY_HALT' ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 1;

    const badgeX = pos.x + 22;
    const badgeY = pos.y - 32;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, 140, 24, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '10px Consolas, monospace';
    const yStr = aircraft.y !== null && Number.isFinite(aircraft.y) ? aircraft.y.toFixed(2) : 'N/A';
    ctx.fillText(`x: ${aircraft.x.toFixed(2)} | y: ${yStr}`, badgeX + 8, badgeY + 16);
    ctx.restore();
  }
}
