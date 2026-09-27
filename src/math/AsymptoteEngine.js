/**
 * AsymptoteEngine.js
 * Comprehensive detection of Vertical and Horizontal Asymptotes, Holes, and Safety Clearance.
 */

export class AsymptoteEngine {
  /**
   * Complete asymptote diagnostic report
   * @param {RationalFunction} rf
   */
  static diagnose(rf) {
    return {
      caseType: rf.caseType,
      verticalAsymptote: rf.hasVerticalAsymptote ? {
        x: rf.verticalAsymptoteX,
        formula: `x = ${parseFloat(rf.verticalAsymptoteX.toFixed(3))}`,
        latex: `x = ${parseFloat(rf.verticalAsymptoteX.toFixed(3))}`
      } : null,
      horizontalAsymptote: rf.hasHorizontalAsymptote ? {
        y: rf.horizontalAsymptoteY,
        formula: `y = ${parseFloat(rf.horizontalAsymptoteY.toFixed(3))}`,
        latex: `y = ${parseFloat(rf.horizontalAsymptoteY.toFixed(3))}`
      } : null,
      hole: rf.isHole ? {
        x: rf.holeX,
        y: rf.holeY,
        latex: `(${parseFloat(rf.holeX.toFixed(3))}, ${parseFloat(rf.holeY.toFixed(3))})`
      } : null,
      centerOfSymmetry: (rf.hasVerticalAsymptote && rf.hasHorizontalAsymptote) ? {
        x: rf.verticalAsymptoteX,
        y: rf.horizontalAsymptoteY
      } : null
    };
  }

  /**
   * Evaluates flight safety alert level based on distance to vertical asymptote
   * @param {RationalFunction} rf
   * @param {number} currentX
   * @returns {{ status: 'NORMAL'|'CAUTION'|'CRITICAL'|'STALL', distance: number|null, message: string }}
   */
  static evaluateFlightProximity(rf, currentX) {
    if (!rf.hasVerticalAsymptote || rf.verticalAsymptoteX === null) {
      return { status: 'NORMAL', distance: null, message: 'Đường bay an toàn, không có chướng ngại vật tiệm cận đứng.' };
    }

    const distance = Math.abs(currentX - rf.verticalAsymptoteX);

    if (distance < 0.05) {
      return {
        status: 'STALL',
        distance,
        message: `NGUY CẤP! Máy bay chạm vùng kỳ dị x = ${rf.verticalAsymptoteX.toFixed(2)}. Hệ thống dừng khẩn cấp!`
      };
    }

    if (distance < 0.3) {
      return {
        status: 'CRITICAL',
        distance,
        message: `CẢNH BÁO ĐỎ! Độ dốc và cao độ tăng phi mã. Tiến sát rào cản x = ${rf.verticalAsymptoteX.toFixed(2)}!`
      };
    }

    if (distance < 1.0) {
      return {
        status: 'CAUTION',
        distance,
        message: `CHÚ Ý: Bắt đầu cảm nhận ảnh hưởng của tiệm cận đứng (khoảng cách = ${distance.toFixed(2)}).`
      };
    }

    return {
      status: 'NORMAL',
      distance,
      message: 'Hành trình ổn định.'
    };
  }

  /**
   * Reverse engineering helper: Given target x_VA and y_HA, find valid (a, b, c, d)
   * x_VA = -d/c => d = -c * x_VA
   * y_HA = a/c  => a = c * y_HA
   * Pick c = 1, choose b such that ad - bc != 0
   */
  static designFunction(targetVA, targetHA, customB = 1, customC = 1) {
    const c = customC;
    const d = -c * targetVA;
    const a = c * targetHA;
    // ensure ad - bc != 0
    let b = customB;
    if (Math.abs(a * d - b * c) < 1e-6) {
      b += 1;
    }
    return { a, b, c, d };
  }
}
