/**
 * RationalFunction.js
 * Represents f(x) = (ax + b) / (cx + d)
 * 
 * Handles 4 mathematical cases:
 * CASE 01: c != 0 and ad - bc != 0 => Standard hyperbola rational function
 * CASE 02: c == 0 and d != 0       => Linear or constant function f(x) = (a/d)*x + (b/d)
 * CASE 03: ad - bc == 0 and c != 0 => Removable discontinuity (Hole at x = -d/c, y = a/c)
 * CASE 04: c == 0 and d == 0       => Undefined division by zero
 */

export class RationalFunction {
  constructor(a = 2, b = 1, c = 1, d = 3) {
    this.setCoefficients(a, b, c, d);
  }

  setCoefficients(a, b, c, d) {
    this.a = Number(a);
    this.b = Number(b);
    this.c = Number(c);
    this.d = Number(d);
    this.determinant = this.a * this.d - this.b * this.c; // ad - bc
    this.analyzeCase();
  }

  analyzeCase() {
    if (this.c === 0 && this.d === 0) {
      this.caseType = 'UNDEFINED'; // Case 04
      this.isDefined = false;
      this.hasVerticalAsymptote = false;
      this.hasHorizontalAsymptote = false;
      this.isHole = false;
    } else if (this.c === 0 && this.d !== 0) {
      this.caseType = 'LINEAR'; // Case 02
      this.isDefined = true;
      this.hasVerticalAsymptote = false;
      this.hasHorizontalAsymptote = (this.a === 0);
      this.horizontalAsymptoteY = this.a === 0 ? this.b / this.d : null;
      this.verticalAsymptoteX = null;
      this.isHole = false;
    } else if (Math.abs(this.determinant) < 1e-9 && this.c !== 0) {
      this.caseType = 'REMOVABLE_DISCONTINUITY'; // Case 03: Hole
      this.isDefined = true;
      this.hasVerticalAsymptote = false;
      this.isHole = true;
      this.holeX = -this.d / this.c;
      this.holeY = this.a / this.c;
      this.hasHorizontalAsymptote = true; // Với c != 0, giới hạn khi x -> vô cực vẫn là a/c
      this.horizontalAsymptoteY = this.a / this.c;
      this.verticalAsymptoteX = null;
    } else {
      this.caseType = 'STANDARD_RATIONAL'; // Case 01
      this.isDefined = true;
      this.hasVerticalAsymptote = true;
      this.verticalAsymptoteX = -this.d / this.c;
      this.hasHorizontalAsymptote = true;
      this.horizontalAsymptoteY = this.a / this.c;
      this.isHole = false;
    }
  }

  /**
   * Evaluates f(x)
   * @param {number} x
   * @returns {number|null} f(x) or null if out of domain
   */
  evaluate(x) {
    if (!this.isDefined) return null;

    const denominator = this.c * x + this.d;
    if (Math.abs(denominator) < 1e-12) {
      return null; // Singularity or Hole
    }

    if (this.c === 0) {
      return (this.a * x + this.b) / this.d;
    }

    if (this.isHole) {
      if (Math.abs(x - this.holeX) < 1e-9) return null;
      return this.holeY;
    }

    return (this.a * x + this.b) / denominator;
  }

  /**
   * Derivative f'(x)
   * slope = f'(x) = (ad - bc) / (cx + d)^2 (when c != 0)
   * or a / d (when c == 0)
   * @param {number} x
   * @returns {number|null}
   */
  derivative(x) {
    if (!this.isDefined) return null;

    const denominator = this.c * x + this.d;
    if (Math.abs(denominator) < 1e-12) return null;

    if (this.c === 0) {
      return this.a / this.d;
    }

    if (this.isHole) {
      if (Math.abs(x - this.holeX) < 1e-9) return null;
      return 0; // Constant line f(x) = const has slope 0
    }

    return this.determinant / (denominator * denominator);
  }

  /**
   * Computes aircraft visual pitch from derivative
   * slope = f'(x) => pitch = Math.atan(slope) * pitchScale
   * @param {number} x
   * @param {number} pitchScale
   * @returns {number} pitch in radians
   */
  getVisualPitch(x, pitchScale = 0.8) {
    const slope = this.derivative(x);
    if (slope === null || !Number.isFinite(slope)) {
      return 0;
    }
    // Clamp slope to prevent extreme flip
    const clampedSlope = Math.max(-50, Math.min(50, slope));
    return Math.atan(clampedSlope) * pitchScale;
  }

  /**
   * Distance to vertical asymptote (null if no VA)
   * @param {number} x
   * @returns {number|null}
   */
  distanceToVerticalAsymptote(x) {
    if (!this.hasVerticalAsymptote || this.verticalAsymptoteX === null) {
      return null;
    }
    return Math.abs(x - this.verticalAsymptoteX);
  }

  /**
   * Returns human-readable formula string
   * Example: "(2x + 1) / (x + 3)"
   */
  toExpressionString() {
    if (this.caseType === 'UNDEFINED') return 'Undefined (0/0)';

    const formatPoly = (coeff, constTerm) => {
      let parts = [];
      if (coeff !== 0) {
        if (coeff === 1) parts.push('x');
        else if (coeff === -1) parts.push('-x');
        else parts.push(`${coeff}x`);
      }
      if (constTerm !== 0 || parts.length === 0) {
        if (parts.length > 0) {
          parts.push(constTerm > 0 ? `+ ${constTerm}` : `- ${Math.abs(constTerm)}`);
        } else {
          parts.push(`${constTerm}`);
        }
      }
      return parts.join(' ');
    };

    const num = formatPoly(this.a, this.b);
    if (this.c === 0) {
      return this.d === 1 ? num : `(${num}) / ${this.d}`;
    }
    const den = formatPoly(this.c, this.d);
    return `(${num}) / (${den})`;
  }

  /**
   * Returns LaTeX representation
   * Example: "\\frac{2x+1}{x+3}"
   */
  toLatex() {
    if (this.caseType === 'UNDEFINED') return '\\text{Không xác định}';

    const formatPolyLatex = (coeff, constTerm) => {
      let s = '';
      if (coeff !== 0) {
        if (coeff === 1) s += 'x';
        else if (coeff === -1) s += '-x';
        else s += `${coeff}x`;
      }
      if (constTerm !== 0 || s === '') {
        if (s !== '') {
          s += constTerm > 0 ? `+${constTerm}` : `${constTerm}`;
        } else {
          s += `${constTerm}`;
        }
      }
      return s;
    };

    const num = formatPolyLatex(this.a, this.b);
    if (this.c === 0) {
      return this.d === 1 ? num : `\\frac{${num}}{${this.d}}`;
    }
    const den = formatPolyLatex(this.c, this.d);
    return `\\frac{${num}}{${den}}`;
  }
}
