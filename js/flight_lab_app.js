/**
 * flight_lab_app.js — PHÒNG THÍ NGHIỆM TIỆM Cc</h4>YMPTOTE MATH LAB)
 * Phiên bản Tối thiểu Tinh gọn (MVP) — Tập trung chuẩn xác Nhiệm vụ N4
 * Triết lý: "Đừng xem công thức trước. Hãy dự đoán, thử thay đổi và tự giải thích kết quả."
 * 
 * 100% Client-side HTML5 / Canvas / KaTeX — Chạy trực tiếp trên trình duyệt
 */

(() => {
  'use strict';

  // =========================================================================
  // TIỆN ÍCH TOÁN HỌC & GIẢI MÃ BIỂU THỨC SỐ HỌC
  // Hỗ trợ số nguyên, số thực, dấu âm (-), phân số (a/b), dấu căn (√x), vô cực
  // Không dùng eval() đảm bảo an toàn tuyệt đối 100%
  // =========================================================================
  function parseMathExpression(raw) {
    if (raw === undefined || raw === null) return NaN;
    if (typeof raw === 'number') return raw;
    let s = raw.toString().trim().toLowerCase().replace(/\s+/g, '');
    if (!s) return NaN;

    // Vô cực
    if (s === '+inf' || s === 'inf' || s === '+∞' || s === '∞' || s === '+\\infty' || s === 'vocuc' || s === 'duongvocuc') return Infinity;
    if (s === '-inf' || s === '-∞' || s === '-\\infty' || s === '-vocuc' || s === 'amvocuc') return -Infinity;

    // Chuẩn hóa dấu âm unicode và dấu chia
    s = s.replace(/[\u2212\u2013\u2014]/g, '-').replace(/[\u00F7:]/g, '/');

    // Hàm phụ giải mã đơn thức: số, căn bậc hai, hoặc số thập phân
    function parseToken(tok) {
      tok = tok.trim();
      if (!tok) return NaN;
      let sign = 1;
      if (tok.startsWith('-')) {
        sign = -1;
        tok = tok.slice(1);
      } else if (tok.startsWith('+')) {
        tok = tok.slice(1);
      }
      if (tok.startsWith('√')) {
        const inner = parseFloat(tok.slice(1));
        if (isNaN(inner) || inner < 0) return NaN;
        return sign * Math.sqrt(inner);
      }
      if (tok.startsWith('sqrt(') && tok.endsWith(')')) {
        const inner = parseFloat(tok.slice(5, -1));
        if (isNaN(inner) || inner < 0) return NaN;
        return sign * Math.sqrt(inner);
      }
      const val = parseFloat(tok);
      return isNaN(val) ? NaN : sign * val;
    }

    // Biểu thức dạng phân số a / b
    if (s.includes('/')) {
      const parts = s.split('/');
      if (parts.length === 2) {
        const num = parseToken(parts[0]);
        const den = parseToken(parts[1]);
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
          return num / den;
        }
      }
      return NaN;
    }

    return parseToken(s);
  }

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // =========================================================================
  // 1. MÔ HÌNH TOÁN HỌC: HÀM PHÂN THỨC BẬC NHẤT TRÊN BẬC NHẤT
  // f(x) = (ax + b) / (cx + d)
  // =========================================================================
  class RationalFunction {
    constructor(a = 2, b = 1, c = 1, d = 3) {
      this.a = Number(a);
      this.b = Number(b);
      this.c = Number(c);
      this.d = Number(d);
    }

    // Tính f(x)
    evaluate(x) {
      const den = this.c * x + this.d;
      if (Math.abs(den) < 1e-9) return null; // Gián đoạn
      return (this.a * x + this.b) / den;
    }

    // Đạo hàm f'(x) = (ad - bc) / (cx + d)^2
    derivative(x) {
      const den = this.c * x + this.d;
      if (Math.abs(den) < 1e-9) return null;
      return this.determinant / (den * den);
    }

    // Định thức ad - bc
    get determinant() {
      return this.a * this.d - this.b * this.c;
    }

    // Tiệm cận đứng: x = -d / c (chỉ có khi c != 0 và ad - bc != 0)
    get vaX() {
      if (Math.abs(this.c) < 1e-9) return null;
      if (Math.abs(this.determinant) < 1e-7) return null; // Điểm thủng khử được, không phải TCĐ
      return -this.d / this.c;
    }

    // Tiệm cận ngang: y = a / c (chỉ có khi c != 0 và ad - bc != 0)
    get haY() {
      // Với c != 0, giới hạn ở vô cực vẫn là a/c, kể cả hàm có điểm thủng.
      if (Math.abs(this.c) >= 1e-9) return this.a / this.c;
      // Khi c = 0, chỉ hàm hằng (a = 0, d != 0) có giới hạn hữu hạn ở vô cực.
      if (Math.abs(this.d) >= 1e-9 && Math.abs(this.a) < 1e-9) return this.b / this.d;
      return null;
    }

    get isUndefined() {
      return Math.abs(this.c) < 1e-9 && Math.abs(this.d) < 1e-9;
    }

    // Hoành độ điểm thủng khi ad - bc = 0 và c != 0
    get holeX() {
      if (Math.abs(this.c) < 1e-9) return null;
      if (Math.abs(this.determinant) >= 1e-7) return null;
      return -this.d / this.c;
    }

    get holeY() {
      if (Math.abs(this.c) < 1e-9) return null;
      if (Math.abs(this.determinant) >= 1e-7) return null;
      return this.a / this.c;
    }

    // Kiểm tra trường hợp suy biến
    get isDegenerateLinear() {
      return Math.abs(this.c) < 1e-9 && !this.isUndefined;
    }

    get isDegenerateConstant() {
      return this.isDegenerateLinear && Math.abs(this.a) < 1e-9;
    }

    get isDegenerateObliqueLine() {
      return this.isDegenerateLinear && Math.abs(this.a) >= 1e-9;
    }

    get isDegenerateHole() {
      return Math.abs(this.c) >= 1e-9 && Math.abs(this.determinant) < 1e-7;
    }

    get isStandard() {
      return Math.abs(this.c) >= 1e-9 && Math.abs(this.determinant) >= 1e-7;
    }

    // Chuỗi LaTeX hiển thị công thức hàm
    toLatex() {
      const formatPoly = (coef, constVal) => {
        let res = '';
        if (coef === 1) res += 'x';
        else if (coef === -1) res += '-x';
        else if (coef !== 0) res += `${coef}x`;

        if (constVal > 0) {
          res += (res.length > 0 ? ' + ' : '') + `${constVal}`;
        } else if (constVal < 0) {
          res += (res.length > 0 ? ' - ' : '-') + `${Math.abs(constVal)}`;
        } else if (res.length === 0) {
          res = '0';
        }
        return res;
      };

      const numStr = formatPoly(this.a, this.b);
      const denStr = formatPoly(this.c, this.d);

      if (this.isUndefined) {
        return `f(x) = \\dfrac{${numStr}}{0} \\quad (D = \\emptyset)`;
      }

      if (this.isDegenerateLinear) {
        if (Math.abs(this.a) < 1e-9) {
          const val = this.b / this.d;
          return `f(x) = \\dfrac{${this.b}}{${this.d}} = ${Number.isInteger(val) ? val : val.toFixed(2)}`;
        }
        return `f(x) = \\dfrac{${numStr}}{${this.d}}`;
      }
      return `f(x) = \\dfrac{${numStr}}{${denStr}}`;
    }
  }

  // =========================================================================
  // 2. BỘ VẼ ĐỒ THỊ CHUẨN XÁC & ĐIỂM M BÁM ĐƯỜNG CONG
  // =========================================================================
  class InteractiveGraphEngine {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      
      this.rf = new RationalFunction(2, 1, 1, 3);
      this.pointX = 2.0; // Hoành độ của điểm M

      this.showTCD = true;
      this.showTCN = true;
      this.showCenterI = true;
      this.hideFormulasOnGraph = false; // Khi ở Bước 1, không hiện công thức tổng quát
      this.isLocked = false;             // Khóa màn hình khi ở bài kiểm tra cuối

      // Hệ tọa độ chuẩn định vị sẵn
      this.scale = 34; // pixels per unit
      this.panX = 0;
      this.panY = 0;

      // Trạng thái tương tác kéo/di chuyển (Pan & Drag)
      this.isDragging = false;
      this.isDraggingPoint = false;
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.panStartX = 0;
      this.panStartY = 0;
      this.hasMoved = false;

      this.onPointMoved = null;
      this.onViewChanged = null;

      this.initEvents();
      this.resize();
    }

    setFunction(rf) {
      this.rf = rf;
      this.render();
    }

    // Đặt hoành độ x cho điểm M (M luôn nằm trên đồ thị y = f(x))
    setPointX(x) {
      this.pointX = Number(x);
      this.render();
    }

    resetView() {
      this.centerAtOrigin();
    }

    centerAtOrigin() {
      this.scale = 34;
      this.panX = 0;
      this.panY = 0;
      this.render();
      if (this.onViewChanged) this.onViewChanged();
    }

    centerAtPointM() {
      if (this.pointX === null) return;
      const py = this.rf.evaluate(this.pointX);
      if (py !== null && isFinite(py)) {
        this.panX = -this.pointX * this.scale;
        this.panY = py * this.scale;
        this.render();
        if (this.onViewChanged) this.onViewChanged();
      }
    }

    zoomAt(factor, sx, sy) {
      const oldScale = this.scale;
      const newScale = Math.min(300, Math.max(6, oldScale * factor));
      if (Math.abs(newScale - oldScale) < 1e-4) return;
      const mouseWorld = this.screenToWorld(sx, sy);
      this.scale = newScale;
      this.panX = sx - this.width / 2 - mouseWorld.x * this.scale;
      this.panY = -(sy - this.height / 2 + mouseWorld.y * this.scale);
      this.render();
      if (this.onViewChanged) this.onViewChanged();
    }

    zoomIn() {
      this.zoomAt(1.25, this.width / 2, this.height / 2);
    }

    zoomOut() {
      this.zoomAt(0.8, this.width / 2, this.height / 2);
    }

    resize() {
      const rect = this.canvas.parentElement 
        ? this.canvas.parentElement.getBoundingClientRect() 
        : { width: this.canvas.width || 800, height: this.canvas.height || 600 };
      const dpr = window.devicePixelRatio || 1;
      this.width = rect.width || 800;
      this.height = rect.height || 600;
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
      this.render();
    }

    worldToScreen(wx, wy) {
      const cx = this.width / 2 + this.panX;
      const cy = this.height / 2 + this.panY;
      return {
        x: cx + wx * this.scale,
        y: cy - wy * this.scale
      };
    }

    screenToWorld(sx, sy) {
      const cx = this.width / 2 + this.panX;
      const cy = this.height / 2 + this.panY;
      return {
        x: (sx - cx) / this.scale,
        y: (cy - sy) / this.scale
      };
    }

    initEvents() {
      window.addEventListener('resize', () => this.resize());

      const getEventPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        return {
          sx: clientX - rect.left,
          sy: clientY - rect.top
        };
      };

      const isNearPointM = (sx, sy, isTouch = false) => {
        if (this.pointX === null) return false;
        const py = this.rf.evaluate(this.pointX);
        if (py === null || !isFinite(py)) return false;
        const pt = this.worldToScreen(this.pointX, py);
        const radius = isTouch ? 36 : 20;
        return Math.hypot(sx - pt.x, sy - pt.y) <= radius;
      };

      // 1. MOUSE DOWN (Chuột trái kéo đồ thị hoặc điểm M)
      this.canvas.addEventListener('mousedown', (e) => {
        if (this.isLocked || e.button !== 0) return; // Chỉ chuột trái
        const { sx, sy } = getEventPos(e);
        this.dragStartX = sx;
        this.dragStartY = sy;
        this.panStartX = this.panX;
        this.panStartY = this.panY;
        this.hasMoved = false;

        if (isNearPointM(sx, sy)) {
          this.isDraggingPoint = true;
          this.canvas.style.cursor = 'grabbing';
        } else {
          this.isDragging = true;
          this.canvas.style.cursor = 'grabbing';
        }
      });

      // 2. MOUSE MOVE (Kéo di chuyển đồ thị hoặc kéo điểm M bám đường cong)
      window.addEventListener('mousemove', (e) => {
        if (this.isLocked) return;
        const { sx, sy } = getEventPos(e);

        if (this.isDraggingPoint) {
          const wx = this.screenToWorld(sx, sy).x;
          this.pointX = Math.round(wx * 20) / 20;
          if (this.onPointMoved) this.onPointMoved(this.pointX);
          this.render();
        } else if (this.isDragging) {
          const dx = sx - this.dragStartX;
          const dy = sy - this.dragStartY;
          if (Math.hypot(dx, dy) > 3) this.hasMoved = true;
          this.panX = this.panStartX + dx;
          this.panY = this.panStartY + dy;
          this.render();
          if (this.onViewChanged) this.onViewChanged();
        } else {
          const rect = this.canvas.getBoundingClientRect();
          if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
            this.canvas.style.cursor = isNearPointM(sx, sy) ? 'pointer' : 'grab';
          }
        }
      });

      // 3. MOUSE UP
      window.addEventListener('mouseup', (e) => {
        if (this.isDragging || this.isDraggingPoint) {
          if (!this.hasMoved && !this.isDraggingPoint) {
            // Nhấp nhẹ không kéo: chuyển điểm M đến vị trí x vừa click
            const { sx, sy } = getEventPos(e);
            const rect = this.canvas.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
              const wx = this.screenToWorld(sx, sy).x;
              this.pointX = Math.round(wx * 20) / 20;
              if (this.onPointMoved) this.onPointMoved(this.pointX);
              this.render();
            }
          }
          this.isDragging = false;
          this.isDraggingPoint = false;
          this.canvas.style.cursor = 'grab';
        }
      });

      // 4. MOUSE WHEEL (Phóng to / thu nhỏ mượt mà tại con trỏ)
      this.canvas.addEventListener('wheel', (e) => {
        if (this.isLocked) return;
        e.preventDefault();
        const { sx, sy } = getEventPos(e);
        const factor = e.deltaY < 0 ? 1.15 : 0.87;
        this.zoomAt(factor, sx, sy);
      }, { passive: false });

      // 5. TOUCH EVENTS (Cho thiết bị cảm ứng: 1 ngón kéo, 2 ngón zoom)
      let touchStartDist = 0;
      let touchStartScale = this.scale;

      this.canvas.addEventListener('touchstart', (e) => {
        if (this.isLocked) return;
        if (e.touches.length === 1) {
          const { sx, sy } = getEventPos(e);
          this.dragStartX = sx;
          this.dragStartY = sy;
          this.panStartX = this.panX;
          this.panStartY = this.panY;
          this.hasMoved = false;
          this.isDraggingPoint = isNearPointM(sx, sy, true);
          this.isDragging = !this.isDraggingPoint;
        } else if (e.touches.length === 2) {
          this.isDragging = false;
          this.isDraggingPoint = false;
          touchStartDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          touchStartScale = this.scale;
        }
      }, { passive: false });

      this.canvas.addEventListener('touchmove', (e) => {
        if (this.isLocked) return;
        if (e.touches.length === 1) {
          e.preventDefault();
          const { sx, sy } = getEventPos(e);
          if (this.isDraggingPoint) {
            const wx = this.screenToWorld(sx, sy).x;
            this.pointX = Math.round(wx * 20) / 20;
            if (this.onPointMoved) this.onPointMoved(this.pointX);
            this.render();
          } else if (this.isDragging) {
            const dx = sx - this.dragStartX;
            const dy = sy - this.dragStartY;
            if (Math.hypot(dx, dy) > 3) this.hasMoved = true;
            this.panX = this.panStartX + dx;
            this.panY = this.panStartY + dy;
            this.render();
            if (this.onViewChanged) this.onViewChanged();
          }
        } else if (e.touches.length === 2 && touchStartDist > 0) {
          e.preventDefault();
          const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          const ratio = dist / touchStartDist;
          this.scale = Math.min(300, Math.max(6, touchStartScale * ratio));
          this.render();
          if (this.onViewChanged) this.onViewChanged();
        }
      }, { passive: false });

      this.canvas.addEventListener('touchend', (e) => {
        if (!this.hasMoved && !this.isDraggingPoint && e.changedTouches && e.changedTouches[0]) {
          const { sx, sy } = getEventPos(e.changedTouches[0]);
          const rect = this.canvas.getBoundingClientRect();
          if (sx >= 0 && sx <= rect.width && sy >= 0 && sy <= rect.height) {
            const wx = this.screenToWorld(sx, sy).x;
            this.pointX = Math.round(wx * 20) / 20;
            if (this.onPointMoved) this.onPointMoved(this.pointX);
            this.render();
          }
        }
        this.isDragging = false;
        this.isDraggingPoint = false;
        touchStartDist = 0;
      });
    }

    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      ctx.clearRect(0, 0, w, h);

      // Đồ thị bị khóa khi ở bài kiểm tra cuối
      if (this.isLocked) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.03)';
        ctx.fillRect(0, 0, w, h);
        
        ctx.fillStyle = '#64748B';
        ctx.font = '600 15px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔒 ĐỒ THỊ ĐANG ĐƯỢC GIẤU ĐỂ THỬ THÁCH DỰ ĐOÁN', w / 2, h / 2 - 14);
        ctx.font = '400 13px Inter, sans-serif';
        ctx.fillText('Hãy nhập phương trình Tiệm cận đứng và Tiệm cận ngang bên phải', w / 2, h / 2 + 12);
        ctx.fillText('rồi bấm nút "Kiểm tra dự đoán & Mở khóa đồ thị"!', w / 2, h / 2 + 32);
        return;
      }

      // Mẫu số bằng 0 với mọi x: biểu thức không xác định (D = rỗng)
      if (this.rf.isUndefined) {
        const isDark = document.body.classList.contains('night-flight');
        ctx.fillStyle = isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(254, 242, 242, 0.9)';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = isDark ? '#F87171' : '#DC2626';
        ctx.font = '700 15px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ MẪU SỐ BẰNG 0 VỚI MỌI x: BIỂU THỨC KHÔNG XÁC ĐỊNH', w / 2, h / 2 - 16);
        ctx.font = '500 13px Inter, sans-serif';
        ctx.fillStyle = isDark ? '#E2E8F0' : '#475569';
        ctx.fillText('Mẫu số cx + d = 0 với mọi x ∈ ℝ (Tập xác định D = ∅)', w / 2, h / 2 + 10);
        ctx.fillText('Hàm số không tồn tại giá trị nào. Không thể xem như một đường thẳng!', w / 2, h / 2 + 30);
        return;
      }

      const isDark = document.body.classList.contains('night-flight');
      const gridColor = isDark ? 'rgba(71, 85, 105, 0.25)' : 'rgba(148, 163, 184, 0.22)';
      const axisColor = isDark ? '#94A3B8' : '#475569';
      const textColor = isDark ? '#94A3B8' : '#64748B';

      // 1. VẼ LƯỚI TỌA ĐỘ CARTESIAN
      ctx.lineWidth = 1;
      ctx.strokeStyle = gridColor;

      const origin = this.worldToScreen(0, 0);

      const leftW = this.screenToWorld(0, 0).x;
      const rightW = this.screenToWorld(w, 0).x;

      // Tính bước lưới thông minh dựa trên độ phóng to (scale)
      let gridStep = 1;
      if (this.scale < 6) gridStep = 20;
      else if (this.scale < 12) gridStep = 10;
      else if (this.scale < 20) gridStep = 5;
      else if (this.scale < 32) gridStep = 2;
      else if (this.scale > 100) gridStep = 0.5;

      const startX = Math.floor(leftW / gridStep) * gridStep;
      const endX = Math.ceil(rightW / gridStep) * gridStep;

      for (let x = startX; x <= endX; x += gridStep) {
        const sX = this.worldToScreen(x, 0).x;
        ctx.beginPath();
        ctx.moveTo(sX, 0);
        ctx.lineTo(sX, h);
        ctx.stroke();

        if (Math.abs(x) > 1e-6 && Math.abs(sX - origin.x) > 12) {
          ctx.fillStyle = textColor;
          ctx.font = '10px "IBM Plex Mono", monospace';
          ctx.textAlign = 'center';
          const labelX = (Math.round(x * 100) / 100).toString();
          ctx.fillText(labelX, sX, Math.min(Math.max(origin.y + 14, 16), h - 8));
        }
      }

      const topW = this.screenToWorld(0, 0).y;
      const bottomW = this.screenToWorld(0, h).y;
      const startY = Math.floor(bottomW / gridStep) * gridStep;
      const endY = Math.ceil(topW / gridStep) * gridStep;

      for (let y = startY; y <= endY; y += gridStep) {
        const sY = this.worldToScreen(0, y).y;
        ctx.beginPath();
        ctx.moveTo(0, sY);
        ctx.lineTo(w, sY);
        ctx.stroke();

        if (Math.abs(y) > 1e-6 && Math.abs(sY - origin.y) > 12) {
          ctx.fillStyle = textColor;
          ctx.font = '10px "IBM Plex Mono", monospace';
          ctx.textAlign = 'right';
          const labelY = (Math.round(y * 100) / 100).toString();
          ctx.fillText(labelY, Math.min(Math.max(origin.x - 6, 26), w - 6), sY + 3);
        }
      }

      // 2. VẼ 2 TRỤC TỌA ĐỘ Ox VÀ Oy
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = axisColor;

      ctx.beginPath();
      ctx.moveTo(0, origin.y);
      ctx.lineTo(w, origin.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(origin.x, 0);
      ctx.lineTo(origin.x, h);
      ctx.stroke();

      ctx.fillStyle = axisColor;
      ctx.font = 'italic 700 12px "Fraunces", serif';
      ctx.fillText('x', w - 12, origin.y - 6);
      ctx.fillText('y', origin.x + 8, 14);
      ctx.fillText('O', origin.x - 12, origin.y + 14);

      const rf = this.rf;

      // 3. VẼ TIỆM CẬN ĐỨNG — ĐỎ SAN HÔ
      // Chỉ vẽ nếu hàm chuẩn (c != 0 và ad - bc != 0)
      if (this.showTCD && rf.vaX !== null && rf.isStandard) {
        const vaScreen = this.worldToScreen(rf.vaX, 0).x;
        ctx.save();
        ctx.setLineDash([7, 6]);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = isDark ? '#F87171' : '#EF4444';

        ctx.beginPath();
        ctx.moveTo(vaScreen, 0);
        ctx.lineTo(vaScreen, h);
        ctx.stroke();
        ctx.restore();

        // Nhãn tiệm cận đứng
        ctx.fillStyle = isDark ? '#F87171' : '#DC2626';
        ctx.font = '700 12px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        const labelText = this.hideFormulasOnGraph ? 'TCĐ' : `TCĐ: x = ${rf.vaX.toFixed(2)}`;
        ctx.fillText(labelText, vaScreen + 6, 24);
      }

      // 4. VẼ TIỆM CẬN NGANG — XANH NGỌC LỤC BẢO
      // Chỉ vẽ nếu hàm chuẩn (c != 0 và ad - bc != 0)
      if (this.showTCN && rf.haY !== null) {
        const haScreen = this.worldToScreen(0, rf.haY).y;
        ctx.save();
        ctx.setLineDash([7, 6]);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = isDark ? '#34D399' : '#10B981';

        ctx.beginPath();
        ctx.moveTo(0, haScreen);
        ctx.lineTo(w, haScreen);
        ctx.stroke();
        ctx.restore();

        // Nhãn tiệm cận ngang
        ctx.fillStyle = isDark ? '#34D399' : '#059669';
        ctx.font = '700 12px "IBM Plex Mono", monospace';
        ctx.textAlign = 'right';
        const labelText = this.hideFormulasOnGraph ? 'TCN' : `TCN: y = ${rf.haY.toFixed(2)}`;
        ctx.fillText(labelText, w - 10, haScreen - 8);
      }

      // 4b. VẼ TÂM ĐỐI XỨNG I (GIAO ĐIỂM HAI TIỆM CẬN)
      if (this.showCenterI && rf.isStandard && rf.vaX !== null && rf.haY !== null) {
        const ptI = this.worldToScreen(rf.vaX, rf.haY);
        if (ptI.x >= -30 && ptI.x <= w + 30 && ptI.y >= -30 && ptI.y <= h + 30) {
          ctx.save();
          // Hào quang tím
          ctx.fillStyle = isDark ? 'rgba(168, 85, 247, 0.25)' : 'rgba(147, 51, 234, 0.2)';
          ctx.beginPath();
          ctx.arc(ptI.x, ptI.y, 10, 0, Math.PI * 2);
          ctx.fill();

          // Chấm tròn tâm I màu tím
          ctx.fillStyle = isDark ? '#C084FC' : '#9333EA';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ptI.x, ptI.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Nhãn tâm I: I(vaX; haY)
          ctx.fillStyle = isDark ? '#E9D5FF' : '#7E22CE';
          ctx.font = '700 12px "IBM Plex Mono", monospace';
          ctx.textAlign = 'left';
          const labelI = this.hideFormulasOnGraph ? 'Tâm I' : `I(${rf.vaX.toFixed(2)}; ${rf.haY.toFixed(2)})`;
          ctx.fillText(labelI, ptI.x + 8, ptI.y - 8);
          ctx.restore();
        }
      }

      // 5. VẼ ĐƯỜNG CONG ĐỒ THỊ f(x)
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = isDark ? '#38BDF8' : '#2563EB';

      const vaX = rf.vaX;
      let isDrawing = false;
      const maxScreenY = h * 3;

      ctx.beginPath();

      for (let px = 0; px <= w; px += 2) {
        const wx = this.screenToWorld(px, 0).x;
        
        // Ngắt nét khi băng qua tiệm cận đứng
        if (vaX !== null && Math.abs(wx - vaX) < 0.06) {
          if (isDrawing) {
            ctx.stroke();
            ctx.beginPath();
            isDrawing = false;
          }
          continue;
        }

        const wy = rf.evaluate(wx);
        if (wy === null || !isFinite(wy)) {
          if (isDrawing) {
            ctx.stroke();
            ctx.beginPath();
            isDrawing = false;
          }
          continue;
        }

        const py = this.worldToScreen(0, wy).y;

        if (py < -maxScreenY || py > maxScreenY) {
          if (isDrawing) {
            ctx.stroke();
            ctx.beginPath();
            isDrawing = false;
          }
          continue;
        }

        if (!isDrawing) {
          ctx.moveTo(px, py);
          isDrawing = true;
        } else {
          ctx.lineTo(px, py);
        }
      }

      if (isDrawing) {
        ctx.stroke();
      }
      ctx.restore();

      // 6. VẼ ĐIỂM THỦNG (KHI ad - bc = 0)
      if (rf.isDegenerateHole && rf.holeX !== null && rf.holeY !== null) {
        const pt = this.worldToScreen(rf.holeX, rf.holeY);
        ctx.save();
        ctx.fillStyle = isDark ? '#111827' : '#FFFFFF';
        ctx.strokeStyle = isDark ? '#F87171' : '#DC2626';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isDark ? '#F87171' : '#DC2626';
        ctx.font = '700 11px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Đồ thị bị khuyết (${rf.holeX.toFixed(1)}, ${rf.holeY.toFixed(1)})`, pt.x + 10, pt.y - 6);
        ctx.restore();
      }

      // 7. VẼ ĐIỂM KHẢO SÁT M(x, f(x)) — LUÔN NẰM TRÊN ĐỒ THỊ
      if (this.pointX !== null) {
        const pyVal = rf.evaluate(this.pointX);
        if (pyVal !== null && isFinite(pyVal)) {
          const ptScreen = this.worldToScreen(this.pointX, pyVal);

          if (ptScreen.y >= -50 && ptScreen.y <= h + 50 && ptScreen.x >= -50 && ptScreen.x <= w + 50) {
            ctx.save();
            
            // Đường dóng nét đứt xuống Ox và sang Oy
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = isDark ? 'rgba(251, 191, 36, 0.5)' : 'rgba(217, 119, 6, 0.5)';

            ctx.beginPath();
            ctx.moveTo(ptScreen.x, origin.y);
            ctx.lineTo(ptScreen.x, ptScreen.y);
            ctx.lineTo(origin.x, ptScreen.y);
            ctx.stroke();

            // Chấm tròn điểm M (lớn hơn khi đang kéo)
            ctx.fillStyle = isDark ? '#FBBF24' : '#F59E0B';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2.5;

            ctx.beginPath();
            ctx.arc(ptScreen.x, ptScreen.y, this.isDraggingPoint ? 9 : 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Nhãn M(x, y)
            ctx.fillStyle = isDark ? '#FBBF24' : '#D97706';
            ctx.font = '700 12px "IBM Plex Mono", monospace';
            ctx.textAlign = 'left';
            const labelX = Math.abs(this.pointX) >= 1000 ? this.pointX.toExponential(2) : this.pointX.toFixed(2);
            const labelY = Math.abs(pyVal) >= 1000 ? pyVal.toExponential(2) : pyVal.toFixed(2);
            ctx.fillText(`M(${labelX}, ${labelY})`, ptScreen.x + 10, ptScreen.y - 10);

            ctx.restore();
          } else {
            // M nằm ngoài tầm nhìn màn hình (ví dụ x = 1000 hoặc thu nhỏ):
            ctx.save();
            const edgeX = Math.max(20, Math.min(w - 20, ptScreen.x));
            const edgeY = Math.max(30, Math.min(h - 30, ptScreen.y));
            ctx.fillStyle = isDark ? '#FBBF24' : '#D97706';
            ctx.font = '700 11px "IBM Plex Mono", monospace';
            ctx.textAlign = ptScreen.x > w ? 'right' : (ptScreen.x < 0 ? 'left' : 'center');
            const arrow = ptScreen.x > w ? '➔' : (ptScreen.x < 0 ? '⬅' : '');
            const labelX = Math.abs(this.pointX) >= 1000 ? this.pointX.toExponential(1) : this.pointX.toFixed(1);
            const labelY = Math.abs(pyVal) >= 1000 ? pyVal.toExponential(1) : pyVal.toFixed(2);
            ctx.fillText(`📍 M(${labelX}, ${labelY}) ${arrow}`, edgeX, edgeY);
            ctx.restore();
          }
        }
      }
    }
  }

  // =========================================================================
  // 3. ĐIỀU PHỐI PHÒNG THÍ NGHIỆM TIỆM CẬN (ASYMPTOTE LAB APP)
  // =========================================================================
  class AsymptoteLabApp {
    constructor() {
      this.currentActivity = 'A'; // 'A', 'B', 'final', 'summary', 'sandbox'
      this.currentStep = 1;        // 1: Dự đoán, 2: Thử nghiệm, 3: Quan sát, 4: Giải thích
      
      this.rf = new RationalFunction(2, 1, 1, 3); // f(x) = (2x+1)/(x+3)

      this.userPredictions = {
        A: { choice: null, reason: '' },
        B: { choice: null, reason: '' },
      };

      // Đề kiểm tra được sinh ngẫu nhiên, luôn tránh trường hợp tử và mẫu cùng triệt tiêu.
      this.challengeData = this.generateChallengeData();
      this.challengePassed = false;
      this.challengeSubmitted = false;
      this.challengeInputs = null;
      this.sandboxInputValues = null;
      this.sandboxSubmitted = false;

      // Nạp bài học cá nhân, tự đánh giá và tiến độ ôn tập từ LocalStorage
      try {
        this.personalLesson = localStorage.getItem('rational_lab_personal_lesson') || '';
        const savedAssessment = localStorage.getItem('rational_lab_self_assessment');
        this.noteSelfAssessment = savedAssessment
          ? JSON.parse(savedAssessment)
          : { twoSides: false, infinityDirection: false, definition: false, horizontal: false };
        this.noteSelfAssessmentDone = localStorage.getItem('rational_lab_assessment_done') === 'true';

        const savedReview = localStorage.getItem('rational_lab_review_progress');
        if (savedReview) {
          const parsed = JSON.parse(savedReview);
          this.reviewGame = {
            level: parsed.level || 1,
            index: 0,
            completed: Array.isArray(parsed.completed) ? parsed.completed : [],
            score: parsed.score || 0,
            selected: null,
            answered: false
          };
        } else {
          this.reviewGame = { level: 1, index: 0, completed: [], score: 0, selected: null, answered: false };
        }
      } catch (e) {
        this.personalLesson = '';
        this.noteSelfAssessment = { twoSides: false, infinityDirection: false, definition: false, horizontal: false };
        this.noteSelfAssessmentDone = false;
        this.reviewGame = { level: 1, index: 0, completed: [], score: 0, selected: null, answered: false };
      }

      this.activityData = { A: this.generateActivityData('A'), B: this.generateActivityData('B') };

      this.graphEngine = null;
      this.init();
    }

    init() {
      if (!document.getElementById('app-root')) return;
      this.renderLayout();
      this.initGraph();
      this.bindEvents();

      const params = new URLSearchParams(window.location.search);
      const initialAct = params.get('act') || 'A';
      const initialStep = parseInt(params.get('step') || '1', 10);
      if (['A', 'B', 'final', 'summary', 'sandbox', 'review'].includes(initialAct)) {
        if (initialAct === 'summary') this.challengePassed = true;
        this.switchActivity(initialAct);
        if (initialAct === 'sandbox' && params.has('a')) {
          const a = Number(params.get('a') ?? 2);
          const b = Number(params.get('b') ?? 1);
          const c = Number(params.get('c') ?? 1);
          const d = Number(params.get('d') ?? 3);
          this.sandboxInputValues = { a, b, c, d };
          this.sandboxSubmitted = true;
          this.rf = new RationalFunction(a, b, c, d);
          this.graphEngine.setFunction(this.rf);
          this.renderStepView();
        }
        if (initialStep >= 2 && initialStep <= 4) {
          for (let s = 2; s <= initialStep; s++) {
            this.switchStep(s);
          }
        }
      } else {
        this.switchActivity('A');
      }

      if (params.get('dark') === '1' || params.get('theme') === 'dark') {
        document.body.classList.add('night-flight');
        const icon = document.getElementById('theme-icon');
        const text = document.getElementById('theme-text');
        if (icon) icon.textContent = '🌙';
        if (text) text.textContent = 'Chế độ Tối';
        this.graphEngine.render();
      }
    }

    renderMath(el) {
      if (!el) return;
      if (window.renderMathInElement) {
        try {
          window.renderMathInElement(el, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '\\[', right: '\\]', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\(', right: '\\)', display: false }
            ],
            throwOnError: false,
            strict: false
          });
        } catch (err) {
          console.warn('KaTeX rendering error:', err);
        }
      }
    }

    renderLayout() {
      const root = document.getElementById('app-root');
      if (!root) return;

      root.innerHTML = `
        <div class="asymptote-lab-container" data-activity="${this.currentActivity || 'A'}">
          <!-- 1. HEADER CHÍNH -->
          <header class="lab-header">
            <div class="lab-title-group">
              <div class="lab-icon-badge">🔬</div>
              <div class="lab-header-text">
                <span class="lab-kicker">NHÓM 4 - RATIONAL LAB B</span>
                <h1 class="lab-heading">Khám Phá & Dự Đoán Tiệm Cận Hàm Phân Thức</h1>
              </div>
            </div>

            <div class="lab-header-actions">
              <a href="index.html" class="btn-header-action" style="text-decoration: none;">📘 Ôn lý thuyết</a>
              <button id="btn-theme-toggle" class="btn-header-action" title="Chuyển chế độ giao diện">
                <span id="theme-icon">☀️</span> <span id="theme-text">Chế độ Sáng</span>
              </button>
              <button id="btn-reset-app" class="btn-header-action" title="Thiết lập lại từ đầu">
                🔄 Đặt lại
              </button>
            </div>
          </header>

          <!-- 2. THANH CHỌN HOẠT ĐỘNG (MENU ĐA THIẾT BỊ) -->
          <nav class="activity-nav-bar" id="activityNavBar" aria-label="Điều hướng hoạt động">
            <button class="activity-tab-btn active" data-act="A" title="Hoạt động A: Tiệm cận đứng">
              <span class="tab-icon">📈</span>
              <span class="tab-label-pc"><span class="tab-badge-num">HĐ A</span> Tiệm cận đứng</span>
              <span class="tab-label-mobile">TCĐ</span>
            </button>
            <button class="activity-tab-btn" data-act="B" title="Hoạt động B: Tiệm cận ngang">
              <span class="tab-icon">📉</span>
              <span class="tab-label-pc"><span class="tab-badge-num">HĐ B</span> Tiệm cận ngang</span>
              <span class="tab-label-mobile">TCN</span>
            </button>
            <button class="activity-tab-btn" data-act="final" title="Dự đoán hàm mới">
              <span class="tab-icon">🎯</span>
              <span class="tab-label-pc">Dự đoán hàm mới</span>
              <span class="tab-label-mobile">Dự đoán</span>
            </button>
            <button class="activity-tab-btn" data-act="summary" title="Tổng kết & Bài học">
              <span class="tab-icon">📝</span>
              <span class="tab-label-pc">Tổng kết & Bài học</span>
              <span class="tab-label-mobile">Tổng kết</span>
            </button>
            <button class="activity-tab-btn" data-act="sandbox" title="Khảo sát hàm số">
              <span class="tab-icon">🧪</span>
              <span class="tab-label-pc">Khảo sát hàm số</span>
              <span class="tab-label-mobile">Khảo sát</span>
            </button>
            <button class="activity-tab-btn" data-act="review" title="Ôn tập">
              <span class="tab-icon">🎮</span>
              <span class="tab-label-pc">Ôn tập</span>
              <span class="tab-label-mobile">Ôn tập</span>
            </button>
          </nav>

          <!-- 3. THANH 4 BƯỚC HỌC (STEP TRACKER) -->
          <div class="step-tracker-bar" id="stepTrackerBar">
            <div class="step-tracker-item active" data-step="1">
              <div class="step-number-circle">1</div>
              <div class="step-text-wrap">
                <span class="step-label-sub">BƯỚC 1</span>
                <span class="step-label-main">Dự đoán</span>
              </div>
            </div>
            <div class="step-tracker-item" data-step="2">
              <div class="step-number-circle">2</div>
              <div class="step-text-wrap">
                <span class="step-label-sub">BƯỚC 2</span>
                <span class="step-label-main">Thử nghiệm</span>
              </div>
            </div>
            <div class="step-tracker-item" data-step="3">
              <div class="step-number-circle">3</div>
              <div class="step-text-wrap">
                <span class="step-label-sub">BƯỚC 3</span>
                <span class="step-label-main">Quan sát</span>
              </div>
            </div>
            <div class="step-tracker-item" data-step="4">
              <div class="step-number-circle">4</div>
              <div class="step-text-wrap">
                <span class="step-label-sub">BƯỚC 4</span>
                <span class="step-label-main">Giải thích</span>
              </div>
            </div>
          </div>

          <!-- 4. KHU VỰC BẢNG THÍ NGHIỆM (2 CỘT) -->
          <div class="lab-workbench-grid">
            <!-- CỘT TRÁI: ĐỒ THỊ LỚN Ở TRUNG TÂM -->
            <div class="graph-card">
              <div class="graph-top-hud">
                <span class="graph-title-formula" id="graph-formula-text">
                  $f(x) = \\dfrac{2x + 1}{x + 3}$
                </span>
                <span id="graph-point-badge" style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--color-point);">
                  Điểm M(x, f(x)) luôn bám trên đồ thị
                </span>
              </div>

              <!-- CANVAS WRAPPER -->
              <div class="graph-canvas-wrapper" id="canvas-container">
                <canvas id="graph-canvas"></canvas>
                <!-- Nút điều hướng camera nổi góc trên bên phải -->
                <div class="canvas-floating-controls">
                  <button id="btn-cam-zoomin" title="Phóng to (hoặc cuộn chuột lên)">➕ Phóng to</button>
                  <button id="btn-cam-zoomout" title="Thu nhỏ (hoặc cuộn chuột xuống)">➖ Thu nhỏ</button>
                  <button id="btn-cam-home" title="Về gốc tọa độ O(0,0)">🎯 Về O</button>
                  <button id="btn-cam-focus-m" title="Đưa góc nhìn tới điểm M">📍 Tới M</button>
                </div>
                <div class="canvas-pan-hint">
                  <span>🖱️ Giữ chuột trái kéo để di chuyển đồ thị • Cuộn chuột để phóng to/thu nhỏ • Kéo điểm M trên đường cong</span>
                </div>
              </div>

              <!-- KHU VỰC THỬ NGHIỆM HỆ SỐ TRÊN MOBILE (NGAY DƯỚI ĐỒ THỊ) -->
              <div id="mobile-step2-slot" class="mobile-step2-slot"></div>

              <!-- BỘ ĐIỀU KHIỂN ĐIỂM M & TRỤC KÉO x -->
              <div class="point-m-control-panel">
                <div class="point-m-row-top">
                  <div class="point-m-slider-block">
                    <div class="point-m-slider-label">
                      <span style="font-weight: 800; color: var(--primary);">🎚️ TRỤC KÉO HOÀNH ĐỘ x:</span>
                      <span id="slider-x-val-badge" class="slider-value-badge" style="font-family: var(--font-mono); font-weight: 700;">x = 2.00</span>
                    </div>
                    <div class="scrubber-slider-container">
                      <span class="scrubber-bound-label" id="scrubber-min-label">-15</span>
                      <input type="range" id="global-x-scrubber" min="-15" max="15" step="0.05" value="2.0" class="lab-range-slider scrubber-slider" title="Kéo để di chuyển điểm M liên tục trên đồ thị">
                      <span class="scrubber-bound-label" id="scrubber-max-label">+15</span>
                    </div>
                  </div>

                  <div class="point-m-mobile-drag-hint" role="status">
                    <span class="drag-hint-icon">👆</span>
                    <span class="drag-hint-text">Bạn có thể thao tác kéo trên hàm số</span>
                  </div>

                  <div class="point-m-input-block">
                    <label for="global-x-input" style="font-size: 12px; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 4px;">
                      ⌨️ Nhập x tùy ý (số rất lớn, phân số, căn, ±∞):
                    </label>
                    <div class="point-m-input-row" style="display: flex; gap: 6px; align-items: center;">
                      <div class="input-with-keypad-wrap" style="flex: 1 1 auto;">
                        <input type="text" id="global-x-input" class="global-x-text-field math-keypad-input" data-label="Hoành độ x" value="2" placeholder="VD: 1000, 3/2, √4, +inf..." autocomplete="off">
                        <button type="button" class="btn-keypad-trigger" data-target="global-x-input" title="Mở bàn phím toán học">⌨️</button>
                      </div>
                      <button id="btn-apply-global-x" class="btn-action-primary" style="width: auto; min-width: 68px; flex: 0 0 auto; padding: 6px 14px; font-size: 12px; white-space: nowrap;">Áp dụng</button>
                    </div>
                  </div>
                </div>

                <!-- QUICK CHIPS THỬ NGHIỆM -->
                <div class="point-m-quick-chips">
                  <span style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); align-self: center;">Thử nhanh:</span>
                  <button class="chip-btn" data-x="1000">x = 1 000</button>
                  <button class="chip-btn" data-x="-1000">x = -1 000</button>
                  <button class="chip-btn" data-x="1000000">x = 1 000 000 (Rất lớn)</button>
                  <button class="chip-btn chip-inf" data-x="+inf">x ➔ +∞ (Vô cực phải)</button>
                  <button class="chip-btn chip-inf" data-x="-inf">x ➔ -∞ (Vô cực trái)</button>
                  <button class="chip-btn chip-tcd" data-type="near_left">x ➔ x₀⁻ (Sát TCĐ trái)</button>
                  <button class="chip-btn chip-tcd" data-type="near_right">x ➔ x₀⁺ (Sát TCĐ phải)</button>
                  <button class="chip-btn" data-x="0">x = 0</button>
                </div>

                <!-- HUD VIỄN TRẮC THỜI GIAN THỰC -->
                <div class="point-m-telemetry-hud" id="point-m-telemetry-box"></div>
              </div>

              <!-- TOOLBAR ĐIỀU KHIỂN ĐỒ THỊ -->
              <div class="graph-toolbar">
                <div class="graph-toggle-group">
                  <button id="btn-toggle-tcd" class="btn-toggle-asymptote tcd active">
                    <span class="legend-line-indicator tcd"></span>
                    <span>Tiệm cận đứng</span>
                  </button>
                  <button id="btn-toggle-tcn" class="btn-toggle-asymptote tcn active">
                    <span class="legend-line-indicator tcn"></span>
                    <span>Tiệm cận ngang</span>
                  </button>
                  <button id="btn-toggle-center-i" class="btn-toggle-asymptote center-i active" title="Bật/tắt hiển thị tâm đối xứng I (giao điểm 2 tiệm cận)">
                    <span class="legend-line-indicator center-i"></span>
                    <span>Tâm đối xứng I</span>
                  </button>
                </div>

                <button id="btn-reset-view" class="btn-reset-view" title="Trở về vị trí căn chuẩn">
                  🎯 Căn chuẩn đồ thị
                </button>
              </div>
            </div>

            <!-- CỘT PHẢI: BẢNG TƯƠNG TÁC THEO TỪNG BƯỚC -->
            <div class="control-card" id="controlPanelSlot"></div>
          </div>

          <!-- NỀN BÊN DƯỚI CÙNG DẠNG CUỐN VỞ HỌC SINH -->
          <footer class="notebook-footer-section" aria-label="Sổ tay ghi chép toán học">
            <div class="notebook-spine-wrapper">
              <div class="notebook-rings">
                <span class="notebook-ring"></span>
                <span class="notebook-ring"></span>
                <span class="notebook-ring"></span>
                <span class="notebook-ring"></span>
                <span class="notebook-ring"></span>
                <span class="notebook-ring"></span>
                <span class="notebook-ring"></span>
                <span class="notebook-ring"></span>
                <span class="notebook-ring"></span>
                <span class="notebook-ring"></span>
                <span class="notebook-ring"></span>
                <span class="notebook-ring"></span>
              </div>
            </div>

            <div class="notebook-page-sheet">
              <div class="notebook-content-body">
                <div class="notebook-header-row">
                  <div class="notebook-title-badge">
                    <span class="notebook-icon">📓</span>
                    <span class="notebook-title-text">SỔ TAY THỰC HÀNH TOÁN 12 · RATIONAL LAB B</span>
                  </div>
                  <span class="notebook-tag">Chương I: Đồ thị hàm phân thức</span>
                </div>

                <div class="notebook-notes-grid">
                  <div class="notebook-note-col">
                    <div class="notebook-note-title">🔴 Tiệm cận đứng (TCĐ)</div>
                    <p class="notebook-note-desc">
                      Gọi $x_0$ là nghiệm của mẫu số. Nếu $\\lim_{x\\to x_0^-}f(x)=\\pm\\infty$ hoặc $\\lim_{x\\to x_0^+}f(x)=\\pm\\infty$, thì đường thẳng $x=x_0$ là tiệm cận đứng.
                    </p>
                  </div>

                  <div class="notebook-note-col">
                    <div class="notebook-note-title">🟢 Tiệm cận ngang (TCN)</div>
                    <p class="notebook-note-desc">
                      Nếu $\\lim_{x\\to+\\infty}f(x)=L$ hoặc $\\lim_{x\\to-\\infty}f(x)=L$ thì đường thẳng $y=L$ là tiệm cận ngang của đồ thị hàm số (với $f(x)=\\dfrac{ax+b}{cx+d}$, TCN là $y=\\dfrac{a}{c}$).
                    </p>
                  </div>

                  <div class="notebook-note-col">
                    <div class="notebook-note-title">🔵 Đạo hàm và chiều biến thiên</div>
                    <p class="notebook-note-desc">
                      $f'(x)=\\dfrac{ad-bc}{(cx+d)^2}$. Trên mỗi khoảng xác định, mẫu bình phương dương nên dấu của $f'(x)$ do $ad-bc$ quyết định.
                    </p>
                  </div>
                </div>

                <div class="notebook-footer-row">
                  <span>✍️ “Học Toán từ trực quan: Dự đoán $\to$ Thử nghiệm $\to$ Quan sát $\to$ Tự hiểu bản chất.”</span>
                  <span class="notebook-author">Nhóm 4 • THPT</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      `;
      this.renderMath(document.querySelector('.notebook-footer-section'));
    }

    initGraph() {
      const canvas = document.getElementById('graph-canvas');
      this.graphEngine = new InteractiveGraphEngine(canvas);
      
      this.graphEngine.onPointMoved = (newX) => {
        const xSlider = document.getElementById('obs-range-x');
        if (xSlider) xSlider.value = newX;

        const globalScrubber = document.getElementById('global-x-scrubber');
        if (globalScrubber && Math.abs(Number(globalScrubber.value) - newX) > 0.04) {
          globalScrubber.value = Math.max(Number(globalScrubber.min), Math.min(Number(globalScrubber.max), newX));
        }

        const globalInput = document.getElementById('global-x-input');
        if (globalInput && document.activeElement !== globalInput) {
          globalInput.value = Math.abs(newX) >= 1000 ? newX.toExponential(2) : newX.toFixed(2);
        }

        const badge = document.getElementById('slider-x-val-badge');
        if (badge) {
          badge.textContent = 'x = ' + (Math.abs(newX) >= 1000 ? newX.toExponential(2) : newX.toFixed(2));
        }

        this.updatePointMTelemetry(newX);
        this.updateTelemetryValues(newX);
      };
    }

    bindEvents() {
      document.querySelectorAll('.activity-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.switchActivity(btn.dataset.act);
        });
      });

      document.querySelectorAll('.step-tracker-item').forEach(item => {
        item.addEventListener('click', () => {
          const targetStep = parseInt(item.dataset.step);
          // Chỉ cho quay lại các bước đã qua; lời giải không mở trước thí nghiệm.
          if (targetStep <= this.currentStep) this.switchStep(targetStep);
        });
      });

      // Điều khiển Camera nổi trên Canvas
      const btnZoomIn = document.getElementById('btn-cam-zoomin');
      if (btnZoomIn) btnZoomIn.addEventListener('click', () => this.graphEngine.zoomIn());

      const btnZoomOut = document.getElementById('btn-cam-zoomout');
      if (btnZoomOut) btnZoomOut.addEventListener('click', () => this.graphEngine.zoomOut());

      const btnHome = document.getElementById('btn-cam-home');
      if (btnHome) btnHome.addEventListener('click', () => this.graphEngine.centerAtOrigin());

      const btnFocusM = document.getElementById('btn-cam-focus-m');
      if (btnFocusM) btnFocusM.addEventListener('click', () => this.graphEngine.centerAtPointM());

      // Trục kéo hoành độ x toàn cục
      const globalScrubber = document.getElementById('global-x-scrubber');
      if (globalScrubber) {
        globalScrubber.addEventListener('input', (e) => {
          const val = Number(e.target.value);
          this.graphEngine.setPointX(val);
          const badge = document.getElementById('slider-x-val-badge');
          if (badge) badge.textContent = 'x = ' + val.toFixed(2);
          const globalInput = document.getElementById('global-x-input');
          if (globalInput) globalInput.value = val.toFixed(2);
          this.updatePointMTelemetry(val);
          this.updateTelemetryValues(val);
        });
      }

      // Hộp nhập x trực tiếp & nút Áp dụng
      const btnApplyX = document.getElementById('btn-apply-global-x');
      const globalInput = document.getElementById('global-x-input');
      if (btnApplyX && globalInput) {
        btnApplyX.addEventListener('click', () => {
          this.applyDirectXInput(globalInput.value);
        });
        globalInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            this.applyDirectXInput(globalInput.value);
          }
        });
      }

      // Thẻ thử nhanh (quick chips)
      document.querySelectorAll('.chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.dataset.x) {
            this.applyDirectXInput(btn.dataset.x);
          } else if (btn.dataset.type === 'near_left') {
            if (this.rf.vaX !== null) {
              this.applyDirectXInput((this.rf.vaX - 0.001).toFixed(4));
            }
          } else if (btn.dataset.type === 'near_right') {
            if (this.rf.vaX !== null) {
              this.applyDirectXInput((this.rf.vaX + 0.001).toFixed(4));
            }
          }
        });
      });

      const btnTCD = document.getElementById('btn-toggle-tcd');
      btnTCD.addEventListener('click', () => {
        this.graphEngine.showTCD = !this.graphEngine.showTCD;
        btnTCD.classList.toggle('active', this.graphEngine.showTCD);
        this.graphEngine.render();
      });

      const btnTCN = document.getElementById('btn-toggle-tcn');
      btnTCN.addEventListener('click', () => {
        this.graphEngine.showTCN = !this.graphEngine.showTCN;
        btnTCN.classList.toggle('active', this.graphEngine.showTCN);
        this.graphEngine.render();
      });

      const btnCenterI = document.getElementById('btn-toggle-center-i');
      if (btnCenterI) {
        btnCenterI.addEventListener('click', () => {
          this.graphEngine.showCenterI = !this.graphEngine.showCenterI;
          btnCenterI.classList.toggle('active', this.graphEngine.showCenterI);
          this.graphEngine.render();
        });
      }

      document.getElementById('btn-reset-view').addEventListener('click', () => {
        this.graphEngine.resetView();
      });

      const btnTheme = document.getElementById('btn-theme-toggle');
      btnTheme.addEventListener('click', () => {
        const isNight = document.body.classList.toggle('night-flight');
        document.getElementById('theme-icon').textContent = isNight ? '🌙' : '☀️';
        document.getElementById('theme-text').textContent = isNight ? 'Chế độ Tối' : 'Chế độ Sáng';
        this.graphEngine.render();
      });

      document.getElementById('btn-reset-app').addEventListener('click', () => {
        if (confirm('Đặt lại toàn bộ thí nghiệm về trạng thái ban đầu?')) {
          try {
            localStorage.removeItem('rational_lab_review_progress');
            localStorage.removeItem('rational_lab_personal_lesson');
            localStorage.removeItem('rational_lab_self_assessment');
            localStorage.removeItem('rational_lab_assessment_done');
          } catch (e) {}
          this.userPredictions = { A: { choice: null, reason: '' }, B: { choice: null, reason: '' } };
          this.activityData = { A: this.generateActivityData('A'), B: this.generateActivityData('B') };
          this.challengeData = this.generateChallengeData();
          this.challengeSubmitted = false;
          this.challengePassed = false;
          this.challengeInputs = null;
          this.sandboxInputValues = null;
          this.sandboxSubmitted = false;
          this.personalLesson = '';
          this.noteSelfAssessment = { twoSides: false, infinityDirection: false, definition: false, horizontal: false };
          this.noteSelfAssessmentDone = false;
          this.reviewGame = { level: 1, index: 0, completed: [], score: 0, selected: null, answered: false };
          this.switchActivity('A');
        }
      });

      // Tự động điều chỉnh vị trí hiển thị thanh kéo hệ số khi xoay màn hình hoặc đổi kích thước
      window.addEventListener('resize', () => {
        if (this.currentStep === 2 && (this.currentActivity === 'A' || this.currentActivity === 'B')) {
          this.renderStepView();
        }
      });

      // Gắn sự kiện cho bàn phím ảo toán học
      this.bindMathKeypadInputs();
    }

    switchActivity(act) {
      if (act === 'summary' && !this.challengePassed) {
        alert('Hãy thử làm bài kiểm tra hàm mới trước, rồi quay lại tổng kết nhé.');
        return;
      }
      if (act === 'A' || act === 'B') {
        this.activityData[act] = this.generateActivityData(act);
        this.userPredictions[act] = { choice: null, reason: '' };
      }
      if (act === 'final' && !this.challengePassed && this.challengeSubmitted) {
        this.challengeData = this.generateChallengeData();
        this.challengeInputs = null;
        this.challengeSubmitted = false;
      }
      if (act === 'review') {
        if (!this.reviewGame) {
          this.reviewGame = { level: 1, index: 0, completed: [], score: 0, selected: null, answered: false };
        }
        if (!this.reviewGame.questions) {
          this.reviewGame.questions = this.generateReviewQuestionSets();
        }
        this.reviewGame.selected = null;
        this.reviewGame.answered = false;
      }
      this.currentActivity = act;
      this.currentStep = 1;
      const labContainer = document.querySelector('.asymptote-lab-container');
      if (labContainer) labContainer.dataset.activity = act;

      document.querySelectorAll('.activity-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.act === act);
      });

      const tracker = document.getElementById('stepTrackerBar');
      const workbench = document.querySelector('.lab-workbench-grid');
      const reviewMode = act === 'review';
      if (tracker) {
        if (act === 'final' || act === 'summary' || act === 'sandbox' || reviewMode) {
          tracker.style.display = 'none';
        } else {
          tracker.style.display = '';
        }
      }
      const activeBtn = document.querySelector(`.activity-tab-btn[data-act="${act}"]`);
      if (activeBtn && typeof activeBtn.scrollIntoView === 'function') {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
      if (workbench) workbench.classList.toggle('review-mode', reviewMode);

      if (act === 'A') {
        const set = this.activityData.A;
        this.rf = new RationalFunction(set.a, set.b, set.c, set.d);
        if (this.graphEngine) {
          this.graphEngine.isLocked = false;
          this.graphEngine.setPointX(2.0);
        }
      } else if (act === 'B') {
        const set = this.activityData.B;
        this.rf = new RationalFunction(set.a, set.b, set.c, set.d);
        if (this.graphEngine) {
          this.graphEngine.isLocked = false;
          this.graphEngine.setPointX(2.0);
        }
      } else if (act === 'final') {
        this.rf = new RationalFunction(this.challengeData.a, this.challengeData.b, this.challengeData.c, this.challengeData.d);
        if (this.graphEngine) {
          this.graphEngine.isLocked = !this.challengeSubmitted;
          this.graphEngine.setPointX(0);
        }
      } else if (act === 'summary') {
        this.rf = new RationalFunction(this.challengeData.a, this.challengeData.b, this.challengeData.c, this.challengeData.d);
        if (this.graphEngine) {
          this.graphEngine.isLocked = false;
          this.graphEngine.setPointX(0);
        }
      } else if (act === 'sandbox') {
        this.rf = this.sandboxInputValues
          ? new RationalFunction(this.sandboxInputValues.a, this.sandboxInputValues.b, this.sandboxInputValues.c, this.sandboxInputValues.d)
          : new RationalFunction(2, -2, 1, 1);
        if (this.graphEngine) {
          this.graphEngine.isLocked = false;
          this.graphEngine.setPointX(1.5);
        }
      } else if (act === 'review') {
        if (this.graphEngine) {
          this.graphEngine.isLocked = true;
        }
      }

      if (this.graphEngine) {
        this.graphEngine.setFunction(this.rf);
      }
      this.updateFormulaText();

      const ptX = this.graphEngine && this.graphEngine.pointX !== null ? this.graphEngine.pointX : 2.0;
      const scrubber = document.getElementById('global-x-scrubber');
      if (scrubber) scrubber.value = ptX;
      const xInput = document.getElementById('global-x-input');
      if (xInput) xInput.value = ptX.toString();
      const badge = document.getElementById('slider-x-val-badge');
      if (badge) badge.textContent = 'x = ' + ptX.toFixed(2);
      this.updatePointMTelemetry(ptX);

      if (document.getElementById('controlPanelSlot')) {
        this.renderStepView();
      }
    }

    switchStep(step) {
      if (!Number.isInteger(step) || step < 1 || step > 4 || step > this.currentStep + 1) return;
      this.currentStep = step;
      this.renderStepView();
    }

    updateFormulaText() {
      const el = document.getElementById('graph-formula-text');
      if (el) {
        el.innerHTML = `$${this.rf.toLatex()}$`;
        this.renderMath(el);
      }
    }

    renderStepView() {
      document.querySelectorAll('.step-tracker-item').forEach(item => {
        const s = parseInt(item.dataset.step);
        item.classList.toggle('active', s === this.currentStep);
        item.classList.toggle('completed', s < this.currentStep);
        item.classList.toggle('locked', s > this.currentStep);
        item.setAttribute('aria-disabled', s > this.currentStep ? 'true' : 'false');
      });

      // Ở Bước 1, không hiển thị công thức tổng quát trên đồ thị để học sinh dự đoán trước
      this.graphEngine.hideFormulasOnGraph = (this.currentStep === 1);
      this.graphEngine.render();

      const slot = document.getElementById('controlPanelSlot');
      if (!slot) return;

      const mobileStep2Slot = document.getElementById('mobile-step2-slot');
      if (mobileStep2Slot) mobileStep2Slot.innerHTML = '';
      const graphCard = document.querySelector('.graph-card');
      const isMobile = window.innerWidth <= 767;
      const isStep2 = (this.currentStep === 2 && (this.currentActivity === 'A' || this.currentActivity === 'B'));
      if (graphCard) {
        graphCard.classList.toggle('step2-active', isStep2 && isMobile);
      }

      if (this.currentActivity === 'A') {
        this.renderActivityA(slot);
      } else if (this.currentActivity === 'B') {
        this.renderActivityB(slot);
      } else if (this.currentActivity === 'final') {
        this.renderFinalChallenge(slot);
      } else if (this.currentActivity === 'summary') {
        this.renderSummary(slot);
      } else if (this.currentActivity === 'sandbox') {
        this.renderSandbox(slot);
      } else if (this.currentActivity === 'review') {
        this.renderReviewGame(slot);
      }

      this.renderMath(slot);
      if (mobileStep2Slot && isStep2 && isMobile) {
        this.renderMath(mobileStep2Slot);
      }
      this.bindMathKeypadInputs();
    }

    randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomChoice(values) {
      return values[this.randomInt(0, values.length - 1)];
    }

    formatQuizNumber(value) {
      return Number(Number(value).toFixed(4)).toString();
    }

    formatLinearExpression(coefficient, constant) {
      const xPart = coefficient === 1 ? 'x' : coefficient === -1 ? '−x' : `${this.formatQuizNumber(coefficient)}x`;
      if (constant === 0) return xPart;
      return `${xPart} ${constant > 0 ? '+' : '−'} ${this.formatQuizNumber(Math.abs(constant))}`;
    }

    generateActivityData(activity) {
      if (activity === 'A') {
        let set;
        do { set = { a: 2, b: 1, c: this.randomChoice([-1, 1]), d: this.randomInt(-4, 3) }; }
        while (this.activityData && this.activityData.A && set.c === this.activityData.A.c && set.d === this.activityData.A.d);
        return set;
      }
      let set;
      do {
        set = { a: this.randomChoice([-3, -1, 1, 2]), b: this.randomInt(-3, 3), c: this.randomChoice([-1, 1]), d: this.randomInt(2, 4) };
      } while (set.a * set.d - set.b * set.c === 0 || (set.a + 2) * set.d - set.b * set.c === 0 || (this.activityData && this.activityData.B && set.a === this.activityData.B.a && set.b === this.activityData.B.b && set.c === this.activityData.B.c && set.d === this.activityData.B.d));
      return set;
    }

    generateChallengeData() {
      let set;
      let signature;
      do {
        const c = this.randomChoice([-3, -2, -1, 1, 2, 3]);
        const expectedVA = this.randomChoice([-4, -3, -2, 2, 3, 4]);
        const a = this.randomChoice([-4, -3, -2, 2, 3, 4]);
        const b = this.randomInt(-8, 8);
        set = { a, b, c, d: -c * expectedVA, expectedVA, expectedHA: a / c };
        signature = `${set.a},${set.b},${set.c},${set.d}`;
      } while (set.a * set.expectedVA + set.b === 0 || signature === this.lastChallengeSignature);
      this.lastChallengeSignature = signature;
      return set;
    }

    computeFunctionSurvey(rf) {
      if (!rf) return null;
      const fmt = num => Number.isInteger(num) ? String(num) : num.toFixed(2).replace(/\.?0+$/, '');
      const determinant = rf.a * rf.d - rf.b * rf.c;
      const isInvalid = rf.c === 0 && rf.d === 0;
      const isHoleCase = rf.c !== 0 && determinant === 0;
      if (isInvalid || isHoleCase || rf.c === 0 || determinant === 0) {
        return null;
      }
      const x_va = -rf.d / rf.c;
      const y_ha = rf.a / rf.c;
      const oyIntercept = rf.d !== 0 ? `A\\left(0;\\, ${fmt(rf.b / rf.d)}\\right)` : 'Không có (trục Oy chính là TCĐ do d = 0)';
      const oxIntercept = rf.a !== 0 ? `B\\left(${fmt(-rf.b / rf.a)};\\, 0\\right)` : 'Không có (đồ thị không cắt Ox do a = 0)';
      const monoText = determinant > 0
        ? `Hàm số đồng biến trên từng khoảng $(-\\infty;\\, ${fmt(x_va)})$ và $(${fmt(x_va)};\\, +\\infty)$ do $ad - bc = ${fmt(determinant)} > 0$.`
        : `Hàm số nghịch biến trên từng khoảng $(-\\infty;\\, ${fmt(x_va)})$ và $(${fmt(x_va)};\\, +\\infty)$ do $ad - bc = ${fmt(determinant)} < 0$.`;
      
      return {
        x_va,
        y_ha,
        determinant,
        domain: `D = \\mathbb{R} \\setminus \\{ ${fmt(x_va)} \\}`,
        centerI: `I\\left(${fmt(x_va)};\\, ${fmt(y_ha)}\\right)`,
        symmetryAxis1: `y - (${fmt(y_ha)}) = x - (${fmt(x_va)})`,
        symmetryAxis2: `y - (${fmt(y_ha)}) = -\\left(x - (${fmt(x_va)})\\right)`,
        oyIntercept,
        oxIntercept,
        monoText,
        extremaText: 'Hàm số không có cực trị.'
      };
    }

    formatFractionLatex(num, den) {
      if (den === 0) return 'Không xác định';
      if (num === 0) return '0';
      if (den < 0) { num = -num; den = -den; }
      if (num % den === 0) return String(num / den);
      const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
      const g = gcd(Math.abs(num), Math.abs(den));
      const sN = num / g;
      const sD = den / g;
      if (sD === 1) return String(sN);
      if (sN < 0) return `-\\dfrac{${Math.abs(sN)}}{${sD}}`;
      return `\\dfrac{${sN}}{${sD}}`;
    }

    formatBbtValue(num, den) {
      if (den === 0) return '—';
      if (num === 0) return '0';
      if (den < 0) { num = -num; den = -den; }
      if (num % den === 0) return String(num / den);
      const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
      const g = gcd(Math.abs(num), Math.abs(den));
      const sN = num / g;
      const sD = den / g;
      if (sD === 1) return String(sN);
      if (sD <= 10) return `${sN}/${sD}`;
      const val = num / den;
      return Number.isInteger(val) ? String(val) : val.toFixed(2).replace(/\.?0+$/, '');
    }

    generateBbtSvg(rf) {
      if (!rf || rf.c === 0) return '';
      const det = rf.a * rf.d - rf.b * rf.c;
      if (det === 0) return '';
      const isIncreasing = det > 0;
      const sign = isIncreasing ? '+' : '−';
      const x0Str = this.formatBbtValue(-rf.d, rf.c);
      const yhaStr = this.formatBbtValue(rf.a, rf.c);

      const arrowMarker = `<defs>
        <marker id="bbt-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="#000000" />
        </marker>
      </defs>`;

      let yElements = '';
      if (isIncreasing) {
        yElements = `
          <text x="105" y="162" text-anchor="middle" font-size="15" fill="#000">${yhaStr}</text>
          <text x="310" y="94" text-anchor="middle" font-size="15" fill="#000">+∞</text>
          <line x1="125" y1="155" x2="292" y2="98" stroke="#000" stroke-width="1.3" marker-end="url(#bbt-arrow)" />

          <text x="350" y="162" text-anchor="middle" font-size="15" fill="#000">−∞</text>
          <text x="555" y="94" text-anchor="middle" font-size="15" fill="#000">${yhaStr}</text>
          <line x1="370" y1="155" x2="537" y2="98" stroke="#000" stroke-width="1.3" marker-end="url(#bbt-arrow)" />
        `;
      } else {
        yElements = `
          <text x="105" y="94" text-anchor="middle" font-size="15" fill="#000">${yhaStr}</text>
          <text x="310" y="162" text-anchor="middle" font-size="15" fill="#000">−∞</text>
          <line x1="125" y1="98" x2="292" y2="155" stroke="#000" stroke-width="1.3" marker-end="url(#bbt-arrow)" />

          <text x="350" y="94" text-anchor="middle" font-size="15" fill="#000">+∞</text>
          <text x="555" y="162" text-anchor="middle" font-size="15" fill="#000">${yhaStr}</text>
          <line x1="370" y1="98" x2="537" y2="155" stroke="#000" stroke-width="1.3" marker-end="url(#bbt-arrow)" />
        `;
      }

      return `<div class="bbt-svg-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 180" style="background:#ffffff; border:1px solid #000000; font-family:'Times New Roman', Times, serif; width:100%; max-width:600px; height:auto; display:block; margin:0 auto;">
          ${arrowMarker}
          <!-- Khung kẻ bảng -->
          <line x1="0" y1="36" x2="600" y2="36" stroke="#000" stroke-width="1" />
          <line x1="0" y1="72" x2="600" y2="72" stroke="#000" stroke-width="1" />
          <line x1="60" y1="0" x2="60" y2="180" stroke="#000" stroke-width="1" />
          
          <!-- Vạch kép tại x0 -->
          <line x1="328" y1="36" x2="328" y2="180" stroke="#000" stroke-width="1.2" />
          <line x1="332" y1="36" x2="332" y2="180" stroke="#000" stroke-width="1.2" />

          <!-- Cột nhãn -->
          <text x="30" y="24" text-anchor="middle" font-style="italic" font-size="16" fill="#000">x</text>
          <text x="30" y="58" text-anchor="middle" font-style="italic" font-size="16" fill="#000">y′</text>
          <text x="30" y="130" text-anchor="middle" font-style="italic" font-size="16" fill="#000">y</text>

          <!-- Hàng x -->
          <text x="105" y="24" text-anchor="middle" font-size="15" fill="#000">−∞</text>
          <text x="330" y="24" text-anchor="middle" font-size="15" fill="#000">${x0Str}</text>
          <text x="555" y="24" text-anchor="middle" font-size="15" fill="#000">+∞</text>

          <!-- Hàng y' -->
          <text x="215" y="58" text-anchor="middle" font-size="18" fill="#000">${sign}</text>
          <text x="445" y="58" text-anchor="middle" font-size="18" fill="#000">${sign}</text>

          <!-- Hàng y -->
          ${yElements}
        </svg>
      </div>`;
    }

    generateReviewQuestionSets() {
      const number = value => this.formatQuizNumber(value);
      const question = (prompt, options, correct, explain, funcInfo = null) => {
        const shuffled = options.map((text, index) => ({ text, correct: index === correct }));
        for (let i = shuffled.length - 1; i > 0; i -= 1) {
          const j = this.randomInt(0, i);
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return { prompt, options: shuffled.map(item => item.text), answer: shuffled.findIndex(item => item.correct), explain, funcInfo };
      };
      const level1a = this.randomInt(2, 7);
      const level1d = this.randomInt(-5, 5);
      let level1b = this.randomInt(-6, 6);
      if (2 * (-level1d) + level1b === 0) level1b += 1;
      let level2d;
      const level2a = this.randomInt(2, 6);
      const level2c = this.randomChoice([-2, -1, 1, 2]);
      let standardB;
      do {
        level2d = this.randomInt(-5, 5);
        standardB = this.randomInt(-8, 8);
      } while (standardB === level2a * level2d || -level2d === level2a / level2c);
      const holeA = this.randomInt(2, 6);
      const holeC = this.randomChoice([-1, 1]);
      let holeD = this.randomInt(-5, 5);
      while (-holeD === holeA / holeC) holeD = this.randomInt(-5, 5);
      const holeB = holeA * holeD;
      const holeX = -holeD;
      const holeY = holeA / holeC;
      const focal = this.randomChoice([6, 8, 10, 12, 14, 20]);
      const objectDistance = focal * 3;
      const imageDistance = focal * 1.5;
      const simpleVA = -level1d;
      const standardVA = -level2d;
      const standardHA = level2a / level2c;
      const simpleNumerator = this.formatLinearExpression(level1a, level1b);
      const simpleDenominator = this.formatLinearExpression(1, level1d);
      const level1SecondNumerator = this.formatLinearExpression(2, level1b);
      const standardNumerator = this.formatLinearExpression(level2a, standardB);
      const standardDenominator = this.formatLinearExpression(level2c, level2c * level2d);
      const holeNumerator = this.formatLinearExpression(holeA, holeB);
      const holeDenominator = this.formatLinearExpression(holeC, holeC * holeD);
      const sets = [
        {
          title: 'Khởi động', subtitle: 'Nhận biết tiệm cận', badge: 'CẤP 1 · ĐƠN GIẢN', questions: [
            question(
              `Cho hàm số $h(x) = \\dfrac{${simpleNumerator}}{${simpleDenominator}}$. Khi $x \\to \\pm\\infty$, giá trị $h(x)$ tiến gần đến số nào?`,
              [`$${number(level1a)}$`, `$${number(level1a + 1)}$`, `$${number(level1a - 1)}$`, `$0$`],
              0,
              `Tử và mẫu cùng có bậc $1$ nên khi $x \\to \\pm\\infty$, giới hạn bằng tỉ số hai hệ số dẫn đầu: $\\lim_{x\\to \\pm\\infty} h(x) = \\dfrac{${level1a}}{1} = ${level1a}$. Do đó tiệm cận ngang là $y = ${level1a}$.`,
              { a: level1a, b: level1b, c: 1, d: level1d, va: simpleVA, ha: level1a, expr: `h(x) = \\dfrac{${simpleNumerator}}{${simpleDenominator}}` }
            ),
            question(
              `Cho hàm số $g(x) = \\dfrac{${level1SecondNumerator}}{${simpleDenominator}}$, mẫu số triệt tiêu tại $x = ${simpleVA}$ và tử số tại đó khác $0$. Đường thẳng nào là tiệm cận đứng của đồ thị?`,
              [`$x = ${number(simpleVA)}$`, `$y = ${number(simpleVA)}$`, `$x = ${number(simpleVA !== 0 ? -simpleVA : 1)}$`, `$y = ${number(simpleVA !== 2 ? 2 : -2)}$`],
              0,
              `Nghiệm của mẫu số là $${simpleDenominator} = 0 \\iff x = ${simpleVA}$. Vì tử số tại $x = ${simpleVA}$ khác $0$ nên các giới hạn một bên là $\\lim_{x \\to ${simpleVA}^+} g(x)$ và $\\lim_{x \\to ${simpleVA}^-} g(x)$ đều bằng vô cực ($+\\infty$ hoặc $-\\infty$). Theo định nghĩa SGK Toán 12, đường thẳng $x = ${number(simpleVA)}$ là tiệm cận đứng của đồ thị.`,
              { a: 2, b: level1b, c: 1, d: level1d, va: simpleVA, ha: 2, expr: `g(x) = \\dfrac{${level1SecondNumerator}}{${simpleDenominator}}` }
            ),
            question(
              `Cho hàm số $h(x) = \\dfrac{${simpleNumerator}}{${simpleDenominator}}$, biết $\\lim_{x\\to \\pm\\infty} h(x) = ${level1a}$. Phương trình đường tiệm cận ngang của đồ thị là:`,
              [`$y = ${level1a}$`, `$x = ${level1a}$`, `$y = -${level1a}$`, `$y = x + ${level1a}$`],
              0,
              `Theo định nghĩa, nếu $\\lim_{x\\to \\pm\\infty} h(x) = L$ thì đường thẳng nằm ngang $y = L$ là tiệm cận ngang. Do đó tiệm cận ngang là đường thẳng $y = ${level1a}$.`,
              { a: level1a, b: level1b, c: 1, d: level1d, va: simpleVA, ha: level1a, expr: `h(x) = \\dfrac{${simpleNumerator}}{${simpleDenominator}}` }
            )
          ]
        },
        {
          title: 'Thợ săn tiệm cận', subtitle: 'Tìm tiệm cận và điểm khuyết', badge: 'CẤP 2 · VẬN DỤNG', questions: [
            question(
              `Cho hàm số $f(x) = \\dfrac{${standardNumerator}}{${standardDenominator}}$. Cặp đường tiệm cận đứng và tiệm cận ngang của đồ thị là:`,
              [`$x = ${number(standardVA)}$ và $y = ${number(standardHA)}$`, `$x = ${number(standardHA)}$ và $y = ${number(standardVA)}$`, `$x = ${number(-standardVA)}$ và $y = ${number(standardHA)}$`, 'Đồ thị không có tiệm cận đứng'],
              0,
              `Phương trình mẫu số $${standardDenominator} = 0 \\iff x = ${number(standardVA)}$. Tỉ số hai hệ số dẫn đầu là $\\dfrac{${level2a}}{${level2c}} = ${number(standardHA)}$. Vậy TCĐ là $x = ${number(standardVA)}$ và TCN là $y = ${number(standardHA)}$.`,
              { a: level2a, b: standardB, c: level2c, d: level2c * level2d, va: standardVA, ha: standardHA, expr: `f(x) = \\dfrac{${standardNumerator}}{${standardDenominator}}` }
            ),
            question(
              `Cho hàm số $g(x) = \\dfrac{${holeNumerator}}{${holeDenominator}}$. Nhận thấy $ad - bc = 0$ và cả tử lẫn mẫu cùng bằng $0$ tại nghiệm của mẫu. Đồ thị có điểm khuyết (lỗ thủng) tại đâu?`,
              [`$(${number(holeX)};\\, ${number(holeY)})$`, `$(${number(holeY)};\\, ${number(holeX)})$`, `$(${number(-holeX)};\\, ${number(holeY)})$`, 'Đồ thị không có điểm khuyết (có tiệm cận đứng)'],
              0,
              `Tử và mẫu có nhân tử chung $(x - ${number(holeX)})$. Rút gọn được $g(x) = ${number(holeY)}$ với mọi $x \\ne ${number(holeX)}$. Đồ thị là đường thẳng bị khoét một lỗ thủng tại điểm khuyết $(${number(holeX)};\\, ${number(holeY)})$, hoàn toàn không có tiệm cận đứng.`,
              { a: holeA, b: holeB, c: holeC, d: holeC * holeD, holeX: holeX, holeY: holeY, isHole: true, expr: `g(x) = \\dfrac{${holeNumerator}}{${holeDenominator}}` }
            ),
            question(
              `Hàm phân thức bậc nhất trên bậc nhất $f(x) = \\dfrac{${standardNumerator}}{${standardDenominator}}$ ở dạng chuẩn $(ad - bc \\ne 0, c \\ne 0)$ có đường tiệm cận xiên không?`,
              ['Không có tiệm cận xiên (chỉ có 1 TCĐ và 1 TCN)', 'Có đúng 1 tiệm cận xiên', 'Luôn có tiệm cận xiên khi $a \\ne 0$', 'Có 2 tiệm cận xiên đối xứng qua tâm $I$'],
              0,
              `Vì bậc của đa thức tử số bằng bậc của đa thức mẫu số (cùng bậc 1), giới hạn tại vô cực là hằng số hữu hạn $\\dfrac{a}{c}$, nên đồ thị hàm số chỉ có $1$ TCĐ và $1$ TCN, không có tiệm cận xiên.`,
              { a: level2a, b: standardB, c: level2c, d: level2c * level2d, va: standardVA, ha: standardHA, expr: `f(x) = \\dfrac{${standardNumerator}}{${standardDenominator}}` }
            )
          ]
        },
        {
          title: 'Kỹ sư thấu kính', subtitle: 'Ứng dụng trong quang học', badge: 'CẤP 3 · THỬ THÁCH', questions: [
            question(
              `Xét mô hình thấu kính mỏng hội tụ lý tưởng có tiêu cự $f = ${focal}\\text{ cm}$ tạo ảnh thật ($d > f$). Theo công thức quang học $d' = \\dfrac{${focal}d}{d - ${focal}}$, khi vật thật tiến gần tiêu điểm từ phía $d > ${focal}\\text{ cm}$, khoảng cách ảnh $d'$ thay đổi thế nào?`,
              [`Ảnh dịch chuyển ra vô cực ($d' \\to +\\infty$), tiệm cận đứng $d = ${focal}\\text{ cm}$`, `Ảnh tiến dần về vị trí $d' = ${focal}\\text{ cm}$`, `Ảnh tiến về sát thấu kính $d' = 0\\text{ cm}$`, `Ảnh luôn đứng yên ở khoảng cách $d' = 2${focal}\\text{ cm}$`],
              0,
              `Khi $d \\to ${focal}^+$, mẫu số $(d - ${focal}) \\to 0^+$ khiến $d' \\to +\\infty$. Đây chính là hiện tượng tiệm cận đứng trong quang học: khi vật đặt tại tiêu điểm, chùm tia ló song song và ảnh ở vô cực.`,
              { isOptics: true, focal: focal, expr: `d' = \\dfrac{${focal}d}{d - ${focal}}` }
            ),
            question(
              `Với mô hình thấu kính mỏng hội tụ lý tưởng có tiêu cự $f = ${focal}\\text{ cm}$ và công thức ảnh $d' = \\dfrac{${focal}d}{d - ${focal}}$, khi vật ở rất xa nguồn sáng ($d \\to +\\infty$), vị trí ảnh $d'$ tiến gần giá trị nào?`,
              [`$d' = ${focal}\\text{ cm}$ (tiêu diện ảnh)`, `$d' = ${number(focal / 2)}\\text{ cm}$`, `$d' = 0\\text{ cm}$`, `$d' \\to +\\infty$`],
              0,
              `Ta tính giới hạn: $\\lim_{d\\to +\\infty} d' = \\lim_{d\\to +\\infty} \\dfrac{${focal}}{1 - \\frac{${focal}}{d}} = ${focal}\\text{ cm}$. Đường thẳng nằm ngang $d' = ${focal}$ là tiệm cận ngang, nghĩa là chùm tia tới song song từ vô cực hội tụ đúng tại tiêu diện ảnh.`,
              { isOptics: true, focal: focal, expr: `d' = \\dfrac{${focal}d}{d - ${focal}}` }
            ),
            question(
              `Với mô hình thấu kính mỏng hội tụ có tiêu cự $f = ${focal}\\text{ cm}$, một vật thật đặt cách thấu kính khoảng cách $d = ${objectDistance}\\text{ cm}$ ($d > f$). Khoảng cách từ thấu kính đến ảnh thật $d'$ là:`,
              [`$d' = ${number(imageDistance)}\\text{ cm}$`, `$d' = ${number(focal)}\\text{ cm}$`, `$d' = ${number(objectDistance)}\\text{ cm}$`, `$d' = ${number(imageDistance * 2)}\\text{ cm}$`],
              0,
              `Thay số vào công thức thấu kính: $d' = \\dfrac{${focal} \\times ${objectDistance}}{${objectDistance} - ${focal}} = \\dfrac{${focal * objectDistance}}{${objectDistance - focal}} = ${number(imageDistance)}\\text{ cm}$.`,
              { isOptics: true, focal: focal, expr: `d' = \\dfrac{${focal}d}{d - ${focal}}` }
            )
          ]
        }
      ];
      return sets;
    }

    // =========================================================================
    // HOẠT ĐỘNG A: TIỆM CẬN ĐỨNG THAY ĐỔI THẾ NÀO?
    // =========================================================================
    renderActivityA(slot) {
      if (this.currentStep === 1) {
        const data = this.activityData.A;
        const denominatorBefore = this.formatLinearExpression(data.c, data.d);
        const denominatorAfter = this.formatLinearExpression(data.c, data.d + 2);
        // BƯỚC 1: DỰ ĐOÁN (KHÓA CÔNG THỨC, HỎI HỌC SINH TRƯỚC)
        slot.innerHTML = `
          <div class="prompt-card">
            <span class="prompt-badge">BƯỚC 1: DỰ ĐOÁN TRƯỚC KHI THỬ</span>
            <div class="prompt-question">
              Dựa vào định nghĩa tiệm cận đứng đã ôn, xét hàm số $f(x) = \\dfrac{${this.formatLinearExpression(data.a, data.b)}}{${denominatorBefore}}$ với $c=${data.c}$. Nếu ta <strong>tăng hệ số d</strong> từ ${data.d} lên ${data.d + 2}, tiệm cận đứng sẽ dịch chuyển về đâu?
            </div>
          </div>

          <div class="prediction-options-list">
            <div class="prediction-option-item ${this.userPredictions.A.choice === 'left' ? 'selected' : ''}" data-val="left">
              <span class="option-radio-dot"></span>
              <div>
                <div class="option-text-main">Dịch sang bên Trái (về phía giá trị âm)</div>
                <div class="option-desc">Vị trí $x_{\\text{TCĐ}}$ giảm dần sang bên trái trục số</div>
              </div>
            </div>

            <div class="prediction-option-item ${this.userPredictions.A.choice === 'right' ? 'selected' : ''}" data-val="right">
              <span class="option-radio-dot"></span>
              <div>
                <div class="option-text-main">Dịch sang bên Phải (về phía giá trị dương)</div>
                <div class="option-desc">Vị trí $x_{\\text{TCĐ}}$ tăng dần sang bên phải trục số</div>
              </div>
            </div>

            <div class="prediction-option-item ${this.userPredictions.A.choice === 'same' ? 'selected' : ''}" data-val="same">
              <span class="option-radio-dot"></span>
              <div>
                <div class="option-text-main">Không thay đổi vị trí</div>
                <div class="option-desc">Hệ số $d$ ở mẫu không làm dịch chuyển đường tiệm cận đứng</div>
              </div>
            </div>
          </div>

          <div class="prediction-reason-box">
            <label class="prediction-reason-label">Lý giải ngắn gọn suy nghĩ của bạn (tùy chọn):</label>
            <textarea id="pred-a-reason" class="prediction-reason-input" placeholder="Ví dụ: Vì tiệm cận đứng liên quan đến mẫu số...">${this.escapeHtml(this.userPredictions.A.reason || '')}</textarea>
          </div>

          <button id="btn-submit-pred-a" class="btn-action-primary">
            <span>Ghi nhận dự đoán ➔ Bắt đầu Thử nghiệm</span>
          </button>
        `;

        slot.querySelectorAll('.prediction-option-item').forEach(item => {
          item.addEventListener('click', () => {
            slot.querySelectorAll('.prediction-option-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            this.userPredictions.A.choice = item.dataset.val;
          });
        });

        document.getElementById('btn-submit-pred-a').addEventListener('click', () => {
          if (!this.userPredictions.A.choice) {
            alert('Hãy chọn một đáp án dự đoán trước khi tiếp tục!');
            return;
          }
          this.userPredictions.A.reason = document.getElementById('pred-a-reason').value;
          this.switchStep(2);
        });

      } else if (this.currentStep === 2) {
        // BƯỚC 2: THỬ NGHIỆM (CHỈ CHỈNH d, KIỂM CHỨNG CẢ c > 0 VÀ c < 0)
        const isCPositive = (this.rf.c > 0);
        const isMobile = window.innerWidth <= 767;
        const mobileSlot = document.getElementById('mobile-step2-slot');
        const activeTarget = (isMobile && mobileSlot) ? mobileSlot : slot;
        if (isMobile && mobileSlot) {
          slot.innerHTML = '';
        }

        activeTarget.innerHTML = `
          <div class="prompt-card">
            <span class="prompt-badge">BƯỚC 2: THỬ NGHIỆM HỆ SỐ d</span>
            <div class="prompt-question">
              Kéo thanh trượt để <strong>tăng/giảm hệ số d</strong> và quan sát trực tiếp đường nét đứt màu đỏ cam trên đồ thị.
            </div>
          </div>

          <div class="slider-control-card">
            <div class="slider-header-row">
              <span class="slider-title">Hệ số đang thử: <strong>d</strong></span>
              <span class="slider-value-badge" id="val-badge-d">d = ${this.rf.d}</span>
            </div>

            <div class="slider-input-group">
              <button class="btn-step-slider" id="btn-minus-d">−</button>
              <input type="range" class="lab-range-slider" id="range-d" min="-6" max="6" step="1" value="${Math.round(this.rf.d)}">
              <button class="btn-step-slider" id="btn-plus-d">+</button>
            </div>

            <div class="live-observation-pill" id="live-obs-d">
              Vị trí Tiệm cận đứng hiện tại: <strong style="color: var(--color-tcd);">$x = ${this.rf.vaX !== null ? this.rf.vaX.toFixed(2) : 'N/A'}$</strong><br>
              <span style="font-size: 12px; color: var(--text-muted);">
                (Đang thử trường hợp: <strong>c = ${this.rf.c} ${isCPositive ? '> 0' : '< 0'}</strong>. Khi $d$ tăng, đường TCĐ dịch sang <strong>${isCPositive ? 'TRÁI' : 'PHẢI'}</strong>)
              </span>
            </div>
          </div>

          <!-- THỬ NGHIỆM ĐẢO DẤU C -->
          <div style="background: var(--bg-surface-elevated); padding: 12px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 10px;">
            🔍 <strong>Kiểm chứng quy tắc đảo chiều khi c đổi dấu:</strong>
            <div style="margin-top: 6px; display: flex; gap: 8px;">
              <button id="btn-set-c-pos" class="btn-action-secondary" style="font-size: 12px; padding: 6px 10px; ${isCPositive ? 'border-color: var(--primary); font-weight:700;' : ''}">
                1. Thử c = 1 > 0 (Dịch Trái)
              </button>
              <button id="btn-set-c-neg" class="btn-action-secondary" style="font-size: 12px; padding: 6px 10px; ${!isCPositive ? 'border-color: var(--primary); font-weight:700;' : ''}">
                2. Thử c = -1 < 0 (Dịch Phải)
              </button>
            </div>
          </div>

          <div style="display: flex; gap: 10px;">
            <button id="btn-back-step" class="btn-action-secondary" style="flex: 1;">⬅ Quay lại</button>
            <button id="btn-goto-step3" class="btn-action-primary" style="flex: 2;">Sang Bước 3: Quan sát Giới hạn ➔</button>
          </div>
        `;

        const updateD = (newD) => {
          let dVal = Math.round(Number(newD));
          // Đảm bảo nghiêm ngặt điều kiện ad - bc != 0 của phiếu Nhóm 4
          if (Math.abs(this.rf.a * dVal - this.rf.b * this.rf.c) < 1e-6) {
            dVal = dVal >= 0 ? dVal + 1 : dVal - 1;
          }
          this.rf.d = dVal;
          const rangeEl = document.getElementById('range-d');
          if (rangeEl) rangeEl.value = dVal;
          const badgeEl = document.getElementById('val-badge-d');
          if (badgeEl) badgeEl.textContent = `d = ${this.rf.d}`;
          
          const obsEl = document.getElementById('live-obs-d');
          if (obsEl) {
            const va = this.rf.vaX;
            const pos = this.rf.c > 0;
            obsEl.innerHTML = `Vị trí Tiệm cận đứng hiện tại: <strong style="color: var(--color-tcd);">$x = ${va !== null ? va.toFixed(2) : 'N/A'}$</strong><br><span style="font-size: 12px; color: var(--text-muted);">(Đang thử trường hợp: <strong>c = ${this.rf.c} ${pos ? '> 0' : '< 0'}</strong>. Khi $d$ tăng, đường TCĐ dịch sang <strong>${pos ? 'TRÁI' : 'PHẢI'}</strong>)</span>`;
            this.renderMath(obsEl);
          }
          
          this.graphEngine.setFunction(this.rf);
          this.updateFormulaText();
        };

        const rangeD = document.getElementById('range-d');
        if (rangeD) rangeD.addEventListener('input', (e) => updateD(e.target.value));

        const btnMinusD = document.getElementById('btn-minus-d');
        if (btnMinusD) btnMinusD.addEventListener('click', () => {
          const r = document.getElementById('range-d');
          updateD(Math.max(-6, Number(r ? r.value : 0) - 1));
        });

        const btnPlusD = document.getElementById('btn-plus-d');
        if (btnPlusD) btnPlusD.addEventListener('click', () => {
          const r = document.getElementById('range-d');
          updateD(Math.min(6, Number(r ? r.value : 0) + 1));
        });

        const btnSetCPos = document.getElementById('btn-set-c-pos');
        if (btnSetCPos) btnSetCPos.addEventListener('click', () => {
          this.rf.c = 1;
          this.switchStep(2);
        });

        const btnSetCNeg = document.getElementById('btn-set-c-neg');
        if (btnSetCNeg) btnSetCNeg.addEventListener('click', () => {
          this.rf.c = -1;
          this.switchStep(2);
        });

        const btnBackStep = document.getElementById('btn-back-step');
        if (btnBackStep) btnBackStep.addEventListener('click', () => this.switchStep(1));

        const btnGotoStep3 = document.getElementById('btn-goto-step3');
        if (btnGotoStep3) btnGotoStep3.addEventListener('click', () => this.switchStep(3));

        this.renderMath(activeTarget);

      } else if (this.currentStep === 3) {
        // BƯỚC 3: QUAN SÁT GIỚI HẠN GẦN TCĐ (BẢNG DÃY SỐ CỤ THỂ)
        // Guard clause: Đảm bảo có TCĐ hợp lệ (luôn thỏa mãn c != 0, ad - bc != 0)
        if (this.rf.vaX === null) {
          this.rf.d = 3;
          this.graphEngine.setFunction(this.rf);
        }
        const x0 = this.rf.vaX;

        // Bảng dãy số theo cách trình bày SGK: x tiến dần đến x0
        // từ mỗi phía, hàng thứ hai ghi các giá trị hàm tương ứng.
        const leftXs = [x0 - 0.1, x0 - 0.01, x0 - 0.001];
        const rightXs = [x0 + 0.1, x0 + 0.01, x0 + 0.001];
        const leftYs = leftXs.map(x => this.rf.evaluate(x));
        const rightYs = rightXs.map(x => this.rf.evaluate(x));
        const formatTableNumber = value => value === null ? 'Không xác định' : String(Number(value.toFixed(3)));
        const signLeft = (leftYs[2] !== null && leftYs[2] > 0) ? '+\\infty' : '-\\infty';
        const signRight = (rightYs[2] !== null && rightYs[2] > 0) ? '+\\infty' : '-\\infty';
        const directionLeft = leftYs[2] > 0 ? 'dương vô cùng (+∞)' : 'âm vô cùng (-∞)';
        const directionRight = rightYs[2] > 0 ? 'dương vô cùng (+∞)' : 'âm vô cùng (-∞)';
        slot.innerHTML = `
          <div class="prompt-card">
            <span class="prompt-badge">BƯỚC 3: KHI x TIẾN GẦN ĐƯỜNG TCĐ</span>
            <div class="prompt-question">
              Hãy cho $x$ tiến gần vị trí đường đứng màu đỏ từ bên trái hoặc bên phải qua. Quan sát: điểm $M$ chạy về bên nào và giá trị $f(x)$ lớn dần theo chiều nào?
            </div>
            <p style="margin:8px 0 0; color:var(--text-muted); font-size:12.5px;">Nói đơn giản, ta chọn các giá trị $x$ ngày càng sát đường tiệm cận đứng rồi xem độ cao $f(x)$ thay đổi ra sao. Bảng dưới đây ghi lại các lần thử đó.</p>
          </div>

          <div class="limit-tracker-card">
            <div style="font-size: 13px; font-weight: 700; color: var(--color-tcd); margin-bottom: 4px;">
              BẢNG GIÁ TRỊ CỦA HÀM SỐ KHI $x$ TIẾN GẦN $x_0$:
            </div>

            <div class="textbook-limit-grid">
              <div class="textbook-limit-table-wrap">
                <table class="textbook-limit-table">
                  <caption>Từ bên trái: $x \\to x_0^-$</caption>
                  <thead><tr><th>$x$</th>${leftXs.map(x => '<th>' + formatTableNumber(x) + '</th>').join('')}</tr></thead>
                  <tbody><tr><th>$f(x)$</th>${leftYs.map(y => '<td>' + formatTableNumber(y) + '</td>').join('')}</tr></tbody>
                </table>
              </div>
              <div class="textbook-limit-table-wrap">
                <table class="textbook-limit-table">
                  <caption>Từ bên phải: $x \\to x_0^+$</caption>
                  <thead><tr><th>$x$</th>${rightXs.map(x => '<th>' + formatTableNumber(x) + '</th>').join('')}</tr></thead>
                  <tbody><tr><th>$f(x)$</th>${rightYs.map(y => '<td>' + formatTableNumber(y) + '</td>').join('')}</tr></tbody>
                </table>
              </div>
            </div>

            <div class="limit-conclusion-card">
              <p class="limit-conclusion-text">Có thể dễ dàng nhận thấy: khi khoảng cách từ $x$ đến $x_0$ giảm dần từ $0{,}1$ xuống $0{,}01$ rồi $0{,}001$, các giá trị $f(x)$ tăng hoặc giảm không giới hạn. Từ bảng số liệu, ta kết luận:</p>
              <strong class="limit-conclusion-title">Kết luận theo lý thuyết</strong>
              <div class="limit-conclusion-formulas">
                <div class="limit-conclusion-equation">
                  <span>Khi $x$ tiến đến $x_0$ từ bên trái</span>
                  <div>\\[\\lim_{x\\to x_0^-}f(x)=${signLeft}\\]</div>
                  <small>Giá trị hàm số tiến về ${directionLeft}.</small>
                </div>
                <div class="limit-conclusion-equation">
                  <span>Khi $x$ tiến đến $x_0$ từ bên phải</span>
                  <div>\\[\\lim_{x\\to x_0^+}f(x)=${signRight}\\]</div>
                  <small>Giá trị hàm số tiến về ${directionRight}.</small>
                </div>
              </div>
            </div>
            <div style="margin-top: 10px;">
              <label style="display:block; font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom:8px;">Kéo thử hoành độ $x$ (Điểm M tự động nhảy đúng trên đồ thị):</label>
              <input type="range" class="lab-range-slider" id="obs-range-x" style="display:block; width:100%;" min="${x0 - 4}" max="${x0 + 4}" step="0.05" value="${this.graphEngine.pointX}">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 4px;">
                <span>Điểm M: $x =$ <strong id="tel-x">${this.graphEngine.pointX.toFixed(2)}</strong></span>
                <span>$f(x) =$ <strong id="tel-fx" style="color: var(--color-curve);">${(this.rf.evaluate(this.graphEngine.pointX) || 0).toFixed(2)}</strong></span>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 10px;">
            <button id="btn-back-step2" class="btn-action-secondary" style="flex: 1;">⬅ Thử nghiệm lại</button>
            <button id="btn-goto-step4" class="btn-action-primary" style="flex: 2;">Xem Giải thích & Công thức ➔</button>
          </div>
        `;

        const xRange = document.getElementById('obs-range-x');
        xRange.addEventListener('input', (e) => {
          const newX = Number(e.target.value);
          this.graphEngine.setPointX(newX);
          this.updateTelemetryValues(newX);
        });

        document.getElementById('btn-back-step2').addEventListener('click', () => this.switchStep(2));
        document.getElementById('btn-goto-step4').addEventListener('click', () => this.switchStep(4));

      } else if (this.currentStep === 4) {
        // BƯỚC 4: GIẢI THÍCH BẢN CHẤT BẰNG GIỚI HẠN
        const userChoice = this.userPredictions.A.choice;
        const data = this.activityData.A;
        const isCPositive = data.c > 0;
        const isCorrect = userChoice === (isCPositive ? 'left' : 'right');
        const oldX0 = -data.d / data.c;
        const newX0 = -(data.d + 2) / data.c;
        const denominatorBefore = this.formatLinearExpression(data.c, data.d);
        const denominatorAfter = this.formatLinearExpression(data.c, data.d + 2);

        slot.innerHTML = `
          <div class="explanation-synthesis-card">
            <!-- ĐỐI CHIẾU DỰ ĐOÁN BAN ĐẦU -->
            <div class="prediction-review-banner ${isCorrect ? 'correct' : 'incorrect'}">
              <span style="font-size: 20px;">${isCorrect ? '✓' : '💡'}</span>
              <div>
                <strong>${isCorrect ? 'Dự đoán của bạn hoàn toàn chính xác!' : 'Nhìn lại dự đoán ban đầu của bạn:'}</strong>
                <div>Bạn đã chọn: <em>"${userChoice === 'left' ? 'Dịch sang bên Trái' : userChoice === 'right' ? 'Dịch sang bên Phải' : 'Không thay đổi'}"</em></div>
              </div>
            </div>

            <div class="limit-proof-card">
              <h3>VÌ SAO TIỆM CẬN ĐỨNG DI CHUYỂN?</h3>
              <p>Tiệm cận đứng nằm tại nghiệm của mẫu số. Khi tăng \\(d\\) từ \\(${data.d}\\) lên \\(${data.d + 2}\\), ta có:</p>
              <div class="limit-proof-equations">
                <div>\\[${denominatorBefore}=0\\quad\\Rightarrow\\quad x=${oldX0}\\]</div>
                <div>\\[${denominatorAfter}=0\\quad\\Rightarrow\\quad x=${newX0}\\]</div>
              </div>
              <p>${isCPositive ? 'Vì c > 0, vị trí đổi từ ' + oldX0 + ' sang ' + newX0 + ', tức dịch sang trái.' : 'Vì c < 0, vị trí đổi từ ' + oldX0 + ' sang ' + newX0 + ', tức dịch sang phải.'}</p>
              <p><strong>Vì sao đó là tiệm cận đứng?</strong> Tại vị trí này, mẫu số tiến sát \\(0\\) còn tử số khác \\(0\\), nên \\(f(x)\\) tăng hoặc giảm không giới hạn khi \\(x\\) tiến đến đó. Đường thẳng đứng qua vị trí ấy là tiệm cận đứng.</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button id="btn-next-activity-b" class="btn-action-primary">
                <span>Tiến hành Hoạt động B: Tiệm cận ngang ➔</span>
              </button>
              <button id="btn-replay-a" class="btn-action-secondary">
                🔄 Tạo bộ số mới cho Hoạt động A
              </button>
            </div>
          </div>
        `;

        document.getElementById('btn-next-activity-b').addEventListener('click', () => {
          this.switchActivity('B');
        });

        document.getElementById('btn-replay-a').addEventListener('click', () => {
          this.switchActivity('A');
        });
      }
    }

    // =========================================================================
    // HOẠT ĐỘNG B: TIỆM CẬN NGANG THAY ĐỔI THẾ NÀO?
    // =========================================================================
    renderActivityB(slot) {
      if (this.currentStep === 1) {
        const data = this.activityData.B;
        const numeratorBefore = this.formatLinearExpression(data.a, data.b);
        const denominator = this.formatLinearExpression(data.c, data.d);
        const tcnDirection = data.c > 0 ? 'lên cao hơn' : 'hạ xuống thấp hơn';
        // BƯỚC 1: DỰ ĐOÁN
        slot.innerHTML = `
          <div class="prompt-card">
            <span class="prompt-badge">BƯỚC 1: DỰ ĐOÁN TIỆM CẬN NGANG</span>
            <div class="prompt-question">
              Xét hàm số $f(x) = \\dfrac{${numeratorBefore}}{${denominator}}$ với $c=${data.c}$. Nếu tăng $a$ từ ${data.a} lên ${data.a + 2}, đường tiệm cận ngang sẽ dịch chuyển ra sao, và tiệm cận đứng có bị ảnh hưởng không?
            </div>
          </div>

          <div class="prediction-options-list">
            <div class="prediction-option-item ${this.userPredictions.B.choice === 'tcn_up_tcd_same' ? 'selected' : ''}" data-val="tcn_up_tcd_same">
              <span class="option-radio-dot"></span>
              <div>
                <div class="option-text-main">TCN ${tcnDirection}; TCĐ giữ nguyên vị trí</div>
                <div class="option-desc">Đường ngang thay đổi theo a; đường đứng $x = ${-data.d / data.c}$ không xê dịch</div>
              </div>
            </div>

            <div class="prediction-option-item ${this.userPredictions.B.choice === 'both_move' ? 'selected' : ''}" data-val="both_move">
              <span class="option-radio-dot"></span>
              <div>
                <div class="option-text-main">Cả TCN và TCĐ đều bị dịch chuyển</div>
                <div class="option-desc">Thay đổi a tác động tới cả hai đường tiệm cận</div>
              </div>
            </div>

            <div class="prediction-option-item ${this.userPredictions.B.choice === 'tcd_move_tcn_same' ? 'selected' : ''}" data-val="tcd_move_tcn_same">
              <span class="option-radio-dot"></span>
              <div>
                <div class="option-text-main">TCĐ bị dịch chuyển; TCN giữ nguyên</div>
                <div class="option-desc">Đường ngang không đổi, chỉ có đường đứng thay đổi</div>
              </div>
            </div>
          </div>

          <button id="btn-submit-pred-b" class="btn-action-primary">
            <span>Ghi nhận dự đoán ➔ Bắt đầu Thử nghiệm</span>
          </button>
        `;

        slot.querySelectorAll('.prediction-option-item').forEach(item => {
          item.addEventListener('click', () => {
            slot.querySelectorAll('.prediction-option-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            this.userPredictions.B.choice = item.dataset.val;
          });
        });

        document.getElementById('btn-submit-pred-b').addEventListener('click', () => {
          if (!this.userPredictions.B.choice) {
            alert('Hãy chọn một đáp án dự đoán trước khi tiếp tục!');
            return;
          }
          this.switchStep(2);
        });

      } else if (this.currentStep === 2) {
        // BƯỚC 2: THỬ NGHIỆM a
        const isMobile = window.innerWidth <= 767;
        const mobileSlot = document.getElementById('mobile-step2-slot');
        const activeTarget = (isMobile && mobileSlot) ? mobileSlot : slot;
        if (isMobile && mobileSlot) {
          slot.innerHTML = '';
        }

        const isCPositive = this.rf.c > 0;
        const tcnShiftDirection = isCPositive ? 'LÊN TRÊN (y tăng)' : 'XUỐNG DƯỚI (y giảm)';

        activeTarget.innerHTML = `
          <div class="prompt-card">
            <span class="prompt-badge">BƯỚC 2: THỬ NGHIỆM HỆ SỐ a</span>
            <div class="prompt-question">
              Kéo thanh trượt để <strong>tăng/giảm hệ số a</strong>. Quan sát sự dịch chuyển của đường nét đứt màu xanh ngọc so với đường màu đỏ cam.
            </div>
          </div>

          <div class="slider-control-card">
            <div class="slider-header-row">
              <span class="slider-title">Hệ số đang thử: <strong>a</strong></span>
              <span class="slider-value-badge" id="val-badge-a" style="background: var(--color-tcn-soft); color: var(--color-tcn); border-color: var(--color-tcn);">a = ${this.rf.a}</span>
            </div>

            <div class="slider-input-group">
              <button class="btn-step-slider" id="btn-minus-a">−</button>
              <input type="range" class="lab-range-slider" id="range-a" min="-5" max="5" step="0.5" value="${this.rf.a}">
              <button class="btn-step-slider" id="btn-plus-a">+</button>
            </div>

            <div class="live-observation-pill" id="live-obs-a">
              • Tiệm cận ngang hiện tại: <strong style="color: var(--color-tcn);">$y = ${this.rf.haY.toFixed(2)}$</strong><br>
              <span style="font-size: 12px; color: var(--text-muted);">
                (Đang thử trường hợp: <strong>c = ${this.rf.c} ${isCPositive ? '> 0' : '< 0'}</strong>. Khi $a$ tăng, đường TCN dịch <strong>${isCPositive ? 'LÊN TRÊN' : 'XUỐNG DƯỚI'}</strong>)
              </span><br>
              • Tiệm cận đứng hiện tại: <strong style="color: var(--color-tcd);">$x = ${this.rf.vaX.toFixed(2)}$</strong> (Đứng yên bất biến!)
            </div>
          </div>

          <!-- THỬ NGHIỆM ĐẢO DẤU C CHO TCN -->
          <div style="background: var(--bg-surface-elevated); padding: 12px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 10px;">
            🔍 <strong>Kiểm chứng quy tắc đảo chiều khi c đổi dấu:</strong>
            <div style="margin-top: 6px; display: flex; gap: 8px;">
              <button id="btn-set-c-pos-b" class="btn-action-secondary" style="font-size: 12px; padding: 6px 10px; ${isCPositive ? 'border-color: var(--primary); font-weight:700;' : ''}">
                1. Thử c = 1 > 0 (Dịch Lên)
              </button>
              <button id="btn-set-c-neg-b" class="btn-action-secondary" style="font-size: 12px; padding: 6px 10px; ${!isCPositive ? 'border-color: var(--primary); font-weight:700;' : ''}">
                2. Thử c = -1 < 0 (Dịch Xuống)
              </button>
            </div>
          </div>

          <div style="display: flex; gap: 10px;">
            <button id="btn-back-step-b1" class="btn-action-secondary" style="flex: 1;">⬅ Quay lại</button>
            <button id="btn-goto-step-b3" class="btn-action-primary" style="flex: 2;">Sang Bước 3: Quan sát Giới hạn Vô cực ➔</button>
          </div>
        `;

        const updateA = (newA) => {
          let aVal = Number(newA);
          if (Math.abs(aVal * this.rf.d - this.rf.b * this.rf.c) < 1e-8) {
            aVal += aVal >= this.rf.a ? 0.5 : -0.5;
            if (aVal < -5) aVal += 1;
            if (aVal > 5) aVal -= 1;
          }
          this.rf.a = aVal;
          const rangeEl = document.getElementById('range-a');
          if (rangeEl) rangeEl.value = aVal;
          const badgeEl = document.getElementById('val-badge-a');
          if (badgeEl) badgeEl.textContent = `a = ${this.rf.a}`;
          
          const obsEl = document.getElementById('live-obs-a');
          if (obsEl) {
            const isPos = this.rf.c > 0;
            obsEl.innerHTML = `• Tiệm cận ngang hiện tại: <strong style="color: var(--color-tcn);">$y = ${this.rf.haY.toFixed(2)}$</strong><br><span style="font-size: 12px; color: var(--text-muted);">(Đang thử trường hợp: <strong>c = ${this.rf.c} ${isPos ? '> 0' : '< 0'}</strong>. Khi $a$ tăng, đường TCN dịch <strong>${isPos ? 'LÊN TRÊN' : 'XUỐNG DƯỚI'}</strong>)</span><br>• Tiệm cận đứng hiện tại: <strong style="color: var(--color-tcd);">$x = ${this.rf.vaX.toFixed(2)}$</strong> (Đứng yên bất biến!)`;
            this.renderMath(obsEl);
          }
          
          this.graphEngine.setFunction(this.rf);
          this.updateFormulaText();
        };

        const rangeA = document.getElementById('range-a');
        if (rangeA) rangeA.addEventListener('input', (e) => updateA(e.target.value));

        const btnMinusA = document.getElementById('btn-minus-a');
        if (btnMinusA) btnMinusA.addEventListener('click', () => {
          const r = document.getElementById('range-a');
          updateA(Math.max(-5, Number(r ? r.value : 0) - 0.5));
        });

        const btnPlusA = document.getElementById('btn-plus-a');
        if (btnPlusA) btnPlusA.addEventListener('click', () => {
          const r = document.getElementById('range-a');
          updateA(Math.min(5, Number(r ? r.value : 0) + 0.5));
        });

        const btnSetCPosB = document.getElementById('btn-set-c-pos-b');
        if (btnSetCPosB) btnSetCPosB.addEventListener('click', () => {
          this.rf.c = 1;
          this.switchStep(2);
        });

        const btnSetCNegB = document.getElementById('btn-set-c-neg-b');
        if (btnSetCNegB) btnSetCNegB.addEventListener('click', () => {
          this.rf.c = -1;
          this.switchStep(2);
        });

        const btnBackB1 = document.getElementById('btn-back-step-b1');
        if (btnBackB1) btnBackB1.addEventListener('click', () => this.switchStep(1));

        const btnGotoB3 = document.getElementById('btn-goto-step-b3');
        if (btnGotoB3) btnGotoB3.addEventListener('click', () => this.switchStep(3));

        this.renderMath(activeTarget);

      } else if (this.currentStep === 3) {
        // BƯỚC 3: QUAN SÁT GIỚI HẠN VÔ CỰC (BẢNG DÃY SỐ)
        const haY = this.rf.haY;
        const positiveXs = [10, 100, 1000];
        const negativeXs = [-10, -100, -1000];
        const positiveYs = positiveXs.map(x => this.rf.evaluate(x));
        const negativeYs = negativeXs.map(x => this.rf.evaluate(x));
        const formatHorizontalValue = value => value === null ? 'Không xác định' : Number(value.toFixed(4)).toString();
        slot.innerHTML = `
          <div class="prompt-card">
            <span class="prompt-badge">BƯỚC 3: QUAN SÁT KHI x TIẾN RA VÔ CỰC</span>
            <div class="prompt-question">
              Quan sát riêng hai dãy: khi cho x tiến về vô cùng bên trái hoặc bên phải. Xem các giá trị $f(x)$ tiến gần đến số nào. Bảng dưới đây ghi nhận sự thay đổi đó.
            </div>
          </div>

          <div class="limit-tracker-card">
            <div style="font-size: 13px; font-weight: 700; color: var(--color-tcn); margin-bottom: 4px;">
              BẢNG GIÁ TRỊ CỦA HÀM SỐ:
            </div>

            <div class="textbook-limit-grid">
              <div class="textbook-limit-table-wrap">
                <table class="textbook-limit-table">
                  <caption>Khi $x$ tiến tới $+\\infty$</caption>
                  <thead><tr><th>$x$</th>${positiveXs.map(x => '<th>' + x + '</th>').join('')}</tr></thead>
                  <tbody><tr><th>$f(x)$</th>${positiveYs.map(y => '<td>' + formatHorizontalValue(y) + '</td>').join('')}</tr></tbody>
                </table>
              </div>
              <div class="textbook-limit-table-wrap">
                <table class="textbook-limit-table">
                  <caption>Khi $x$ tiến tới $-\\infty$</caption>
                  <thead><tr><th>$x$</th>${negativeXs.map(x => '<th>' + x + '</th>').join('')}</tr></thead>
                  <tbody><tr><th>$f(x)$</th>${negativeYs.map(y => '<td>' + formatHorizontalValue(y) + '</td>').join('')}</tr></tbody>
                </table>
              </div>
            </div>

            <div style="font-size: 12.5px; color: var(--text-main); margin-top: 8px; padding: 10px; border-left: 3px solid var(--color-tcn); background: rgba(16, 185, 129, 0.06); border-radius: 6px;">
              Có thể dễ dàng nhận thấy: khi $x$ đi xa dần về bên phải hoặc bên trái, các giá trị $f(x)$ trong mỗi bảng tiến gần đến $L=${haY.toFixed(2)}$. Từ bảng số liệu, ta kết luận:<br>
              • $\\lim_{x\\to+\\infty}f(x)=${haY.toFixed(2)}$ và $\\lim_{x\\to-\\infty}f(x)=${haY.toFixed(2)}$.<br>
              Vì vậy, đường thẳng $y=${haY.toFixed(2)}$ là tiệm cận ngang của đồ thị.
            </div>
          </div>

          <div style="display: flex; gap: 10px;">
            <button id="btn-back-step-b2" class="btn-action-secondary" style="flex: 1;">⬅ Thử nghiệm lại</button>
            <button id="btn-goto-step-b4" class="btn-action-primary" style="flex: 2;">Xem Giải thích & Công thức ➔</button>
          </div>
        `;

        document.getElementById('btn-back-step-b2').addEventListener('click', () => this.switchStep(2));
        document.getElementById('btn-goto-step-b4').addEventListener('click', () => this.switchStep(4));

      } else if (this.currentStep === 4) {
        // BƯỚC 4: GIẢI THÍCH TCN
        const data = this.activityData.B;
        const userChoice = this.userPredictions.B.choice;
        const isCorrect = (userChoice === 'tcn_up_tcd_same');
        const oldHA = data.a / data.c;
        const newHA = (data.a + 2) / data.c;
        const movementText = data.c > 0 ? 'dịch lên trên' : 'dịch xuống dưới';
        const verticalX = -data.d / data.c;

        slot.innerHTML = `
          <div class="explanation-synthesis-card">
            <!-- ĐỐI CHIẾU DỰ ĐOÁN -->
            <div class="prediction-review-banner ${isCorrect ? 'correct' : 'incorrect'}">
              <span style="font-size: 20px;">${isCorrect ? '✓' : '💡'}</span>
              <div>
                <strong>${isCorrect ? 'Tuyệt vời! Dự đoán của bạn chính xác!' : 'Nhìn lại dự đoán ban đầu:'}</strong>
                <div>Bạn đã chọn: <em>"${userChoice === 'tcn_up_tcd_same' ? `TCN ${movementText}; TCĐ giữ nguyên` : userChoice === 'both_move' ? 'Cả hai đường cùng đổi' : 'TCĐ đổi; TCN giữ nguyên'}"</em></div>
              </div>
            </div>

            <!-- CÔNG THỨC TOÁN HỌC -->
            <div class="formula-highlight-box">
              <div style="font-size: 13px; font-weight: 700; color: var(--color-tcn); margin-bottom: 6px;">CÔNG THỨC TIỆM CẬN NGANG (SGK TOÁN 12)</div>
              <div>\\[ y_{\\text{TCN}} = \\lim_{x\\to\\pm\\infty} \\dfrac{ax + b}{cx + d} = \\dfrac{a}{c} \\]</div>
              <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 4px;">(Tỉ số giữa hệ số bậc cao nhất của tử và mẫu)</div>
            </div>

            <div class="explanation-detail-text">
              <p><strong>Bản chất toán học:</strong> Khi $x$ tiến ra xa vô cực, chia cả tử và mẫu cho $x$ (với $x \\ne 0$). Khi đó, các số hạng chứa $1/x$ tiến về $0$:</p>
              <div class="limit-proof-equations">
                <div>\\[\\lim_{x\\to+\\infty}\\frac{ax+b}{cx+d}=\\lim_{x\\to+\\infty}\\frac{a+\\frac{b}{x}}{c+\\frac{d}{x}}=\\frac{a}{c}\\]</div>
                <div>\\[\\lim_{x\\to-\\infty}\\frac{ax+b}{cx+d}=\\lim_{x\\to-\\infty}\\frac{a+\\frac{b}{x}}{c+\\frac{d}{x}}=\\frac{a}{c}\\]</div>
              </div>
              <p>Vì $\\frac{b}{x}\\to0$ và $\\frac{d}{x}\\to0$, giá trị phân thức tiến gần đến $\\frac{a}{c}$. Do đó, đường thẳng $y=\\frac{a}{c}$ là tiệm cận ngang.</p>
              <p>Trong câu này, tiệm cận ngang đổi từ $y=${oldHA}$ sang $y=${newHA}$, tức ${movementText}. Tiệm cận đứng vẫn là $x=${verticalX}$ vì nghiệm của mẫu số không đổi khi chỉ thay hệ số a.</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button id="btn-next-final-challenge" class="btn-action-primary">
                <span>Tiến hành Thử thách cuối: Dự đoán với hàm mới ➔</span>
              </button>
              <button id="btn-replay-b" class="btn-action-secondary">🔄 Tạo bộ số mới cho Hoạt động B</button>
            </div>
          </div>
        `;

        document.getElementById('btn-next-final-challenge').addEventListener('click', () => {
          this.switchActivity('final');
        });
        document.getElementById('btn-replay-b').addEventListener('click', () => this.switchActivity('B'));
      }
    }

    // =========================================================================
    // HOẠT ĐỘNG KIỂM TRA CUỐI: DỰ ĐOÁN VỚI HÀM SỐ MỚI
    // =========================================================================
    renderFinalChallenge(slot) {
      const cd = this.challengeData;
      const numerator = this.formatLinearExpression(cd.a, cd.b);
      const denominator = this.formatLinearExpression(cd.c, cd.d);

      // Danh sách 3 phương pháp cho TCĐ và TCN
      const vaMethods = [
        { value: 'den_zero', label: 'Giải phương trình mẫu số: cx + d = 0' },
        { value: 'num_zero', label: 'Giải phương trình tử số: ax + b = 0' },
        { value: 'diff', label: 'Lấy tử trừ mẫu' }
      ];

      const haMethods = [
        { value: 'ratio_high', label: 'Lấy tỉ số bậc cao nhất: a / c' },
        { value: 'ratio_const', label: 'Lấy tỉ số số hạng tự do: b / d' },
        { value: 'sum', label: 'Lấy a + c' }
      ];

      // Random hóa thứ tự xuất hiện của 3 cách chọn tại các lần khác nhau
      const shuffledVa = this.shuffleArray(vaMethods);
      const shuffledHa = this.shuffleArray(haMethods);

      const valVA = this.challengeInputs ? (this.challengeInputs.rawVA || this.challengeInputs.va) : '';
      const valHA = this.challengeInputs ? (this.challengeInputs.rawHA || this.challengeInputs.ha) : '';
      const selectedMethodVA = this.challengeInputs ? this.challengeInputs.methodVA : '';
      const selectedMethodHA = this.challengeInputs ? this.challengeInputs.methodHA : '';

      slot.innerHTML = `
        <div class="challenge-card">
          <div class="prompt-card">
            <span class="prompt-badge">THỬ THÁCH CUỐI: DỰ ĐOÁN VỚI HÀM MỚI</span>
            <div class="prompt-question">
              Đồ thị bên trái đang bị khóa. Hãy tính toán và dự đoán 2 tiệm cận của hàm số dưới đây trước khi mở khóa!
            </div>
          </div>

          <div style="background: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-md); text-align: center; font-size: 18px; font-weight: 700;">
            \\[ f(x) = \\dfrac{${numerator}}{${denominator}} \\]
          </div>

          <div class="challenge-inputs-row">
            <div class="challenge-input-field">
              <label style="color: var(--color-tcd); font-weight: 700;">Tiệm cận đứng (x = ?):</label>
              <div class="input-with-keypad-wrap">
                <input type="text" id="inp-chall-va" class="math-keypad-input" data-label="Tiệm cận đứng (x)" placeholder="Nhập giá trị x (ví dụ: -2, 3/2, √4)..." value="${this.escapeHtml(valVA)}" autocomplete="off">
                <button type="button" class="btn-keypad-trigger" data-target="inp-chall-va" title="Mở bàn phím toán học">⌨️</button>
              </div>
            </div>

            <div class="challenge-input-field">
              <label style="color: var(--color-tcn); font-weight: 700;">Tiệm cận ngang (y = ?):</label>
              <div class="input-with-keypad-wrap">
                <input type="text" id="inp-chall-ha" class="math-keypad-input" data-label="Tiệm cận ngang (y)" placeholder="Nhập giá trị y (ví dụ: 1, -0.5, 3/2)..." value="${this.escapeHtml(valHA)}" autocomplete="off">
                <button type="button" class="btn-keypad-trigger" data-target="inp-chall-ha" title="Mở bàn phím toán học">⌨️</button>
              </div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label style="font-size: 12.5px; font-weight: 700;">Phương pháp tìm Tiệm cận đứng:</label>
            <select id="sel-chall-method-va" class="challenge-select-field" style="padding: 9px 12px; border-radius: var(--radius-sm); border: 1.5px solid var(--border-card); background: var(--bg-surface); color: var(--text-main); font-size: 13px;">
              <option value="" disabled ${!selectedMethodVA ? 'selected' : ''}>-- Chọn phương pháp tìm Tiệm cận đứng --</option>
              ${shuffledVa.map(m => `<option value="${m.value}" ${selectedMethodVA === m.value ? 'selected' : ''}>${m.label}</option>`).join('')}
            </select>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label style="font-size: 12.5px; font-weight: 700;">Phương pháp tìm Tiệm cận ngang:</label>
            <select id="sel-chall-method-ha" class="challenge-select-field" style="padding: 9px 12px; border-radius: var(--radius-sm); border: 1.5px solid var(--border-card); background: var(--bg-surface); color: var(--text-main); font-size: 13px;">
              <option value="" disabled ${!selectedMethodHA ? 'selected' : ''}>-- Chọn phương pháp tìm Tiệm cận ngang --</option>
              ${shuffledHa.map(m => `<option value="${m.value}" ${selectedMethodHA === m.value ? 'selected' : ''}>${m.label}</option>`).join('')}
            </select>
          </div>

          <div id="chall-result-feedback"></div>

          <button id="btn-submit-challenge" class="btn-action-primary">
            🔍 Kiểm tra dự đoán & Mở khóa đồ thị
          </button>
        </div>
      `;

      document.getElementById('btn-submit-challenge').addEventListener('click', () => {
        const rawVA = document.getElementById('inp-chall-va').value.trim();
        const rawHA = document.getElementById('inp-chall-ha').value.trim();
        const methodVA = document.getElementById('sel-chall-method-va').value;
        const methodHA = document.getElementById('sel-chall-method-ha').value;

        if (!rawVA || !rawHA) {
          alert('Vui lòng nhập đầy đủ giá trị dự đoán cho cả TCĐ và TCN!');
          return;
        }

        const userVA = this.parseMathExpression(rawVA);
        const userHA = this.parseMathExpression(rawHA);

        if (isNaN(userVA) || isNaN(userHA)) {
          alert('Giá trị nhập vào chưa đúng định dạng số học (ví dụ hợp lệ: -2, 3/2, √4, 1.5)!');
          return;
        }

        if (!methodVA || !methodHA) {
          alert('Vui lòng chọn phương pháp tìm cho cả Tiệm cận đứng và Tiệm cận ngang!');
          return;
        }

        this.challengeInputs = { va: userVA, ha: userHA, rawVA, rawHA, methodVA, methodHA };
        this.challengeSubmitted = true;
        this.challengePassed = false;

        const isVaCorrect = Math.abs(userVA - cd.expectedVA) < 0.05;
        const isHaCorrect = Math.abs(userHA - cd.expectedHA) < 0.05;
        const isMethodVaCorrect = (methodVA === 'den_zero');
        const isMethodHaCorrect = (methodHA === 'ratio_high');
        const isMethodCorrect = isMethodVaCorrect && isMethodHaCorrect;

        const fb = document.getElementById('chall-result-feedback');

        if (isVaCorrect && isHaCorrect && isMethodCorrect) {
          this.challengePassed = true;
          fb.innerHTML = `
            <div class="prediction-review-banner correct">
              <span style="font-size: 22px;">🎉</span>
              <div>
                <strong>XUẤT SẮC! DỰ ĐOÁN HOÀN TOÀN CHÍNH XÁC!</strong><br>
                • TCĐ: $${denominator} = 0 \\implies x = ${cd.expectedVA}$.<br>
                • TCN: $y = \\dfrac{${cd.a}}{${cd.c}} = ${cd.expectedHA}$.<br>
                Đồ thị đã mở khóa và hiển thị đúng 100% với dự đoán của bạn!
              </div>
            </div>
          `;
          this.graphEngine.isLocked = false;
          this.graphEngine.render();
        } else {
          let err = '';
          if (!isVaCorrect) err += `• Tiệm cận đứng chưa đúng: em nhập <strong>x = ${this.escapeHtml(rawVA)}</strong> (${!isNaN(userVA) ? '≈ ' + userVA.toFixed(2) : ''}), giải $${denominator} = 0$ được $x = ${cd.expectedVA}$. Chú ý dấu khi chuyển vế!<br>`;
          if (!isHaCorrect) err += `• Tiệm cận ngang chưa đúng: em nhập <strong>y = ${this.escapeHtml(rawHA)}</strong> (${!isNaN(userHA) ? '≈ ' + userHA.toFixed(2) : ''}), $y = \\dfrac{${cd.a}}{${cd.c}} = ${cd.expectedHA}$.<br>`;
          if (!isMethodVaCorrect) err += `• Phương pháp tìm TCĐ chưa chính xác: TCĐ là nghiệm của phương trình mẫu số $= 0$.<br>`;
          if (!isMethodHaCorrect) err += `• Phương pháp tìm TCN chưa chính xác: TCN là tỉ số bậc cao nhất $a/c$.<br>`;

          fb.innerHTML = `
            <div class="prediction-review-banner incorrect">
              <span style="font-size: 22px;">⚠️</span>
              <div>
                <strong>Chưa chính xác, bạn hãy tự sửa lại nhé:</strong><br>
                ${err}
                <em>(Đồ thị sẽ mở khóa ngay khi bạn dự đoán đúng!)</em>
              </div>
            </div>
          `;
          this.graphEngine.isLocked = true;
          this.graphEngine.render();
        }

        if (this.challengePassed) {
          fb.insertAdjacentHTML('beforeend', '<button id="btn-open-summary" class="btn-action-secondary" style="margin:10px 8px 0 0;">📝 Viết bài học cá nhân & xem tổng kết ➔</button>');
          document.getElementById('btn-open-summary').addEventListener('click', () => this.switchActivity('summary'));
        }
        fb.insertAdjacentHTML('beforeend', '<button id="btn-new-challenge" class="btn-action-secondary" style="margin-top:10px;">🔄 Nhận đề mới với số khác</button>');
        document.getElementById('btn-new-challenge').addEventListener('click', () => {
          this.challengeData = this.generateChallengeData();
          this.challengeInputs = null;
          this.challengeSubmitted = false;
          this.challengePassed = false;
          this.rf = new RationalFunction(this.challengeData.a, this.challengeData.b, this.challengeData.c, this.challengeData.d);
          this.graphEngine.isLocked = true;
          this.graphEngine.setFunction(this.rf);
          this.graphEngine.setPointX(0);
          this.updateFormulaText();
          this.renderStepView();
        });
        this.renderMath(fb);
      });

      this.renderMath(slot);
    }

    // =========================================================================
    // ÔN TẬP: TRÒ CHƠI THỬ THÁCH 3 CẤP ĐỘ + BẢNG BỔ TRỢ ĐỒ THỊ & BÍ KÍP
    // =========================================================================
    renderReviewGame(slot) {
      const game = this.reviewGame;
      const levels = game.questions || (game.questions = this.generateReviewQuestionSets());
      const levelIndex = game.level - 1;
      const level = levels[levelIndex];
      const question = level.questions[game.index];
      const completed = game.completed.includes(game.level);
      const levelButtons = levels.map((item, index) => {
        const number = index + 1;
        const unlocked = number === game.level || (number === 1 && !game.completed.includes(1)) || (game.completed.includes(number - 1) && !game.completed.includes(number));
        return `<button type="button" class="review-level-btn ${number === game.level ? 'active' : ''}" data-review-level="${number}" ${unlocked ? '' : 'disabled'}><span>${number}</span><strong>${item.title}</strong><small>${game.completed.includes(number) ? '✓ Đã hoàn thành' : item.subtitle}</small></button>`;
      }).join('');
      const options = question ? question.options.map((option, index) => `<button type="button" class="review-option ${game.selected === index ? 'selected' : ''} ${game.answered && index === question.answer ? 'correct' : ''} ${game.answered && game.selected === index && index !== question.answer ? 'incorrect' : ''}" data-review-option="${index}" ${game.answered ? 'disabled' : ''}><span class="review-option-letter">${String.fromCharCode(65 + index)}</span><span>${option}</span></button>`).join('') : '';
      let feedback = '';
      if (game.answered && question) {
        const correct = game.selected === question.answer;
        feedback = `<div class="review-feedback ${correct ? 'correct' : 'incorrect'}"><strong>${correct ? 'Chính xác! +10 điểm' : 'Chưa đúng, thử lại nhé.'}</strong><p>${question.explain}</p></div>`;
      }
      let footer = '';
      if (completed) {
        footer = game.level < levels.length
          ? `<div class="review-level-complete"><strong>🎉 Hoàn thành ${level.badge}!</strong><p>Em đã mở khóa cấp tiếp theo.</p><button type="button" class="btn-action-primary" id="review-next-level">Chơi cấp ${game.level + 1} ➜</button></div>`
          : '<div class="review-level-complete"><strong>🏆 Em đã chinh phục cả 3 cấp độ!</strong><p>Đã hoàn thành xuất sắc các câu hỏi về tiệm cận, điểm khuyết và ứng dụng thấu kính quang học.</p></div>';
      } else if (game.answered && game.selected === question.answer) {
        footer = `<button type="button" class="btn-action-primary" id="review-next-question">${game.index === level.questions.length - 1 ? 'Hoàn thành cấp độ' : 'Câu tiếp theo'} ➜</button>`;
      } else if (game.answered) {
        footer = '<button type="button" class="btn-action-secondary" id="review-new-variant">Nhận câu khác cùng dạng</button>';
      } else {
        footer = `<button type="button" class="btn-action-primary" id="review-check" ${game.selected === null ? 'disabled' : ''}>Kiểm tra đáp án</button>`;
      }

      slot.innerHTML = `
        <div class="review-layout-grid">
          <!-- CỘT TRÁI: KHUNG TRÒ CHƠI ÔN TẬP CHÍNH -->
          <section class="review-game">
            <header class="review-game-header">
              <span class="prompt-badge">🎮 TRÒ CHƠI ÔN TẬP</span>
              <h2>Chinh phục tiệm cận</h2>
              <p>Trả lời câu hỏi để mở khóa từng thử thách. Mỗi câu đúng được 10 điểm.</p>
              <div class="review-score">⭐ Điểm: <strong>${game.score}</strong></div>
            </header>
            <nav class="review-level-list" aria-label="Các cấp độ">${levelButtons}</nav>
            <section class="review-question-card">
              <div class="review-question-meta"><span>${level.badge}</span><span>Câu ${game.index + 1}/${level.questions.length}</span></div>
              <h3>${level.subtitle}</h3>
              <div class="review-question-prompt">${question ? question.prompt : 'Hoàn thành cấp độ!'}</div>
              <div class="review-options">${options}</div>${feedback}
              <div class="review-game-actions">${footer}</div>
            </section>
            <details class="review-how-to-play">
              <summary>Cách chơi</summary>
              <p>Chọn một đáp án rồi bấm <strong>Kiểm tra đáp án</strong>. Đọc lời giải sau mỗi câu; trả lời đúng để ghi điểm và mở câu tiếp theo. Hoàn thành cấp trước để mở cấp sau.</p>
              <p>Cấp 3 dùng mô hình thấu kính mỏng lý tưởng; ở câu hỏi về tiệm cận đứng, xét vật tiến tới tiêu điểm từ phía $u > f$.</p>
            </details>
          </section>

          <!-- CỘT PHẢI: BẢNG BỔ TRỢ ÔN TẬP & CẨM NANG TOÁN HỌC -->
          <aside class="review-companion-card">
            <div class="companion-header">
              <div class="companion-header-icon">💡</div>
              <div>
                <span class="companion-kicker">CẨM NANG ÔN TẬP & MẸO THI</span>
                <h3 class="companion-title">Sổ Tay Bí Kíp Tiệm Cận</h3>
              </div>
            </div>

            <!-- 1. BÍ KÍP 4 QUY TẮC VÀNG -->
            <div class="companion-card-box">
              <div class="companion-box-header">
                <span class="box-icon">⚡</span>
                <span class="box-title">4 Quy Tắc Vàng Cần Thuộc</span>
                <span class="box-pill">Cốt lõi</span>
              </div>
              <div class="cheatsheet-rules-list">
                <div class="cheatsheet-rule-item tcd">
                  <div class="rule-badge-tag tcd">TCĐ</div>
                  <div class="rule-body">
                    <strong>Nghiệm của mẫu số</strong>
                    <p>Giải $cx + d = 0 \\iff x = -\\dfrac{d}{c}$ (với $ad - bc \\ne 0$). Mẫu triệt tiêu đẩy tung độ vọt lên $\\pm\\infty$.</p>
                  </div>
                </div>
                <div class="cheatsheet-rule-item tcn">
                  <div class="rule-badge-tag tcn">TCN</div>
                  <div class="rule-body">
                    <strong>Tỉ số hai hệ số dẫn đầu</strong>
                    <p>$\\lim_{x\\to \\pm\\infty} \\dfrac{ax+b}{cx+d} = \\dfrac{a}{c} \\implies y = \\dfrac{a}{c}$. Giới hạn vô cực của bậc nhất trên bậc nhất.</p>
                  </div>
                </div>
                <div class="cheatsheet-rule-item hole">
                  <div class="rule-badge-tag hole">Lỗ thủng</div>
                  <div class="rule-body">
                    <strong>Bẫy suy biến ($ad - bc = 0$)</strong>
                    <p>Nếu $ad - bc = 0$, tử và mẫu có nhân tử chung rút gọn thành hằng số, đồ thị bị khoét $1$ lỗ, <em>không có TCĐ</em>!</p>
                  </div>
                </div>
                <div class="cheatsheet-rule-item casio">
                  <div class="rule-badge-tag casio">Casio</div>
                  <div class="rule-body">
                    <strong>Kiểm tra giới hạn bằng CALC</strong>
                    <p>Dùng lệnh tính giá trị để xấp xỉ số: thử hai phía TCĐ ($x \\to x_0^\\pm$) và thử hai phía TCN ($x \\to \\pm 10^9$).</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. HƯỚNG DẪN BẤM MÁY CASIO 580 & 880 -->
            <div class="companion-card-box casio-card-box">
              <div class="companion-box-header">
                <span class="box-icon">📟</span>
                <span class="box-title">Cách Bấm Máy Tính Giải Nhanh Lim</span>
                <span class="box-pill" style="color: #7c3aed; background: rgba(139, 92, 246, 0.1);">580 & 880</span>
              </div>

              <!-- CASIO 580VN X -->
              <div class="casio-model-section">
                <div class="casio-model-title">
                  <span class="casio-chip fx580">Casio fx-580VN X</span>
                  <span class="casio-model-desc">Dùng phím <kbd class="casio-key">CALC</kbd></span>
                </div>
                <div class="casio-step-group">
                  <div class="casio-step-row">
                    <span class="casio-step-badge">1</span>
                    <div class="casio-step-text"><strong>Nhập hàm số:</strong> Ví dụ $\\dfrac{2x+1}{x-3}$ (bấm phím biến <kbd class="casio-key">x</kbd> màu hồng).</div>
                  </div>
                  <div class="casio-step-row">
                    <span class="casio-step-badge">2</span>
                    <div class="casio-step-text">
                      <strong>Thử phía phải ($x \\to 3^+$):</strong> Bấm <kbd class="casio-key">CALC</kbd> $\\to$ Nhập <code class="casio-code">3 + 10^-6</code> (hoặc <code class="casio-code">3.000001</code>) $\\to$ Bấm <kbd class="casio-key">=</kbd>.<br>
                      <em>Kết quả dương rất lớn: $+7 \\times 10^6 \\implies \\lim_{x\\to 3^+} f(x) = +\\infty$.</em>
                    </div>
                  </div>
                  <div class="casio-step-row">
                    <span class="casio-step-badge">3</span>
                    <div class="casio-step-text">
                      <strong>Thử phía trái ($x \\to 3^-$):</strong> Bấm <kbd class="casio-key">CALC</kbd> $\\to$ Nhập <code class="casio-code">3 - 10^-6</code> (hoặc <code class="casio-code">2.999999</code>) $\\to$ Bấm <kbd class="casio-key">=</kbd>.<br>
                      <em>Kết quả âm rất lớn: $-7 \\times 10^6 \\implies \\lim_{x\\to 3^-} f(x) = -\\infty$.</em><br>
                      <small style="color:var(--text-muted); font-size:11px;">(Hai phía cùng ra vô cực $\\implies$ đường thẳng $x = 3$ là TCĐ thực thụ).</small>
                    </div>
                  </div>
                  <div class="casio-step-row">
                    <span class="casio-step-badge">4</span>
                    <div class="casio-step-text">
                      <strong>Tìm TCN ($x \\to \\pm\\infty$):</strong> Bấm <kbd class="casio-key">CALC</kbd> $\\to$ Nhập <code class="casio-code">10^9</code> (hoặc <code class="casio-code">-10^9</code>) $\\to$ Bấm <kbd class="casio-key">=</kbd>.<br>
                      <em>Màn hình hiện $1.999999 \\approx 2 \\implies y = 2$ là TCN.</em>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CASIO 880BTG -->
              <div class="casio-model-section" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border-card);">
                <div class="casio-model-title">
                  <span class="casio-chip fx880">Casio fx-880BTG</span>
                  <span class="casio-model-desc">Dùng menu <kbd class="casio-key">TOOLS</kbd></span>
                </div>
                <div class="casio-step-group">
                  <div class="casio-step-row">
                    <span class="casio-step-badge">1</span>
                    <div class="casio-step-text"><strong>Nhập hàm số:</strong> Bấm phím <kbd class="casio-key">x</kbd> độc lập ở hàng phím số.</div>
                  </div>
                  <div class="casio-step-row">
                    <span class="casio-step-badge">2</span>
                    <div class="casio-step-text">
                      <strong>Mở công cụ tính:</strong> Bấm phím <kbd class="casio-key">TOOLS</kbd> $\\to$ Chọn <strong>Tính giá trị</strong>.
                    </div>
                  </div>
                  <div class="casio-step-row">
                    <span class="casio-step-badge">3</span>
                    <div class="casio-step-text">
                      <strong>Thử phía phải ($x_0 + \\varepsilon$):</strong> Nhập $x = 3 + 10^{-6} \\to$ Bấm <kbd class="casio-key">EXE</kbd> $\\implies$ Giá trị vọt lên $+10^k$ ($+\\infty$).
                    </div>
                  </div>
                  <div class="casio-step-row">
                    <span class="casio-step-badge">4</span>
                    <div class="casio-step-text">
                      <strong>Thử phía trái ($x_0 - \\varepsilon$):</strong> Nhập $x = 3 - 10^{-6} \\to$ Bấm <kbd class="casio-key">EXE</kbd> $\\implies$ Giá trị vọt xuống $-10^k$ ($-\\infty$).
                    </div>
                  </div>
                  <div class="casio-step-row">
                    <span class="casio-step-badge">5</span>
                    <div class="casio-step-text">
                      <strong>Dò TCN ($x \\to \\pm\\infty$):</strong> Nhập $10^9$ (hoặc $-10^9$) $\\to$ Bấm <kbd class="casio-key">EXE</kbd> $\\implies$ Kết quả hội tụ về $y = \\dfrac{a}{c}$.
                    </div>
                  </div>
                </div>
              </div>

              <!-- MẸO ĐỌC KẾT QUẢ MÀN HÌNH -->
              <div class="casio-decode-tip">
                <span class="tip-icon">💡</span>
                <div class="tip-content">
                  <strong>Nguyên lý đọc kết quả & Lưu ý phương pháp:</strong><br>
                  • <em>Kiểm tra số gần đúng (Numerical Approximation):</em> Thao tác CALC chỉ là phép thử số xấp xỉ nhằm hỗ trợ phán đoán nhanh, không thay thế cho lập luận và định nghĩa toán học chặt chẽ. Em cần ghi dấu cụ thể ($+\\infty$ hoặc $-\\infty$) ở mỗi phía để nắm rõ chiều biến thiên.<br>
                  • <em>Tiệm cận đứng ($x_0 \\pm \\varepsilon$):</em> Màn hình hiện $\\times 10^k$ với số mũ dương lớn ($k \\ge 6$) $\\implies$ vô cực $\\pm\\infty$. Nếu cả hai phía ra số hữu hạn thì đó là điểm khuyết hoặc đồ thị không có TCĐ.<br>
                  • <em>Tiệm cận ngang ($x \\to \\pm 10^9$):</em> Màn hình hiện số sát giá trị hữu hạn (ví dụ: $1.999999 \\approx 2$). Nhớ thử cả $+10^9$ và $-10^9$ đề phòng trường hợp hai phía khác nhau.
                </div>
              </div>
            </div>

            <!-- 3. TIẾN ĐỘ & HUY HIỆU -->
            <div class="companion-card-box">
              <div class="companion-box-header">
                <span class="box-icon">🏆</span>
                <span class="box-title">Huy Hiệu Chinh Phục</span>
                <div style="display:flex; align-items:center; gap:6px;">
                  <span class="box-pill">${game.score} / 90 Điểm</span>
                  <button id="btn-reset-review" class="chip-btn" style="font-size:11px; padding:2px 6px; cursor:pointer;" title="Làm lại từ đầu">🔄 Làm lại</button>
                </div>
              </div>
              <div class="badges-flex-container">
                <div class="achievement-badge-item ${game.completed.includes(1) ? 'earned' : (game.level === 1 ? 'current' : 'locked')}">
                  <span class="ach-icon">🌟</span>
                  <div class="ach-text">
                    <strong>Cấp 1: Nhận diện</strong>
                    <small>${game.completed.includes(1) ? '✓ Đã mở khóa' : (game.level === 1 ? 'Đang thực hiện' : 'Chưa mở')}</small>
                  </div>
                </div>
                <div class="achievement-badge-item ${game.completed.includes(2) ? 'earned' : (game.level === 2 ? 'current' : 'locked')}">
                  <span class="ach-icon">🏹</span>
                  <div class="ach-text">
                    <strong>Cấp 2: Thợ săn</strong>
                    <small>${game.completed.includes(2) ? '✓ Đã mở khóa' : (game.level === 2 ? 'Đang thực hiện' : 'Chưa mở')}</small>
                  </div>
                </div>
                <div class="achievement-badge-item ${game.completed.includes(3) ? 'earned' : (game.level === 3 ? 'current' : 'locked')}">
                  <span class="ach-icon">🔬</span>
                  <div class="ach-text">
                    <strong>Cấp 3: Thấu kính</strong>
                    <small>${game.completed.includes(3) ? '✓ Đã mở khóa' : (game.level === 3 ? 'Đang thực hiện' : 'Chưa mở')}</small>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      `;

      const saveReviewProgress = () => {
        try {
          localStorage.setItem('rational_lab_review_progress', JSON.stringify({
            level: game.level,
            score: game.score,
            completed: game.completed
          }));
        } catch (e) {}
      };

      const btnResetReview = slot.querySelector('#btn-reset-review');
      if (btnResetReview) btnResetReview.addEventListener('click', () => {
        if (confirm('Em có muốn đặt lại tiến độ và điểm số của phần Ôn tập không?')) {
          game.level = 1; game.index = 0; game.score = 0; game.selected = null; game.answered = false; game.completed = [];
          saveReviewProgress();
          this.renderReviewGame(slot);
        }
      });

      slot.querySelectorAll('[data-review-level]').forEach(button => button.addEventListener('click', () => {
        const nextLevel = Number(button.dataset.reviewLevel);
        if (nextLevel === 1 || game.completed.includes(nextLevel - 1) || game.completed.includes(nextLevel)) {
          game.level = nextLevel; game.index = 0; game.selected = null; game.answered = false;
          saveReviewProgress();
          this.renderReviewGame(slot);
        }
      }));
      slot.querySelectorAll('[data-review-option]').forEach(button => button.addEventListener('click', () => {
        if (game.answered) return;
        game.selected = Number(button.dataset.reviewOption);
        this.renderReviewGame(slot);
      }));
      const check = slot.querySelector('#review-check');
      if (check) check.addEventListener('click', () => {
        if (game.selected === null) return;
        game.answered = true;
        if (game.selected === question.answer) game.score += 10;
        saveReviewProgress();
        this.renderReviewGame(slot);
      });
      const newVariant = slot.querySelector('#review-new-variant');
      if (newVariant) newVariant.addEventListener('click', () => {
        const oldPrompt = question.prompt;
        let freshQuestion;
        let attempts = 0;
        do {
          freshQuestion = this.generateReviewQuestionSets()[levelIndex].questions[game.index];
          attempts += 1;
        } while (freshQuestion.prompt === oldPrompt && attempts < 10);
        game.questions[levelIndex].questions[game.index] = freshQuestion;
        game.selected = null; game.answered = false;
        this.renderReviewGame(slot);
      });
      const next = slot.querySelector('#review-next-question');
      if (next) next.addEventListener('click', () => {
        if (game.index === level.questions.length - 1) {
          if (!game.completed.includes(game.level)) game.completed.push(game.level);
        } else game.index += 1;
        game.selected = null; game.answered = false;
        saveReviewProgress();
        this.renderReviewGame(slot);
      });
      const nextLevel = slot.querySelector('#review-next-level');
      if (nextLevel) nextLevel.addEventListener('click', () => {
        game.level += 1; game.index = 0; game.selected = null; game.answered = false;
        saveReviewProgress();
        this.renderReviewGame(slot);
      });

      // Render toán học bằng KaTeX cho toàn bộ câu hỏi và bảng bổ trợ
      this.renderMath(slot);
    }

    // =========================================================================
    // TỔNG KẾT: công thức, chứng minh và phản hồi cho bài học cá nhân
    // =========================================================================
    renderSummary(slot) {
      const lesson = this.personalLesson || '';
      slot.innerHTML = `
        <section class="challenge-card summary-card">
          <div class="prompt-card">
            <span class="prompt-badge">TỔNG KẾT SAU THỰC NGHIỆM</span>
            <div class="prompt-question">Trước hết, hãy viết điều em tự rút ra. Sau đó dùng các tiêu chí bên dưới để tự rà lại ghi chú của mình.</div>
          </div>

          <label for="personal-lesson" style="display:block; font-weight:700; margin:12px 0 6px;">Bài học cá nhân của em</label>
          <textarea id="personal-lesson" rows="4" maxlength="1500" placeholder="Ví dụ: Khi x tiến sát nghiệm của mẫu số, đồ thị...">${this.escapeHtml(lesson)}</textarea>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
            <p style="font-size:12px; color:var(--text-muted); margin:0;">Ghi chú được lưu trữ tự động trên trình duyệt của em.</p>
            <button id="btn-clear-lesson" class="chip-btn" style="font-size:11px; padding:4px 8px; cursor:pointer;" type="button">🗑️ Xóa ghi chú</button>
          </div>

          <div class="explanation-synthesis-card" style="margin:14px 0; padding:14px; border:1px solid var(--border-subtle); border-radius:var(--radius-md); background:var(--bg-card);">
            <h3 style="margin:0 0 8px;">Ý nghĩa hai giới hạn và hai tiệm cận</h3>
            <p><strong style="color:var(--color-tcd);">Tiệm cận đứng:</strong> Gần vị trí x = x₀, mẫu số tiến về 0 trong khi tử số khác 0. Nếu hàm số tiến tới vô cực ở ít nhất một phía, đường thẳng x = x₀ là TCĐ.</p>
            <div class="math-proof-equation">\\[\\lim_{x\\to x_0^-}f(x)=\\pm\\infty\\quad\\text{hoặc}\\quad\\lim_{x\\to x_0^+}f(x)=\\pm\\infty\\]</div>
            <p><strong style="color:var(--color-tcn);">Tiệm cận ngang:</strong> Khi x đi ra xa về bên phải hoặc bên trái, nếu f(x) tiến gần đến số hữu hạn L thì đường thẳng y = L là TCN.</p>
            <div class="math-proof-equation">\\[\\lim_{x\\to+\\infty}f(x)=L\\qquad\\lim_{x\\to-\\infty}f(x)=L\\]</div>
          </div>

          <section class="summary-curiosity-card">
            <h3>✨ Vì sao lại có điều kiện $ad - bc \\neq 0$?</h3>
            <p>Trước hết, ta cần hiểu <strong>điểm khuyết là gì?</strong></p>
            <p>Đối với hàm phân thức bậc nhất trên bậc nhất, điểm khuyết xuất hiện khi tồn tại một giá trị $x_0$ làm cho cả tử số và mẫu số đồng thời bằng $0$.</p>
            
            <p><strong>Ví dụ:</strong></p>
            <div class="math-proof-equation">
              \\[f(x) = \\dfrac{2x + 4}{x + 2} = \\dfrac{2(x + 2)}{x + 2} = 2, \\quad x \\neq -2\\]
            </div>
            
            <p>Ta thấy tại $x = -2$, cả tử số và mẫu số đều bằng $0$. Vì vậy, hàm số không xác định tại $x = -2$.</p>
            <p>Nói cách khác, khi tử và mẫu của một hàm phân thức bậc nhất trên bậc nhất có nhân tử chung, ta có thể rút gọn hàm số thành một hằng số. Tuy nhiên, giá trị $x_0$ làm cho mẫu số ban đầu bằng $0$ vẫn bị loại khỏi tập xác định.</p>
            <p>Khi đó, đồ thị là <strong>một đường thẳng nằm ngang bị khuyết một điểm</strong>, chứ không phải một đường thẳng đầy đủ.</p>
            <p>Trong ví dụ trên, đồ thị là đường thẳng $y = 2$, bị khuyết tại $(-2;\\, 2)$.</p>
            
            <p><strong>Điểm khuyết không tạo ra tiệm cận đứng</strong>, bởi vì khi $x$ tiến đến $x_0$, giá trị hàm số tiến đến một số hữu hạn, thay vì tiến đến vô cực.</p>
            <p>Do đó, để hàm phân thức bậc nhất trên bậc nhất có tiệm cận đứng, ta cần đảm bảo <strong>không xuất hiện điểm khuyết tại vị trí mẫu số bằng $0$</strong>.</p>
            
            <hr style="border: none; border-top: 1px dashed rgba(161, 98, 7, 0.25); margin: 14px 0;">
            
            <p><strong>Xét hàm số:</strong></p>
            <div class="math-proof-equation">
              \\[f(x) = \\dfrac{ax + b}{cx + d}, \\quad c \\neq 0\\]
            </div>
            
            <p>Mẫu số bằng $0$ khi:</p>
            <div class="math-proof-equation">
              \\[cx + d = 0 \\implies x_0 = -\\dfrac{d}{c}\\]
            </div>
            
            <p>Để tại $x_0$ không xuất hiện điểm khuyết, tử số phải khác $0$:</p>
            <div class="math-proof-equation">
              \\[ax_0 + b \\neq 0\\]
            </div>
            
            <p>Thay $x_0 = -\\dfrac{d}{c}$ vào tử số:</p>
            <div class="math-proof-equation">
              \\[a\\left(-\\dfrac{d}{c}\\right) + b \\neq 0\\]
            </div>
            
            <p>Quy đồng:</p>
            <div class="math-proof-equation">
              \\[\\dfrac{bc - ad}{c} \\neq 0\\]
            </div>
            
            <p>Vì $c \\neq 0$, suy ra:</p>
            <div class="math-proof-equation">
              \\[bc - ad \\neq 0\\]
            </div>
            
            <p>Tương đương:</p>
            <div class="math-proof-equation">
              \\[\\boxed{ad - bc \\neq 0}\\]
            </div>
            
            <div class="summary-hole-conclusion">
              <p style="margin: 0 0 6px;"><strong>Kết luận:</strong> Để hàm phân thức bậc nhất trên bậc nhất có tiệm cận đứng, ta cần hai điều kiện:</p>
              <div style="text-align: center; margin: 10px 0;">
                \\[\\boxed{c \\neq 0, \\quad ad - bc \\neq 0}\\]
              </div>
              <p style="margin: 6px 0 4px;"><strong>Trong đó:</strong></p>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6;">
                <li>$c \\neq 0$: Đảm bảo mẫu số có nghiệm $x_0 = -\\dfrac{d}{c}$.</li>
                <li>$ad - bc \\neq 0$: Đảm bảo tử số không đồng thời bằng $0$ tại $x_0$, từ đó không xuất hiện điểm khuyết mà xuất hiện tiệm cận đứng.</li>
              </ul>
            </div>
          </section>

          <section class="summary-procedure-card">
            <h3>Quy trình tìm và trình bày tiệm cận (Chuẩn SGK Toán 12)</h3>
            <ol style="margin: 0; padding-left: 20px; line-height: 1.7;">
              <li><strong>Tìm tập xác định:</strong> $D = \\mathbb{R} \\setminus \\left\\{-\\dfrac{d}{c}\\right\\}$.</li>
              <li style="margin-top: 8px;"><strong>Tìm tiệm cận đứng:</strong>
                <div class="math-proof-equation" style="margin: 6px 0;">\\[\\lim_{x \\to \\left(-\\frac{d}{c}\\right)^+} f(x) = \\pm\\infty \\quad\\text{và}\\quad \\lim_{x \\to \\left(-\\frac{d}{c}\\right)^-} f(x) = \\mp\\infty\\]</div>
                <p style="margin: 4px 0; color: var(--text-muted); font-size: 12.5px;"><em>(Đối với hàm phân thức bậc nhất trên bậc nhất có thể dùng nhanh $x = -\\dfrac{d}{c}$).</em></p>
                <p style="margin: 4px 0;">$\\implies$ Kết luận đường thẳng $x = -\\dfrac{d}{c}$ là <strong>đường tiệm cận đứng</strong> của đồ thị hàm số.</p>
              </li>
              <li style="margin-top: 8px;"><strong>Tìm tiệm cận ngang:</strong>
                <div class="math-proof-equation" style="margin: 6px 0;">\\[\\lim_{x \\to +\\infty} f(x) = \\lim_{x \\to +\\infty} \\dfrac{a + \\frac{b}{x}}{c + \\frac{d}{x}} = \\dfrac{a}{c}, \\qquad \\lim_{x \\to -\\infty} f(x) = \\dfrac{a}{c}\\]</div>
                <p style="margin: 4px 0; color: var(--text-muted); font-size: 12.5px;"><em>(Có thể sử dụng nhanh $y = \\dfrac{a}{c}$ cho hàm phân thức bậc nhất trên bậc nhất để tìm tiệm cận ngang).</em></p>
                <p style="margin: 4px 0;">$\\implies$ Kết luận đường thẳng $y = \\dfrac{a}{c}$ là <strong>đường tiệm cận ngang</strong> của đồ thị hàm số.</p>
              </li>
            </ol>
            <div class="summary-procedure-example" style="margin-top: 14px; padding: 12px 14px; border-radius: var(--radius-sm); border: 1px dashed var(--border-subtle); background: var(--bg-surface-elevated);">
              <strong>📝 Mẫu trình bày chuẩn bài thi SGK Toán 12:</strong>
              <div style="font-style: normal; margin-top: 6px; line-height: 1.65; font-size: 13px;">
                • <strong>Tập xác định:</strong> $D = \\mathbb{R} \\setminus \\left\\{-\\dfrac{d}{c}\\right\\}$.<br>
                • Ta có: $\\lim\\limits_{x \\to \\left(-\\frac{d}{c}\\right)^+} f(x) = +\\infty$ (hoặc $-\\infty$) $\\implies$ Đường thẳng $x = -\\dfrac{d}{c}$ là đường tiệm cận đứng của đồ thị hàm số.<br>
                • Lại có: $\\lim\\limits_{x \\to +\\infty} f(x) = \\dfrac{a}{c}$ và $\\lim\\limits_{x \\to -\\infty} f(x) = \\dfrac{a}{c}$ $\\implies$ Đường thẳng $y = \\dfrac{a}{c}$ là đường tiệm cận ngang của đồ thị hàm số.
              </div>
            </div>
          </section>

          <details class="formula-highlight-box" style="margin:14px 0;">
            <summary style="font-weight:800; cursor:pointer;">Mở công thức tính nhanh và chứng minh</summary>
            <div class="summary-proof-content">
              <h3 class="summary-proof-va">Tiệm cận đứng</h3>
              <p>Với hàm số \\(f(x)=\\dfrac{ax+b}{cx+d}\\), nghiệm của phương trình mẫu số \\(cx+d=0\\) là:</p>
              <div class="math-proof-equation">\\[cx+d=0\\quad\\Longrightarrow\\quad x_0=-\\dfrac{d}{c}.\\]</div>
              <p><strong>Giải thích:</strong> Tại \\(x_0=-\\dfrac dc\\), mẫu số bằng \\(0\\). Tử số tại đó là:</p>
              <div class="math-proof-equation">\\[ax_0+b=a\\left(-\\dfrac dc\\right)+b=\\dfrac{bc-ad}{c}=-\\dfrac{ad-bc}{c}\\ne0,\\]</div>
              <p>do \\(c\\ne0\\) và \\(ad-bc\\ne0\\). Khi \\(x\\) tiến đến \\(x_0\\), tử số tiến đến một số khác \\(0\\), còn mẫu số tiến đến \\(0\\). Vì vậy, ít nhất một giới hạn một phía của hàm số là vô cực; theo định nghĩa, đường thẳng \\(x=x_0\\) là tiệm cận đứng.</p>

              <h3 class="summary-proof-ha">Tiệm cận ngang</h3>
              <p>Chia cả tử và mẫu cho \\(x\\):</p>
              <div class="math-proof-equation">\\[f(x)=\\dfrac{ax+b}{cx+d}=\\dfrac{a+\\frac bx}{c+\\frac dx}.\\]</div>
              <p>Khi \\(x\\to+\\infty\\) hoặc \\(x\\to-\\infty\\), ta có \\(\\dfrac bx\\to0\\) và \\(\\dfrac dx\\to0\\). Do \\(c\\ne0\\), ở cả hai trường hợp:</p>
              <div class="math-proof-equation">\\[\\lim_{x\\to+\\infty}f(x)=\\dfrac ac,\\qquad \\lim_{x\\to-\\infty}f(x)=\\dfrac ac.\\]</div>
              <p>Theo định nghĩa, đường thẳng \\(y=\\dfrac ac\\) là tiệm cận ngang.</p>
              <p style ="color: red"><strong>Lưu ý: Công thức tính nhanh Tiệm cận đứng và tiệm cận ngang từ các giá trị a,c,d chỉ đúng với hàm phân thức bậc nhất trên bậc nhất, còn những hàm khác cần cẩn trọng.</strong></p>
            </div>
          </details>

          <div class="self-assessment-card" style="margin:14px 0; padding:14px; border:1px solid var(--border-subtle); border-radius:var(--radius-md); background:var(--bg-card);">
            <h3 style="margin:0 0 8px;">Tự đánh giá ghi chú</h3>
            <p style="margin:0 0 10px; color:var(--text-muted); font-size:13px;">Đánh dấu những ý em đã tự viết được, rồi bấm nút để xem mức độ đầy đủ.</p>
            <label><input type="checkbox" data-self-check="twoSides"> Em đã nêu điều xảy ra khi $x$ tiến gần $x_0$ từ bên trái và bên phải.</label>
            <label><input type="checkbox" data-self-check="infinityDirection"> Em đã xác định được $f(x)$ tiến về +∞ hay −∞ theo từng phía.</label>
            <label><input type="checkbox" data-self-check="definition"> Em đã liên hệ kết quả với định nghĩa tiệm cận đứng.</label>
            <label><input type="checkbox" data-self-check="horizontal"> Em đã nêu điều xảy ra với $f(x)$ khi $x$ đi ra xa về hai phía.</label>
            <button id="btn-self-assess" class="btn-action-primary" style="margin-top:10px;">Tự đánh giá ghi chú</button>
            <div id="self-assessment-feedback" class="prediction-review-banner" aria-live="polite" style="display:none; margin-top:10px;"></div>
          </div>
        </section>
      `;

      const textarea = document.getElementById('personal-lesson');
      textarea.addEventListener('input', () => {
        this.personalLesson = textarea.value;
        this.noteSelfAssessmentDone = false;
        try { localStorage.setItem('rational_lab_personal_lesson', this.personalLesson); } catch (e) {}
        const feedback = document.getElementById('self-assessment-feedback');
        if (feedback) feedback.style.display = 'none';
      });

      const btnClearLesson = document.getElementById('btn-clear-lesson');
      if (btnClearLesson) {
        btnClearLesson.addEventListener('click', () => {
          if (confirm('Em có chắc chắn muốn xóa bài học cá nhân đã lưu để viết lại không?')) {
            this.personalLesson = '';
            textarea.value = '';
            this.noteSelfAssessment = { twoSides: false, infinityDirection: false, definition: false, horizontal: false };
            this.noteSelfAssessmentDone = false;
            try {
              localStorage.removeItem('rational_lab_personal_lesson');
              localStorage.removeItem('rational_lab_self_assessment');
              localStorage.removeItem('rational_lab_assessment_done');
            } catch (e) {}
            document.querySelectorAll('[data-self-check]').forEach(input => { input.checked = false; });
            const feedback = document.getElementById('self-assessment-feedback');
            if (feedback) feedback.style.display = 'none';
          }
        });
      }

      document.querySelectorAll('[data-self-check]').forEach(input => {
        const key = input.dataset.selfCheck;
        input.checked = !!this.noteSelfAssessment[key];
        input.addEventListener('change', () => {
          this.noteSelfAssessment[key] = input.checked;
          this.noteSelfAssessmentDone = false;
          try { localStorage.setItem('rational_lab_self_assessment', JSON.stringify(this.noteSelfAssessment)); } catch (e) {}
          const feedback = document.getElementById('self-assessment-feedback');
          if (feedback) feedback.style.display = 'none';
        });
      });
      if (this.noteSelfAssessmentDone) this.showSelfAssessmentFeedback();
      document.getElementById('btn-self-assess').addEventListener('click', () => {
        this.personalLesson = textarea.value.trim();
        if (this.personalLesson.length < 10) {
          const feedback = document.getElementById('self-assessment-feedback');
          feedback.textContent = 'Em hãy viết ít nhất một câu về điều mình rút ra rồi tự đánh giá nhé.';
          feedback.className = 'prediction-review-banner incorrect';
          feedback.style.display = 'block';
          return;
        }
        this.noteSelfAssessmentDone = true;
        try {
          localStorage.setItem('rational_lab_personal_lesson', this.personalLesson);
          localStorage.setItem('rational_lab_assessment_done', 'true');
        } catch (e) {}
        this.showSelfAssessmentFeedback();
      });
      this.renderMath(slot);
    }

    showSelfAssessmentFeedback() {
      const box = document.getElementById('self-assessment-feedback');
      if (!box) return;
      const score = Object.values(this.noteSelfAssessment).filter(Boolean).length;
      const feedback = score === 4
        ? '4/4 tiêu chí đã được đánh dấu. Ghi chú của em có đủ quan sát TCĐ, dấu của hai giới hạn, định nghĩa TCĐ và ý về TCN. Hãy đọc lại để chắc rằng đây là điều em thực sự hiểu.'
        : `${score}/4 tiêu chí đã được đánh dấu. Hãy xem lại các ý chưa chọn và bổ sung vào ghi chú nếu em còn thiếu.`;
      box.style.display = 'block';
      box.className = `prediction-review-banner ${score === 4 ? 'correct' : 'incorrect'}`;
      box.textContent = feedback;
    }

    escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
    }

    // =========================================================================
    // TỰ KHẢO SÁT HÀM SỐ: NHẬP HỆ SỐ, TIỆM CẬN, ĐẠO HÀM VÀ BẢNG BIẾN THIÊN
    // =========================================================================
    renderSandbox(slot) {
      const rf = this.rf;
      const fmt = value => {
        if (!Number.isFinite(value)) return 'không xác định';
        return Number(value.toPrecision(6)).toString();
      };
      const linear = (coef, constant) => {
        if (coef === 0) return fmt(constant);
        const xTerm = coef === 1 ? 'x' : coef === -1 ? '−x' : fmt(coef) + 'x';
        if (constant > 0) return xTerm + ' + ' + fmt(constant);
        if (constant < 0) return xTerm + ' − ' + fmt(Math.abs(constant));
        return xTerm;
      };
      const isInvalid = rf.isUndefined;
      const determinant = rf.determinant;
      const isHoleCase = rf.isDegenerateHole;
      const x0 = rf.vaX !== null ? rf.vaX : rf.holeX;
      const fOfX = '\\(' + rf.toLatex() + '\\)';
      const hasResults = this.sandboxSubmitted;
      const inputValues = this.sandboxInputValues || { a: '', b: '', c: '', d: '' };

      let verticalText = 'Không có';
      let horizontalText = 'Không có';
      let obliqueText = 'Không có';
      let derivativeText = 'Không xác định';
      let variationHtml = '<p>Không lập được bảng biến thiên vì hàm số không xác định.</p>';
      let explanation = '';
      let verticalCalculation = 'Giải phương trình mẫu số bằng 0.';
      let horizontalCalculation = 'Xét giới hạn của hàm số khi x tiến ra vô cực.';
      let obliqueCalculation = 'Với hàm phân thức bậc nhất trên bậc nhất, không có tiệm cận xiên.';
      let specialCaseTitle = 'Hàm phân thức bậc nhất trên bậc nhất';
      let specialCaseDescription = 'Nếu c ≠ 0 và ad − bc ≠ 0, hàm có dạng phân thức chuẩn: có một tiệm cận đứng và một tiệm cận ngang.';
      let specialCaseProcedure = '';

      if (!isInvalid) {
        verticalText = rf.vaX !== null ? 'x = ' + fmt(rf.vaX) : 'Không có';
        horizontalText = rf.haY !== null ? 'y = ' + fmt(rf.haY) : 'Không có';
        if (rf.c !== 0) {
          verticalCalculation = 'Giải \\(' + linear(rf.c, rf.d) + ' = 0\\), được \\(x_0 = ' + fmt(-rf.d / rf.c) + '\\).';
          if (rf.vaX !== null) {
            const leftLimit = determinant > 0 ? '+\\infty' : '-\\infty';
            const rightLimit = determinant > 0 ? '-\\infty' : '+\\infty';
            verticalCalculation += ' Thay vào tử số: \\(ax_0+b=' + fmt(rf.a * rf.vaX + rf.b) + '\\ne 0\\). Theo giới hạn một phía: \\(\\lim_{x\\to ' + fmt(rf.vaX) + '^-}f(x)=' + leftLimit + ',\\quad\\lim_{x\\to ' + fmt(rf.vaX) + '^+}f(x)=' + rightLimit + '\\). Vậy đường thẳng \\(x=' + fmt(rf.vaX) + '\\) là tiệm cận đứng.';
          } else {
            verticalCalculation += ' Tử số cũng bằng \\(0\\) tại đó; sau khi rút gọn, đây là điểm khuyết, không phải tiệm cận đứng.';
          }
          horizontalCalculation = 'Chia cả tử và mẫu cho \\(x\\): \\(\\lim_{x\\to\\pm\\infty}\\frac{ax+b}{cx+d}=\\lim_{x\\to\\pm\\infty}\\frac{a+\\frac bx}{c+\\frac dx}=\\frac ac=' + fmt(rf.a / rf.c) + '\\). Vậy \\(y=' + fmt(rf.a / rf.c) + '\\) là tiệm cận ngang.';
        } else if (rf.d !== 0 && rf.a === 0) {
          verticalCalculation = 'Mẫu số là hằng số khác 0 nên không có tiệm cận đứng.';
          horizontalCalculation = 'Hàm số không đổi y = b/d = ' + fmt(rf.b / rf.d) + ', nên đường ngang này cũng là tiệm cận ngang.';
          obliqueCalculation = 'Không có; hàm số là hàm hằng.';
        } else if (rf.d !== 0) {
          verticalCalculation = 'Mẫu số là hằng số khác 0 nên không có tiệm cận đứng.';
          horizontalCalculation = 'Hàm trở thành đường thẳng có hệ số góc khác 0, nên không có giới hạn hữu hạn khi x tiến ra vô cực.';
          obliqueCalculation = 'Không có tiệm cận xiên riêng; đồ thị chính là đường thẳng.';
        }
        if (rf.c === 0 && rf.d !== 0 && rf.a !== 0) {
          const slope = rf.a / rf.d;
          const intercept = rf.b / rf.d;
          specialCaseTitle = 'Hàm trở thành đường thẳng xiên';
          specialCaseDescription = 'Vì c = 0, d ≠ 0 và a ≠ 0, hàm rút thành y = ' + fmt(slope) + 'x + ' + fmt(intercept) + '. Đây là đường thẳng của hàm số, không phải một tiệm cận xiên riêng.';
          specialCaseProcedure = '<ol><li>Thay c = 0 vào mẫu: cx + d = d, nên mẫu không bằng 0 với mọi x.</li><li>Chia từng hạng tử cho d: f(x) = (ax + b)/d = (' + fmt(slope) + ')x + (' + fmt(intercept) + ').</li><li>Đồ thị chính là đường thẳng này trên toàn trục số; không có điểm khuyết. Giao với trục Oy là (0, ' + fmt(intercept) + '); nếu a ≠ 0, giao với Ox là (' + fmt(-intercept / slope) + ', 0).</li></ol>';
          explanation = 'Mẫu số là hằng số nên hàm trở thành đường thẳng y = ' + fmt(slope) + 'x + ' + fmt(intercept) + '.';
          obliqueText = 'Không có tiệm cận xiên riêng; đồ thị chính là đường thẳng này.';
          obliqueCalculation = 'Mẫu số không còn chứa x; hàm là đường thẳng, không có một đường xiên khác làm tiệm cận.';
          derivativeText = '\\(f^{\\prime}(x)=' + fmt(slope) + '\\)';
          if (slope > 0) {
            variationHtml = '<table class="variation-table"><tbody><tr><th>x</th><td>−∞</td><td>→ +∞</td><td>+∞</td></tr><tr><th>f′(x)</th><td colspan="3">+</td></tr><tr class="variation-values"><th>f(x)</th><td>−∞</td><td>↗</td><td>+∞</td></tr></tbody></table>';
          } else {
            variationHtml = '<table class="variation-table"><tbody><tr><th>x</th><td>−∞</td><td>→ +∞</td><td>+∞</td></tr><tr><th>f′(x)</th><td colspan="3">−</td></tr><tr class="variation-values"><th>f(x)</th><td>+∞</td><td>↘</td><td>−∞</td></tr></tbody></table>';
          }
        } else if (rf.c === 0 && rf.d !== 0 && rf.a === 0) {
          const constant = rf.b / rf.d;
          specialCaseTitle = 'Hàm hằng — đường thẳng ngang';
          specialCaseDescription = 'Vì c = 0 và a = 0, hàm bằng y = b/d = ' + fmt(constant) + ' trên toàn bộ tập xác định.';
          specialCaseProcedure = '<ol><li>Thay a = 0, c = 0: f(x) = b/d.</li><li>Tính b/d = ' + fmt(constant) + '.</li><li>Đồ thị là đường thẳng ngang y = ' + fmt(constant) + ' với mọi x; không có điểm khuyết.</li></ol>';
          explanation = 'Hàm số không đổi: y = ' + fmt(constant) + '.';
          obliqueCalculation = 'Không có; đồ thị là đường ngang.';
          derivativeText = '\\(f^{\\prime}(x)=0\\)';
          variationHtml = '<table class="variation-table"><tbody><tr><th>x</th><td>−∞</td><td>→ +∞</td><td>+∞</td></tr><tr><th>f′(x)</th><td colspan="3">0</td></tr><tr class="variation-values"><th>f(x)</th><td>' + fmt(constant) + '</td><td>→</td><td>' + fmt(constant) + '</td></tr></tbody></table>';
        } else {
          derivativeText = '\\(f^{\\prime}(x)=\\frac{' + fmt(determinant) + '}{\\left(' + linear(rf.c, rf.d) + '\\right)^2}\\)';
          obliqueText = 'Không có với hàm phân thức bậc nhất trên bậc nhất.';
          if (isHoleCase) {
            specialCaseTitle = 'Tử và mẫu cùng bằng 0 — có điểm khuyết (điểm thủng)';
            specialCaseDescription = 'Tại x = ' + fmt(x0) + ', tử số và mẫu số cùng bằng 0. Sau khi rút gọn, hàm bằng ' + fmt(rf.haY) + ' ở các điểm còn lại; điểm bị khuyết là (' + fmt(x0) + ', ' + fmt(rf.haY) + '), không phải tiệm cận đứng.';
            const numeratorRootSteps = rf.a !== 0
              ? 'Giải tử số ' + linear(rf.a, rf.b) + ' = 0 được x = ' + fmt(-rf.b / rf.a) + '.'
              : 'Tử số bằng 0 với mọi x (a = b = 0).';
            specialCaseProcedure = '<ol><li>Giải mẫu số ' + linear(rf.c, rf.d) + ' = 0 được x = ' + fmt(x0) + '.</li><li>' + numeratorRootSteps + ' Hai nghiệm trùng nhau, nên tử và mẫu cùng bằng 0 tại x = ' + fmt(x0) + '.</li><li>Rút gọn biểu thức ở các x khác ' + fmt(x0) + ': f(x) = ' + fmt(rf.haY) + '. Vì vậy điểm khuyết nằm tại (' + fmt(x0) + ', ' + fmt(rf.haY) + '); đánh dấu vòng tròn rỗng, không gọi là tiệm cận đứng.</li></ol>';
            explanation = 'Tử và mẫu cùng bằng 0 khi x = ' + fmt(x0) + '. Với mọi x khác giá trị đó, hàm bằng hằng số ' + fmt(rf.haY) + '; tại x đó hàm không xác định nên không có tiệm cận đứng.';
            verticalCalculation = 'Giải mẫu số bằng 0 được x = ' + fmt(x0) + ', tử số cũng bằng 0. Điểm bị khuyết là (' + fmt(x0) + ', ' + fmt(rf.haY) + '); không có tiệm cận đứng tại đó.';
            variationHtml = '<table class="variation-table"><tbody><tr><th>x</th><td>−∞</td><td></td><td>' + fmt(x0) + '</td><td></td><td>+∞</td></tr><tr><th>f′(x)</th><td colspan="2">0</td><td class="variation-break"></td><td colspan="2">0</td></tr><tr class="variation-values"><th>f(x)</th><td>' + fmt(rf.haY) + '</td><td>→</td><td class="variation-break"></td><td>→</td><td>' + fmt(rf.haY) + '</td></tr></tbody></table><p>Hàm không xác định tại x = ' + fmt(x0) + ', nhưng hai nhánh giữ cùng giá trị.</p>';
          } else {
            specialCaseTitle = 'Hàm phân thức chuẩn — có hai tiệm cận';
            specialCaseDescription = 'Vì c ≠ 0 và ad − bc ≠ 0, mẫu số có một nghiệm không làm tử số bằng 0; đồ thị có một tiệm cận đứng và một tiệm cận ngang.';
            specialCaseProcedure = '<ol><li>Giải mẫu số ' + linear(rf.c, rf.d) + ' = 0: x = ' + fmt(x0) + '. Thay vào tử được ' + fmt(rf.a * x0 + rf.b) + ' ≠ 0, nên có tiệm cận đứng x = ' + fmt(x0) + '.</li><li>Chia hệ số của x ở tử cho hệ số của x ở mẫu: a/c = ' + fmt(rf.haY) + ', nên tiệm cận ngang là y = ' + fmt(rf.haY) + '.</li><li>Tử và mẫu cùng bậc nhất nên không có tiệm cận xiên. Không có điểm khuyết vì ad − bc ≠ 0.</li></ol>';
            explanation = 'Hàm xác định với mọi x trừ x = ' + fmt(x0) + '. Dấu của ad − bc quyết định chiều biến thiên trên hai khoảng.';
            verticalCalculation = 'Giải ' + linear(rf.c, rf.d) + ' = 0 được x = ' + fmt(x0) + '. Tử số tại đây khác 0, nên x = ' + fmt(x0) + ' là tiệm cận đứng.';
            horizontalCalculation = 'Chia cả tử và mẫu cho x; khi x tiến đến ±∞, các số hạng b/x và d/x tiến về 0. Do đó giới hạn bằng a/c = ' + fmt(rf.haY) + ', nên y = ' + fmt(rf.haY) + ' là tiệm cận ngang.';
            obliqueCalculation = 'Chia đa thức được \\(f(x)=\\frac ac+\\frac{bc-ad}{c(cx+d)}\\). Số hạng phân thức tiến về \\(0\\), nên phần còn lại là hằng số; hàm số có tiệm cận ngang và không có tiệm cận xiên.';
            const goesUp = determinant > 0;
            const firstArrow = goesUp ? '↗ +∞' : '↘ −∞';
            const secondArrow = goesUp ? '−∞ ↗' : '+∞ ↘';
            const secondStart = goesUp ? '−∞' : '+∞';
            const sign = goesUp ? '+' : '−';
            variationHtml = '<table class="variation-table"><tbody><tr><th>x</th><td>−∞</td><td></td><td>' + fmt(x0) + '</td><td></td><td>+∞</td></tr><tr><th>f′(x)</th><td colspan="2">' + sign + '</td><td class="variation-break"></td><td colspan="2">' + sign + '</td></tr><tr class="variation-values"><th>f(x)</th><td>' + fmt(rf.haY) + '</td><td>' + firstArrow + '</td><td class="variation-break"></td><td>' + secondStart + (goesUp ? ' ↗' : ' ↘') + '</td><td>' + fmt(rf.haY) + '</td></tr></tbody></table>';
          }
        }
      }

      if (isInvalid) {
        specialCaseTitle = 'Biểu thức không xác định';
        specialCaseDescription = 'c = 0 và d = 0 làm mẫu số luôn bằng 0, nên không có tập xác định và không thể khảo sát đồ thị.';
        specialCaseProcedure = '<ol><li>Thay c = 0, d = 0 vào mẫu: cx + d = 0 với mọi x.</li><li>Không có giá trị x nào làm mẫu khác 0, nên hàm không có tập xác định; không thể tìm điểm khuyết hay các tiệm cận.</li></ol>';
        explanation = 'c = 0 và d = 0 nên mẫu số luôn bằng 0; hàm số không xác định với mọi x.';
        verticalText = 'Không xác định';
        horizontalText = 'Không xác định';
        obliqueText = 'Không xác định';
        derivativeText = 'Không xác định';
        verticalCalculation = 'Không thể tìm tiệm cận vì biểu thức không xác định với mọi x.';
        horizontalCalculation = 'Không thể tính giới hạn của hàm số này.';
        obliqueCalculation = 'Không thể khảo sát.';
      }

      const surveyDetails = this.computeFunctionSurvey(rf);

      slot.innerHTML = `
        <div class="prompt-card sandbox-investigation-heading">
          <span class="prompt-badge">KHẢO SÁT HÀM SỐ</span>
          <div class="prompt-question">Nhập bốn hệ số, bấm “Khảo sát”, rồi đọc các kết quả và bảng biến thiên bên dưới.</div>
          <div class="sandbox-formula-reminder">Dạng hàm số: <strong>$f(x) = \\dfrac{ax + b}{cx + d}$</strong></div>
        </div>
        <form id="sandbox-coefficient-form" class="sandbox-coefficient-form">
          <label>a <input type="text" name="a" class="math-keypad-input" data-label="Hệ số a" value="${inputValues.a}" placeholder="Nhập a" autocomplete="off" required></label>
          <label>b <input type="text" name="b" class="math-keypad-input" data-label="Hệ số b" value="${inputValues.b}" placeholder="Nhập b" autocomplete="off" required></label>
          <label>c <input type="text" name="c" class="math-keypad-input" data-label="Hệ số c" value="${inputValues.c}" placeholder="Nhập c" autocomplete="off" required></label>
          <label>d <input type="text" name="d" class="math-keypad-input" data-label="Hệ số d" value="${inputValues.d}" placeholder="Nhập d" autocomplete="off" required></label>
          <button class="btn-action-primary" type="submit">Khảo sát hàm số</button>
        </form>
        ${hasResults ? `
        <section class="sandbox-results-card">
          ${surveyDetails ? (() => {
            const xva_latex = this.formatFractionLatex(-rf.d, rf.c);
            const yha_latex = this.formatFractionLatex(rf.a, rf.c);
            const rightLimitStr = determinant < 0 ? '+\\infty' : '-\\infty';
            const leftLimitStr = determinant < 0 ? '-\\infty' : '+\\infty';
            const bbtSvg = this.generateBbtSvg(rf);
            const oyText = rf.d !== 0
              ? `Giao điểm của đồ thị hàm số với trục tung là điểm \\(\\left(0;\\, ${this.formatFractionLatex(rf.b, rf.d)}\\right)\\).`
              : 'Trục tung chính là đường tiệm cận đứng \\(x = 0\\) nên đồ thị không cắt trục tung.';
            const oxText = rf.a !== 0
              ? `Giao điểm của đồ thị hàm số với trục hoành là điểm \\(\\left(${this.formatFractionLatex(-rf.b, rf.a)};\\, 0\\right)\\).`
              : 'Trục hoành chính là đường tiệm cận ngang \\(y = 0\\) nên đồ thị không cắt trục hoành.';
            const symmetryText = `Đồ thị hàm số nhận giao điểm \\(I\\left(${xva_latex};\\, ${yha_latex}\\right)\\) của hai đường tiệm cận làm tâm đối xứng và nhận hai đường phân giác của các góc tạo bởi hai đường tiệm cận này làm trục đối xứng.`;

            return `
              <h3 style="margin: 0 0 10px; font-size: 15px; color: var(--primary);">KẾT QUẢ KHẢO SÁT HÀM SỐ (CHUẨN SGK TOÁN 12)</h3>
              <div class="sandbox-function-display" style="margin: 8px 0 14px; font-size: 17px; text-align: center;">
                \\[f(x) = \\dfrac{${linear(rf.a, rf.b)}}{${linear(rf.c, rf.d)}}\\]
              </div>

              <div style="margin-bottom: 14px; line-height: 1.65; font-size: 13.5px;">
                <p style="margin: 4px 0;"><strong>1. Tập xác định:</strong> \\(D = \\mathbb{R} \\setminus \\left\\{${xva_latex}\\right\\}\\).</p>
                <p style="margin: 8px 0 4px;"><strong>2. Đạo hàm và sự biến thiên:</strong></p>
                <div class="math-proof-equation" style="margin: 6px 0;">
                  \\[y' = f'(x) = \\dfrac{${fmt(determinant)}}{\\left(${linear(rf.c, rf.d)}\\right)^2}\\]
                </div>
                <p style="margin: 4px 0;">• Vì \\(ad - bc = ${fmt(determinant)} ${determinant > 0 ? '> 0' : '< 0'}\\) nên \\(y' ${determinant > 0 ? '> 0' : '< 0'}, \\; \\forall x \\ne ${xva_latex}\\).</p>
                <p style="margin: 4px 0;">• Hàm số <strong>${determinant > 0 ? 'đồng biến' : 'nghịch biến'}</strong> trên từng khoảng \\((-\\infty;\\, ${xva_latex})\\) và \\((${xva_latex};\\, +\\infty)\\).</p>
                <p style="margin: 4px 0;">• Hàm số không có cực trị.</p>
              </div>

              <div style="margin-bottom: 14px; line-height: 1.65; font-size: 13.5px;">
                <p style="margin: 4px 0 6px;"><strong>3. Các đường tiệm cận:</strong></p>
                <p style="margin: 4px 0;">• <strong>Tiệm cận đứng:</strong></p>
                <div class="math-proof-equation" style="margin: 6px 0;">
                  \\[\\lim_{x \\to \\left(${xva_latex}\\right)^+} f(x) = ${rightLimitStr} \\quad\\text{và}\\quad \\lim_{x \\to \\left(${xva_latex}\\right)^-} f(x) = ${leftLimitStr}\\]
                </div>
                <p style="margin: 4px 0;">\\(x = ${xva_latex}\\) là <strong>đường tiệm cận đứng</strong> của đồ thị hàm số.</p>

                <p style="margin: 10px 0 4px;">• <strong>Tiệm cận ngang:</strong></p>
                <div class="math-proof-equation" style="margin: 6px 0;">
                  \\[\\lim_{x \\to +\\infty} f(x) = \\lim_{x \\to +\\infty} \\dfrac{a + \\frac{b}{x}}{c + \\frac{d}{x}} = ${yha_latex}, \\qquad \\lim_{x \\to -\\infty} f(x) = ${yha_latex}\\]
                </div>
                <p style="margin: 4px 0;">\\(y = ${yha_latex}\\) là <strong>đường tiệm cận ngang</strong> của đồ thị hàm số.</p>

                <p style="margin: 10px 0 4px;">• <strong>Tiệm cận xiên:</strong> Do bậc tử bằng bậc mẫu (bậc 1), hàm số <strong>không có tiệm cận xiên</strong>.</p>
              </div>

              <div style="margin-bottom: 14px;">
                <p style="margin: 6px 0 6px; font-weight: bold; font-size: 13.5px;">4. Bảng biến thiên:</p>
                ${bbtSvg}
              </div>

              <div style="margin: 14px 0 10px; line-height: 1.7; font-size: 13.5px;">
                <p style="margin: 4px 0;">• ${oyText}</p>
                <p style="margin: 4px 0;">• ${oxText}</p>
                <p style="margin: 4px 0;">• ${symmetryText}</p>
              </div>

              <p style="margin: 14px 0 6px; font-style: italic; color: var(--text-muted); text-align: center; font-size: 13px;">
                (Đồ thị được trình bày bên trên)
              </p>
            `;
          })() : `
          <h3 style="margin: 0 0 10px; font-size: 14px; color: var(--primary);">KẾT QUẢ KHẢO SÁT</h3>
          <p class="sandbox-function-display">${fOfX}</p>
          <div class="sandbox-derivative"><strong>Đạo hàm:</strong> ${derivativeText}</div>
          <h3 class="sandbox-variation-title" style="margin-top:10px;">BẢNG BIẾN THIÊN</h3>
          <div class="variation-table-scroll">${variationHtml}</div>
          <section class="sandbox-special-case" style="margin-top:16px;">
            <h4>Trường hợp của hàm số</h4>
            <strong>${specialCaseTitle}</strong>
            <p>${specialCaseDescription}</p>
            <h4>Cách xác định</h4>
            <p class="sandbox-procedure-intro">Làm lần lượt các bước dưới đây với hệ số em vừa nhập:</p>
            ${specialCaseProcedure}
            <h4>Kiểm tra ba loại tiệm cận</h4>
            <div class="sandbox-result-grid">
              <div><span>Tiệm cận đứng</span><strong>${verticalText}</strong><p>${verticalCalculation}</p></div>
              <div><span>Tiệm cận ngang</span><strong>${horizontalText}</strong><p>${horizontalCalculation}</p></div>
              <div class="sandbox-oblique-result"><span>Tiệm cận xiên</span><strong>${obliqueText}</strong><p>${obliqueCalculation}</p></div>
            </div>
          </section>
          `}
        </section>
        ` : '<p class="sandbox-empty-state">Nhập các hệ số rồi bấm <strong>Khảo sát hàm số</strong>. Kết quả chưa hiển thị trước khi em thực hiện phép tính.</p>'}
      `;

      document.getElementById('sandbox-coefficient-form').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const rawValues = ['a', 'b', 'c', 'd'].map(key => form.elements[key].value.trim());
        const values = rawValues.map(raw => this.parseMathExpression(raw));
        if (values.some(value => !Number.isFinite(value))) {
          alert('Hãy nhập số hợp lệ cho cả bốn hệ số a, b, c, d (ví dụ: 2, -1, 3/2, √4).');
          return;
        }
        this.sandboxInputValues = { a: rawValues[0], b: rawValues[1], c: rawValues[2], d: rawValues[3] };
        this.sandboxSubmitted = true;
        this.rf = new RationalFunction(values[0], values[1], values[2], values[3]);
        this.graphEngine.setFunction(this.rf);
        const nextX = this.rf.vaX !== null ? this.rf.vaX + 1 : 2;
        this.graphEngine.setPointX(nextX);
        this.updateFormulaText();
        this.renderSandbox(slot);
      });
      this.renderMath(slot);
    }

    updateTelemetryValues(xVal) {
      const telX = document.getElementById('tel-x');
      const telFx = document.getElementById('tel-fx');
      if (telX && telFx) {
        telX.textContent = xVal.toFixed(2);
        const yVal = this.rf.evaluate(xVal);
        telFx.textContent = (yVal !== null && isFinite(yVal)) ? yVal.toFixed(2) : 'Không xác định (gián đoạn)';
      }
    }

    applyDirectXInput(raw) {
      if (raw === undefined || raw === null) return;
      const s = raw.toString().trim().toLowerCase().replace(/\s+/g, '');
      if (!s) return;
      
      // Kiểm tra vô cực dương
      if (s === '+inf' || s === 'inf' || s === '+∞' || s === '+\\infty' || s === 'vocuc' || s === 'duongvocuc') {
        this.setInfinityMode('p_inf');
        return;
      }
      // Kiểm tra vô cực âm
      if (s === '-inf' || s === '-∞' || s === '-\\infty' || s === '-vocuc' || s === 'amvocuc') {
        this.setInfinityMode('m_inf');
        return;
      }

      let num = this.parseMathExpression(s);
      if (isNaN(num)) {
        alert('Vui lòng nhập một số hoặc biểu thức hợp lệ (ví dụ: 1000, 3/2, √4, -500, +∞, -∞)!');
        return;
      }

      // Mở rộng biên scrubber nếu cần
      const scrubber = document.getElementById('global-x-scrubber');
      const minLabel = document.getElementById('scrubber-min-label');
      const maxLabel = document.getElementById('scrubber-max-label');
      if (scrubber) {
        if (num < Number(scrubber.min)) {
          scrubber.min = Math.floor(num * 1.2);
          if (minLabel) minLabel.textContent = scrubber.min.toString();
        }
        if (num > Number(scrubber.max)) {
          scrubber.max = Math.ceil(num * 1.2);
          if (maxLabel) maxLabel.textContent = scrubber.max.toString();
        }
        scrubber.value = num;
      }

      const badge = document.getElementById('slider-x-val-badge');
      if (badge) badge.textContent = 'x = ' + (Math.abs(num) >= 1000 ? num.toExponential(2) : num.toFixed(2));

      const input = document.getElementById('global-x-input');
      if (input) input.value = Math.abs(num) >= 1000 ? num.toExponential(2) : num.toString();

      this.graphEngine.setPointX(num);
      this.updatePointMTelemetry(num);
      this.updateTelemetryValues(num);
    }

    setInfinityMode(dir) {
      const isPositive = (dir === 'p_inf');
      const badge = document.getElementById('slider-x-val-badge');
      if (badge) badge.textContent = isPositive ? 'x ➔ +∞' : 'x ➔ -∞';

      const input = document.getElementById('global-x-input');
      if (input) input.value = isPositive ? '+∞' : '-∞';

      // Đặt x điểm M trên đồ thị ra xa
      const largeX = isPositive ? 1000 : -1000;
      this.graphEngine.setPointX(largeX);
      this.updatePointMTelemetry(isPositive ? '+inf' : '-inf');
      this.updateTelemetryValues(largeX);
    }

    updatePointMTelemetry(xVal) {
      const box = document.getElementById('point-m-telemetry-box');
      if (!box) return;

      const rf = this.rf;
      if (rf.isUndefined) {
        box.innerHTML = `
          <div style="color: var(--color-tcd); font-weight: 700;">
            ⚠️ Biểu thức không xác định với mọi x ($D = \\emptyset$).
          </div>
        `;
        return;
      }

      // Khảo sát vô cực dương
      if (xVal === '+inf' || xVal === Infinity) {
        const haY = rf.haY;
        box.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: 800; color: var(--color-tcn);">⚡ KHẢO SÁT TẠI DƯƠNG VÔ CỰC ($x \\to +\\infty$)</span>
            <button id="btn-telemetry-focus-m" class="chip-btn" style="font-size: 11px;">📍 Về gốc O</button>
          </div>
          <div style="font-size: 12.5px; color: var(--text-main); line-height: 1.5;">
            • Tung độ tiệm cận: <strong>$f(x) \\to ${haY !== null ? haY.toFixed(2) : 'Không có'}$</strong><br>
            • Nhận xét: Khi $x$ tiến ra xa vô tận bên phải, khoảng cách từ đồ thị tới Tiệm cận ngang ép sát về 0 ($|f(x) - y_{\\text{TCN}}| \\to 0$).
          </div>
        `;
        const btnFocus = document.getElementById('btn-telemetry-focus-m');
        if (btnFocus) btnFocus.addEventListener('click', () => this.graphEngine.centerAtOrigin());
        this.renderMath(box);
        return;
      }

      // Khảo sát vô cực âm
      if (xVal === '-inf' || xVal === -Infinity) {
        const haY = rf.haY;
        box.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: 800; color: var(--color-tcn);">⚡ KHẢO SÁT TẠI ÂM VÔ CỰC ($x \\to -\\infty$)</span>
            <button id="btn-telemetry-focus-m" class="chip-btn" style="font-size: 11px;">📍 Về gốc O</button>
          </div>
          <div style="font-size: 12.5px; color: var(--text-main); line-height: 1.5;">
            • Tung độ tiệm cận: <strong>$f(x) \\to ${haY !== null ? haY.toFixed(2) : 'Không có'}$</strong><br>
            • Nhận xét: Khi $x$ lùi xa vô tận bên trái, khoảng cách từ đồ thị tới Tiệm cận ngang ép sát về 0 ($|f(x) - y_{\\text{TCN}}| \\to 0$).
          </div>
        `;
        const btnFocus = document.getElementById('btn-telemetry-focus-m');
        if (btnFocus) btnFocus.addEventListener('click', () => this.graphEngine.centerAtOrigin());
        this.renderMath(box);
        return;
      }

      const numX = Number(xVal);
      const numY = rf.evaluate(numX);

      // Điểm gián đoạn tại nghiệm của mẫu số
      if (numY === null || !isFinite(numY)) {
        if (rf.isDegenerateHole) {
          box.innerHTML = `
            <div style="color: var(--accent); font-weight: 700; margin-bottom: 4px;">
              ⚠️ TẠI $x = ${numX.toFixed(2)}$: ĐIỂM KHUYẾT (LỖ THỦNG, KHÔNG CÓ TCĐ)
            </div>
            <div style="font-size: 12px; color: var(--text-muted); line-height: 1.45;">
              Vì $ad - bc = 0$, tử số và mẫu số cùng triệt tiêu tại $x = ${numX.toFixed(2)}$. Đồ thị là đường thẳng có một điểm khuyết tại $(${rf.holeX !== null ? rf.holeX.toFixed(2) : numX.toFixed(2)};\\, ${rf.holeY !== null ? rf.holeY.toFixed(2) : ''})$, hoàn toàn <strong>không có tiệm cận đứng</strong>.
            </div>
          `;
        } else if (rf.isUndefined) {
          box.innerHTML = `
            <div style="color: var(--color-tcd); font-weight: 700; margin-bottom: 4px;">
              ⚠️ BIỂU THỨC KHÔNG XÁC ĐỊNH
            </div>
            <div style="font-size: 12px; color: var(--text-muted); line-height: 1.45;">
              Hàm số không xác định tại bất kỳ điểm nào vì mẫu số luôn bằng 0 ($c = 0, d = 0$).
            </div>
          `;
        } else {
          box.innerHTML = `
            <div style="color: var(--color-tcd); font-weight: 700; margin-bottom: 4px;">
              ⚠️ TẠI $x = ${numX.toFixed(2)}$: MẪU SỐ BẰNG 0 (TIỆM CẬN ĐỨNG)
            </div>
            <div style="font-size: 12px; color: var(--text-muted); line-height: 1.45;">
              Tại vị trí này mẫu số bằng 0 trong khi tử số khác 0 ($ad - bc \\ne 0$). Đồ thị bị xẻ làm 2 nhánh vút lên/chìm sâu vô cực tạo thành <strong>Tiệm cận đứng $x = ${numX.toFixed(2)}$</strong>.
            </div>
          `;
        }
        this.renderMath(box);
        return;
      }

      const distVA = rf.vaX !== null ? Math.abs(numX - rf.vaX) : null;
      const distHA = rf.haY !== null ? Math.abs(numY - rf.haY) : null;

      let insightNote = '';
      if (Math.abs(numX) >= 50) {
        const distStr = distHA !== null ? (distHA < 0.0001 ? distHA.toExponential(2) : distHA.toFixed(4)) : '0';
        insightNote = `🔍 <strong>Quan sát khi x rất lớn:</strong> Với $x = ${numX.toLocaleString()}$, tung độ $f(x) = ${numY.toFixed(5)}$, khoảng cách tới TCN $y = ${rf.haY !== null ? rf.haY.toFixed(2) : ''}$ chỉ còn $\\Delta y = ${distStr}$, chứng minh đồ thị ép sát vào Tiệm cận ngang!`;
      } else if (distVA !== null && distVA < 0.1) {
        insightNote = `🔍 <strong>Quan sát khi x sát TCĐ:</strong> $x$ chỉ cách $x_{\\text{TCĐ}} = ${rf.vaX.toFixed(2)}$ một khoảng $\\Delta x = ${distVA.toFixed(4)}$. Mẫu số rất bé khiến tung độ vọt lên/xuống $f(x) = ${numY.toFixed(1)}$ (${numY > 0 ? '+∞' : '-∞'}), ép sát vào Tiệm cận đứng!`;
      } else {
        insightNote = `💡 Điểm $M(${numX.toFixed(2)}, ${numY.toFixed(2)})$ đang nằm trên đồ thị. Kéo trục x hoặc click kéo trực tiếp trên Canvas để quan sát chuyển động.`;
      }

      const strX = Math.abs(numX) >= 1000 ? numX.toExponential(2) : numX.toFixed(2);
      const strY = Math.abs(numY) >= 1000 ? numY.toExponential(2) : numY.toFixed(2);
      const strDistVA = distVA !== null ? (distVA >= 1000 ? distVA.toExponential(2) : distVA.toFixed(2)) : 'Không có';
      const strDistHA = distHA !== null ? (distHA < 0.0001 ? distHA.toExponential(2) : distHA.toFixed(4)) : 'Không có';

      box.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
          <div style="display: flex; gap: 12px; font-family: var(--font-mono); font-size: 12px; font-weight: 700;">
            <span style="color: var(--color-point);">Tọa độ: M(${strX}, ${strY})</span>
            <span style="color: var(--color-tcd);">Cách TCĐ: ${strDistVA}</span>
            <span style="color: var(--color-tcn);">Cách TCN: ${strDistHA}</span>
          </div>
          <button id="btn-telemetry-focus-m" class="chip-btn" style="font-size: 11px; padding: 2px 8px;" title="Căn góc nhìn Canvas đến vị trí của điểm M">
            📍 Đến điểm M
          </button>
        </div>
        <div style="font-size: 12px; color: var(--text-main); line-height: 1.45;">
          ${insightNote}
        </div>
      `;

      const btnFocus = document.getElementById('btn-telemetry-focus-m');
      if (btnFocus) {
        btnFocus.addEventListener('click', () => {
          this.graphEngine.centerAtPointM();
        });
      }

      this.renderMath(box);
    }

    parseMathExpression(raw) {
      return parseMathExpression(raw);
    }

    shuffleArray(arr) {
      return shuffleArray(arr);
    }

    // =========================================================================
    // BÀN PHÍM ẢO TOÁN HỌC (VIRTUAL MATH KEYPAD) CHO THIẾT BỊ DI ĐỘNG & BÀI TẬP INPUT
    // Hỗ trợ nhập số, dấu âm (-), phân số (/), dấu căn (√), số thập phân (.), đổi dấu (±)
    // =========================================================================
    initMathKeypad() {
      if (document.getElementById('math-keypad-container')) return;

      const keypadContainer = document.createElement('div');
      keypadContainer.id = 'math-keypad-container';
      keypadContainer.className = 'math-keypad-container';
      keypadContainer.setAttribute('aria-hidden', 'true');

      keypadContainer.innerHTML = `
        <div class="math-keypad-backdrop" id="math-keypad-backdrop"></div>
        <div class="math-keypad-sheet">
          <div class="math-keypad-header">
            <div class="math-keypad-title-wrap">
              <span class="math-keypad-icon">⌨️</span>
              <div class="math-keypad-info">
                <span class="math-keypad-title">BÀN PHÍM TOÁN HỌC</span>
                <span id="math-keypad-target-label" class="math-keypad-target-label">Đang nhập dữ liệu</span>
              </div>
            </div>
            <div class="math-keypad-display" id="math-keypad-display">
              <span class="math-keypad-display-val" id="math-keypad-display-val"></span>
              <span class="math-keypad-display-preview" id="math-keypad-display-preview"></span>
            </div>
            <button type="button" class="math-keypad-close-btn" id="btn-close-math-keypad" title="Đóng bàn phím">✕</button>
          </div>
          <div class="math-keypad-grid">
            <button type="button" class="math-key" data-key="7">7</button>
            <button type="button" class="math-key" data-key="8">8</button>
            <button type="button" class="math-key" data-key="9">9</button>
            <button type="button" class="math-key math-key-op" data-key="/" title="Phân số">/</button>
            <button type="button" class="math-key math-key-func" data-key="backspace" title="Xóa một ký tự">⌫</button>

            <button type="button" class="math-key" data-key="4">4</button>
            <button type="button" class="math-key" data-key="5">5</button>
            <button type="button" class="math-key" data-key="6">6</button>
            <button type="button" class="math-key math-key-op" data-key="-" title="Dấu trừ / âm">−</button>
            <button type="button" class="math-key math-key-func" data-key="clear" title="Xóa toàn bộ">C</button>

            <button type="button" class="math-key" data-key="1">1</button>
            <button type="button" class="math-key" data-key="2">2</button>
            <button type="button" class="math-key" data-key="3">3</button>
            <button type="button" class="math-key math-key-op" data-key="√" title="Dấu căn bậc hai">√</button>
            <button type="button" class="math-key" data-key=".">.</button>

            <button type="button" class="math-key math-key-op" data-key="±" title="Đổi dấu âm / dương">±</button>
            <button type="button" class="math-key" data-key="0">0</button>
            <button type="button" class="math-key math-key-nav" data-key="next" title="Chuyển sang ô tiếp theo">➔ Tiếp</button>
            <button type="button" class="math-key math-key-done" data-key="done" title="Xác nhận xong">✓ Xong</button>
          </div>
        </div>
      `;

      document.body.appendChild(keypadContainer);

      document.getElementById('math-keypad-backdrop').addEventListener('click', () => this.closeMathKeypad());
      document.getElementById('btn-close-math-keypad').addEventListener('click', () => this.closeMathKeypad());

      keypadContainer.querySelectorAll('.math-key').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const key = btn.dataset.key;
          this.handleMathKey(key);
        });
      });

      // Trên PC: Tự động bám theo ô nhập khi cuộn trang hoặc đổi kích thước
      window.addEventListener('resize', () => {
        if (this.activeMathInput && window.innerWidth > 767) {
          const sheet = document.querySelector('.math-keypad-sheet');
          this.positionKeypadOnPC(this.activeMathInput, sheet);
        } else if (this.activeMathInput) {
          const sheet = document.querySelector('.math-keypad-sheet');
          if (sheet) {
            sheet.style.top = ''; sheet.style.left = ''; sheet.style.right = ''; sheet.style.bottom = '';
          }
        }
      });

      window.addEventListener('scroll', () => {
        if (this.activeMathInput && window.innerWidth > 767) {
          const sheet = document.querySelector('.math-keypad-sheet');
          this.positionKeypadOnPC(this.activeMathInput, sheet);
        }
      }, true);
    }

    openMathKeypad(input, customLabel) {
      if (!input) return;
      this.initMathKeypad();
      this.activeMathInput = input;

      const container = document.getElementById('math-keypad-container');
      const sheet = container ? container.querySelector('.math-keypad-sheet') : null;
      if (!container || !sheet) return;

      const labelEl = document.getElementById('math-keypad-target-label');
      const label = customLabel || input.dataset.label || input.getAttribute('placeholder') || 'Nhập giá trị';
      if (labelEl) labelEl.textContent = label;

      this.updateKeypadDisplay();
      container.classList.add('open');
      container.setAttribute('aria-hidden', 'false');

      // Trên PC: định vị bàn phím cạnh phép tính / ô nhập liệu
      if (window.innerWidth > 767) {
        this.positionKeypadOnPC(input, sheet);
      } else {
        sheet.style.top = '';
        sheet.style.left = '';
        sheet.style.right = '';
        sheet.style.bottom = '';
        setTimeout(() => {
          if (typeof input.scrollIntoView === 'function') {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }

    positionKeypadOnPC(input, sheet) {
      if (!input || !sheet) return;
      const wrap = input.closest('.input-with-keypad-wrap') || input;
      const rect = wrap.getBoundingClientRect();
      const sheetWidth = 320;
      const sheetHeight = 295;
      const pad = 12;

      let top = rect.top;
      let left = rect.right + pad;

      // Nếu ô nhập nằm ở nửa phải màn hình (cột bài tập/phép tính), đặt bàn phím ở bên trái ô nhập liệu
      if (rect.right + sheetWidth + pad > window.innerWidth) {
        if (rect.left - sheetWidth - pad >= 10) {
          left = rect.left - sheetWidth - pad;
        } else {
          left = Math.max(10, Math.min(window.innerWidth - sheetWidth - 10, rect.left));
          top = (rect.bottom + sheetHeight + pad <= window.innerHeight)
            ? rect.bottom + pad
            : Math.max(10, rect.top - sheetHeight - pad);
        }
      }

      // Giới hạn biên màn hình trên/dưới
      if (top + sheetHeight > window.innerHeight - 10) {
        top = Math.max(10, window.innerHeight - sheetHeight - 10);
      }
      if (top < 10) top = 10;

      sheet.style.position = 'fixed';
      sheet.style.left = `${Math.round(left)}px`;
      sheet.style.top = `${Math.round(top)}px`;
      sheet.style.right = 'auto';
      sheet.style.bottom = 'auto';
    }

    closeMathKeypad() {
      const container = document.getElementById('math-keypad-container');
      if (container) {
        container.classList.remove('open');
        container.setAttribute('aria-hidden', 'true');
      }
      this.activeMathInput = null;
    }

    handleMathKey(key) {
      if (!this.activeMathInput) return;
      const input = this.activeMathInput;
      let val = input.value || '';

      if (key === 'done') {
        this.closeMathKeypad();
        if (input.id === 'global-x-input') {
          const btnApply = document.getElementById('btn-apply-global-x');
          if (btnApply) btnApply.click();
        }
        return;
      }

      if (key === 'next') {
        const allInputs = Array.from(document.querySelectorAll('.math-keypad-input'));
        const idx = allInputs.indexOf(input);
        if (idx !== -1 && idx < allInputs.length - 1) {
          this.openMathKeypad(allInputs[idx + 1]);
        } else {
          this.closeMathKeypad();
        }
        return;
      }

      if (key === 'clear') {
        input.value = '';
      } else if (key === 'backspace') {
        input.value = val.slice(0, -1);
      } else if (key === '±') {
        if (val.startsWith('-')) {
          input.value = val.slice(1);
        } else {
          input.value = '-' + val;
        }
      } else if (key === '-') {
        input.value = val + '-';
      } else if (key === '/') {
        if (!val.includes('/')) {
          input.value = val + '/';
        }
      } else if (key === '√') {
        input.value = val + '√';
      } else if (key === '.') {
        input.value = val + '.';
      } else {
        input.value = val + key;
      }

      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      this.updateKeypadDisplay();
    }

    updateKeypadDisplay() {
      const valEl = document.getElementById('math-keypad-display-val');
      const prevEl = document.getElementById('math-keypad-display-preview');
      if (!valEl || !prevEl || !this.activeMathInput) return;

      const raw = this.activeMathInput.value || '';
      valEl.textContent = raw ? raw : '0';

      if (!raw) {
        prevEl.textContent = '';
        return;
      }

      const parsed = parseMathExpression(raw);
      if (!isNaN(parsed) && isFinite(parsed)) {
        const fmt = Number.isInteger(parsed) ? parsed.toString() : parsed.toFixed(2).replace(/\.?0+$/, '');
        if (raw !== fmt) {
          prevEl.textContent = `≈ ${fmt}`;
        } else {
          prevEl.textContent = '';
        }
      } else {
        prevEl.textContent = '';
      }
    }

    bindMathKeypadInputs(scope = document) {
      scope.querySelectorAll('.math-keypad-input').forEach(input => {
        if (input.dataset.keypadBound === 'true') return;
        input.dataset.keypadBound = 'true';
        input.addEventListener('focus', () => {
          this.openMathKeypad(input);
        });
        input.addEventListener('input', () => {
          if (this.activeMathInput === input) {
            this.updateKeypadDisplay();
          }
        });
      });

      scope.querySelectorAll('.btn-keypad-trigger').forEach(btn => {
        if (btn.dataset.keypadBound === 'true') return;
        btn.dataset.keypadBound = 'true';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const targetId = btn.dataset.target;
          const target = document.getElementById(targetId);
          if (target) {
            target.focus();
            this.openMathKeypad(target);
          }
        });
      });
    }
  }

  // Xuất các lớp và tiện ích ra window để phục vụ kiểm thử tự động (tests.html) và mở rộng
  window.RationalFunction = RationalFunction;
  window.InteractiveGraphEngine = InteractiveGraphEngine;
  window.AsymptoteLabApp = AsymptoteLabApp;
  window.parseMathExpression = parseMathExpression;
  window.shuffleArray = shuffleArray;

  window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('app-root')) {
      window.AsymptoteLab = new AsymptoteLabApp();
    }
  });
})();
