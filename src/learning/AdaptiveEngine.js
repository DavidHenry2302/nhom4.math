/**
 * AdaptiveEngine.js
 * Tracks learning friction, consecutive misconceptions, and triggers remedial Mini-Labs.
 */

import { MINI_LABS } from './MissionsData.js';

export class AdaptiveEngine {
  constructor() {
    this.consecutiveFailures = 0;
    this.activeMiniLab = null;
  }

  recordAttempt(isSuccess, misconceptionCode) {
    if (isSuccess) {
      this.consecutiveFailures = 0;
      return { triggerMiniLab: false };
    }

    this.consecutiveFailures++;

    // If student fails 3 times on denominator or sign misconceptions
    if (this.consecutiveFailures >= 3 && (
      misconceptionCode === 'FORGOT_SIGN' ||
      misconceptionCode === 'FORGOT_NEGATIVE_SIGN_FORMULA' ||
      misconceptionCode === 'WRONG_VALUE'
    )) {
      this.activeMiniLab = MINI_LABS.DENOMINATOR_SOLVER;
      return {
        triggerMiniLab: true,
        miniLab: this.activeMiniLab,
        message: 'AI Instructor nhận thấy em đang gặp khó khăn khi tìm nghiệm làm mẫu số bằng 0. Hệ thống đã mở một bài tập Mini-Lab ngắn để củng cố kỹ năng này trước khi bay tiếp.'
      };
    }

    return { triggerMiniLab: false };
  }

  clearMiniLab() {
    this.activeMiniLab = null;
    this.consecutiveFailures = 0;
  }
}
