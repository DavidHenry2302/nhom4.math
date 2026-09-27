/**
 * MathValidator.js
 * Validates mathematical answers from students and identifies diagnostic misconceptions.
 */

import { RationalFunction } from './RationalFunction.js';

export class MathValidator {
  /**
   * Parse numerical or fractional input
   * supports: "3", "-2.5", "1/2", "-3/4", "  2  "
   * @param {string|number} rawInput
   * @returns {number|null}
   */
  static parseNumberOrFraction(rawInput) {
    if (typeof rawInput === 'number') return rawInput;
    if (!rawInput || typeof rawInput !== 'string') return null;

    const trimmed = rawInput.trim().replace(/\s+/g, '');
    
    // Check fraction a/b
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 2) {
        const num = parseFloat(parts[0]);
        const den = parseFloat(parts[1]);
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
          return num / den;
        }
      }
      return null;
    }

    const val = parseFloat(trimmed);
    return isNaN(val) ? null : val;
  }

  /**
   * Validates a numerical answer against an expected value with tolerance
   */
  static isApproximatelyEqual(actual, expected, tolerance = 0.05) {
    if (actual === null || expected === null) return false;
    return Math.abs(actual - expected) <= tolerance;
  }

  /**
   * Parses asymptote expression input like "x = 3", "y = 2", "3", "x= -d/c"
   */
  static parseAsymptoteInput(rawInput) {
    if (!rawInput || typeof rawInput !== 'string') return { variable: null, value: null, raw: '' };

    const clean = rawInput.trim().toLowerCase().replace(/\s+/g, '');

    let variable = null;
    let valStr = clean;

    if (clean.startsWith('x=')) {
      variable = 'x';
      valStr = clean.slice(2);
    } else if (clean.startsWith('y=')) {
      variable = 'y';
      valStr = clean.slice(2);
    }

    const numericVal = MathValidator.parseNumberOrFraction(valStr);

    return {
      variable,
      value: numericVal,
      symbolic: valStr,
      raw: rawInput
    };
  }

  /**
   * Detects student misconceptions for Vertical Asymptote answers
   * @param {string|number} studentInput
   * @param {number} expectedX
   * @param {RationalFunction} rf
   * @returns {{ isCorrect: boolean, misconceptionCode: string|null, feedback: string }}
   */
  static validateVerticalAsymptote(studentInput, expectedX, rf) {
    const parsed = MathValidator.parseAsymptoteInput(String(studentInput));

    // If student explicitly typed y = ...
    if (parsed.variable === 'y') {
      return {
        isCorrect: false,
        misconceptionCode: 'CONFUSED_HA_WITH_VA',
        feedback: 'Tiệm cận đứng phải có dạng phương trình x = x₀ (đường thẳng song song trục tung), không phải y = ...!'
      };
    }

    // Check symbolic answers like "-d/c" or "d/c"
    if (parsed.symbolic === 'd/c') {
      return {
        isCorrect: false,
        misconceptionCode: 'FORGOT_NEGATIVE_SIGN_FORMULA',
        feedback: 'Gần đúng! Chú ý khi giải cx + d = 0, chuyển vế d qua ta được cx = -d. Vậy x phải bằng -d/c.'
      };
    }
    if (parsed.symbolic === '-d/c' || parsed.symbolic === '-(d/c)') {
      return {
        isCorrect: true,
        misconceptionCode: null,
        feedback: 'Chính xác! Công thức tổng quát của tiệm cận đứng là x = -d/c.'
      };
    }

    if (parsed.value === null) {
      return {
        isCorrect: false,
        misconceptionCode: 'INVALID_FORMAT',
        feedback: 'Vui lòng nhập giá trị số (ví dụ: 3, -1.5) hoặc phương trình (x = 3).'
      };
    }

    // Check exact or approx match
    if (MathValidator.isApproximatelyEqual(parsed.value, expectedX, 0.05)) {
      return {
        isCorrect: true,
        misconceptionCode: null,
        feedback: `Chính xác! Tiệm cận đứng của hệ thống là x = ${expectedX}.`
      };
    }

    // Check forgot negative sign
    if (MathValidator.isApproximatelyEqual(parsed.value, -expectedX, 0.05)) {
      return {
        isCorrect: false,
        misconceptionCode: 'FORGOT_SIGN',
        feedback: `Có vẻ em đã quên đổi dấu khi giải phương trình mẫu số bằng 0. Kiểm tra lại nghiệm của mẫu số!`
      };
    }

    // Check if gave Horizontal Asymptote instead
    if (rf.hasHorizontalAsymptote && MathValidator.isApproximatelyEqual(parsed.value, rf.horizontalAsymptoteY, 0.05)) {
      return {
        isCorrect: false,
        misconceptionCode: 'GAVE_HA_INSTEAD_OF_VA',
        feedback: `Giá trị ${parsed.value} là Tiệm cận ngang (trần bay ổn định), không phải Tiệm cận đứng (vùng cấm bay)!`
      };
    }

    return {
      isCorrect: false,
      misconceptionCode: 'WRONG_VALUE',
      feedback: `Giá trị ${parsed.value} chưa chính xác. Hãy quan sát giá trị x nào khiến mẫu số triệt tiêu về 0.`
    };
  }

  /**
   * Detects student misconceptions for Horizontal Asymptote answers
   * @param {string|number} studentInput
   * @param {number} expectedY
   * @param {RationalFunction} rf
   * @returns {{ isCorrect: boolean, misconceptionCode: string|null, feedback: string }}
   */
  static validateHorizontalAsymptote(studentInput, expectedY, rf) {
    const parsed = MathValidator.parseAsymptoteInput(String(studentInput));

    if (parsed.variable === 'x') {
      return {
        isCorrect: false,
        misconceptionCode: 'CONFUSED_VA_WITH_HA',
        feedback: 'Tiệm cận ngang phải có dạng phương trình y = y₀ (đường thẳng nằm ngang), không phải x = ...!'
      };
    }

    // Symbolic checks
    if (parsed.symbolic === 'a/c') {
      return {
        isCorrect: true,
        misconceptionCode: null,
        feedback: 'Xuất sắc! Công thức tổng quát của tiệm cận ngang khi x tiến ra vô cực là y = a/c.'
      };
    }
    if (parsed.symbolic === 'c/a') {
      return {
        isCorrect: false,
        misconceptionCode: 'INVERTED_RATIO',
        feedback: 'Gần đúng nhưng bị nghịch đảo. Hãy chia cả tử và mẫu cho x: bậc cao nhất ở tử có hệ số a, ở mẫu có hệ số c.'
      };
    }

    if (parsed.value === null) {
      return {
        isCorrect: false,
        misconceptionCode: 'INVALID_FORMAT',
        feedback: 'Vui lòng nhập giá trị số (ví dụ: 2, 0.5) hoặc phương trình (y = 2).'
      };
    }

    if (MathValidator.isApproximatelyEqual(parsed.value, expectedY, 0.05)) {
      return {
        isCorrect: true,
        misconceptionCode: null,
        feedback: `Chính xác! Tiệm cận ngang của chuyến bay là y = ${expectedY}.`
      };
    }

    if (rf.hasVerticalAsymptote && MathValidator.isApproximatelyEqual(parsed.value, rf.verticalAsymptoteX, 0.05)) {
      return {
        isCorrect: false,
        misconceptionCode: 'GAVE_VA_INSTEAD_OF_HA',
        feedback: `Giá trị ${parsed.value} là Tiệm cận đứng, không phải độ cao ổn định của Tiệm cận ngang!`
      };
    }

    return {
      isCorrect: false,
      misconceptionCode: 'WRONG_VALUE',
      feedback: `Độ cao ${parsed.value} chưa đúng. Hãy quan sát bảng Hộp đen xem khi x rất lớn, f(x) tiến dần tới số nào.`
    };
  }

  /**
   * Validates custom parameters designed by student for Mission 8
   * Target: x_VA = targetVA, y_HA = targetHA
   */
  static validateFlightDesign(a, b, c, d, targetVA, targetHA) {
    const rf = new RationalFunction(a, b, c, d);

    if (!rf.isDefined) {
      return {
        isValid: false,
        feedback: 'Hệ thống điều khiển bị vô hiệu vì c = 0 và d = 0 (mẫu số bằng 0 trên toàn trục số)!'
      };
    }

    if (rf.isHole) {
      return {
        isValid: false,
        feedback: 'Chú ý: Các tham số em chọn làm cho ad - bc = 0. Hàm số bị suy biến thành đường thẳng có điểm thủng (Hole), không tạo được tiệm cận đứng!'
      };
    }

    if (!rf.hasVerticalAsymptote || !rf.hasHorizontalAsymptote) {
      return {
        isValid: false,
        feedback: 'Hàm số không có đủ cả 2 đường tiệm cận đứng và ngang theo yêu cầu!'
      };
    }

    const vaMatches = MathValidator.isApproximatelyEqual(rf.verticalAsymptoteX, targetVA, 0.01);
    const haMatches = MathValidator.isApproximatelyEqual(rf.horizontalAsymptoteY, targetHA, 0.01);

    if (vaMatches && haMatches) {
      return {
        isValid: true,
        feedback: `Tuyệt vời! Hệ thống f(x) = ${rf.toExpressionString()} thỏa mãn chính xác Tiệm cận đứng x = ${targetVA} và Tiệm cận ngang y = ${targetHA}. Phê duyệt chuyến bay!`
      };
    }

    if (!vaMatches && haMatches) {
      return {
        isValid: false,
        feedback: `Tiệm cận ngang y = ${targetHA} đã đúng, nhưng Tiệm cận đứng hiện tại là x = ${rf.verticalAsymptoteX.toFixed(2)} (Mục tiêu là x = ${targetVA}). Hãy chỉnh lại c hoặc d!`
      };
    }

    if (vaMatches && !haMatches) {
      return {
        isValid: false,
        feedback: `Tiệm cận đứng x = ${targetVA} đã đúng, nhưng Tiệm cận ngang hiện tại là y = ${rf.horizontalAsymptoteY.toFixed(2)} (Mục tiêu là y = ${targetHA}). Hãy chỉnh lại a hoặc c!`
      };
    }

    return {
      isValid: false,
      feedback: `Cả hai tiệm cận đều chưa khớp. Hiện tại: x_VA = ${rf.verticalAsymptoteX.toFixed(2)}, y_HA = ${rf.horizontalAsymptoteY.toFixed(2)}. Mục tiêu: x_VA = ${targetVA}, y_HA = ${targetHA}.`
    };
  }
}
