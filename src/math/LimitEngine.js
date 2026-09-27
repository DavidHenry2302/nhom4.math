/**
 * LimitEngine.js
 * Computes infinite limits, one-sided limits, and generated approaching sequences.
 */

export class LimitEngine {
  /**
   * Computes limit as x -> +infinity
   * @param {RationalFunction} rf
   * @returns {{ value: number|string, isFinite: boolean, latex: string }}
   */
  static limitAtPositiveInfinity(rf) {
    if (!rf.isDefined) {
      return { value: 'undefined', isFinite: false, latex: '\\text{Không xác định}' };
    }

    if (rf.c !== 0) {
      // (ax+b)/(cx+d) -> a/c
      const val = rf.a / rf.c;
      return {
        value: val,
        isFinite: true,
        latex: `${parseFloat(val.toFixed(4))}`
      };
    }

    // c === 0 => (ax+b)/d
    if (rf.a === 0) {
      const val = rf.b / rf.d;
      return { value: val, isFinite: true, latex: `${parseFloat(val.toFixed(4))}` };
    }

    const sign = (rf.a / rf.d) > 0 ? '+infinity' : '-infinity';
    return {
      value: sign,
      isFinite: false,
      latex: sign === '+infinity' ? '+\\infty' : '-\\infty'
    };
  }

  /**
   * Computes limit as x -> -infinity
   * @param {RationalFunction} rf
   * @returns {{ value: number|string, isFinite: boolean, latex: string }}
   */
  static limitAtNegativeInfinity(rf) {
    if (!rf.isDefined) {
      return { value: 'undefined', isFinite: false, latex: '\\text{Không xác định}' };
    }

    if (rf.c !== 0) {
      const val = rf.a / rf.c;
      return {
        value: val,
        isFinite: true,
        latex: `${parseFloat(val.toFixed(4))}`
      };
    }

    if (rf.a === 0) {
      const val = rf.b / rf.d;
      return { value: val, isFinite: true, latex: `${parseFloat(val.toFixed(4))}` };
    }

    // Since x -> -infinity, sign is flipped compared to a/d
    const sign = (rf.a / rf.d) > 0 ? '-infinity' : '+infinity';
    return {
      value: sign,
      isFinite: false,
      latex: sign === '+infinity' ? '+\\infty' : '-\\infty'
    };
  }

  /**
   * Computes one-sided limit as x -> x0^+ or x0^-
   * @param {RationalFunction} rf
   * @param {number} x0
   * @param {'right'|'left'} side
   * @returns {{ value: number|string, isFinite: boolean, latex: string }}
   */
  static oneSidedLimit(rf, x0, side = 'right') {
    if (!rf.isDefined) {
      return { value: 'undefined', isFinite: false, latex: '\\text{Không xác định}' };
    }

    // If it is a removable discontinuity (Hole) at x0
    if (rf.isHole && Math.abs(x0 - rf.holeX) < 1e-6) {
      return {
        value: rf.holeY,
        isFinite: true,
        latex: `${parseFloat(rf.holeY.toFixed(4))}`
      };
    }

    const denomAtX0 = rf.c * x0 + rf.d;
    // If not singularity
    if (Math.abs(denomAtX0) > 1e-9) {
      const val = rf.evaluate(x0);
      return {
        value: val,
        isFinite: true,
        latex: `${parseFloat(val.toFixed(4))}`
      };
    }

    // Singularity x0 = -d/c
    // Numerator at x0: a*(-d/c) + b = -(ad - bc)/c
    const numAtX0 = rf.a * x0 + rf.b;
    // Approaching: test x = x0 + eps or x0 - eps
    const eps = side === 'right' ? 1e-6 : -1e-6;
    const testVal = rf.evaluate(x0 + eps);

    if (testVal > 0) {
      return { value: '+infinity', isFinite: false, latex: '+\\infty' };
    } else {
      return { value: '-infinity', isFinite: false, latex: '-\\infty' };
    }
  }

  /**
   * Generates a sequence of test points approaching infinity
   * [10, 50, 100, 1000, 10000]
   */
  static generateInfinityApproachSequence(rf, isNegative = false) {
    const steps = [10, 50, 100, 500, 1000, 10000];
    return steps.map(val => {
      const x = isNegative ? -val : val;
      const y = rf.evaluate(x);
      return {
        x,
        y,
        yFormatted: y !== null ? Number(y.toFixed(4)) : 'undefined',
        distanceToAsymptote: rf.hasHorizontalAsymptote ? Math.abs(y - rf.horizontalAsymptoteY) : null
      };
    });
  }

  /**
   * Generates a sequence of points approaching a critical value x0
   * e.g., for x0 = 3 from left: 2.0, 2.5, 2.9, 2.99, 2.999
   */
  static generateCriticalApproachSequence(rf, x0, fromLeft = true) {
    const deltas = [1.0, 0.5, 0.1, 0.01, 0.001];
    return deltas.map(delta => {
      const x = fromLeft ? x0 - delta : x0 + delta;
      const y = rf.evaluate(x);
      return {
        x: Number(x.toFixed(4)),
        y: y !== null ? Number(y.toFixed(2)) : 'undefined',
        distanceToCritical: Number(delta.toFixed(4))
      };
    });
  }
}
