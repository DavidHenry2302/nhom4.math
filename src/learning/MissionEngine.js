/**
 * MissionEngine.js
 * Drives the 7-step pedagogical lifecycle for each mission:
 * STORY -> PREDICTION -> EXPERIMENT/FLIGHT -> OBSERVATION -> HINTS -> REASONING -> CONCLUSION (FLIGHT LOG)
 */

import { MISSIONS_DATA } from './MissionsData.js';
import { HintEngine } from './HintEngine.js';
import { MathValidator } from '../math/MathValidator.js';
import { RationalFunction } from '../math/RationalFunction.js';

export class MissionEngine {
  constructor(progress, tutor, adaptive) {
    this.progress = progress;
    this.tutor = tutor;
    this.adaptive = adaptive;
    this.hintEngine = new HintEngine();

    this.currentMission = null;
    this.step = 'PREDICTION'; // 'PREDICTION', 'EXPERIMENT', 'REASONING', 'COMPLETED'
    this.studentPrediction = null;
    this.flightConducted = false;

    this.onMissionChange = null;
    this.onStepChange = null;
  }

  loadMission(missionId) {
    const mission = MISSIONS_DATA.find(m => m.id === missionId) || MISSIONS_DATA[0];
    this.currentMission = mission;
    this.step = 'PREDICTION';
    this.studentPrediction = null;
    this.flightConducted = false;
    this.hintEngine.reset();

    // Instantiate math function for this mission
    const p = mission.initialParams;
    this.rf = new RationalFunction(p.a, p.b, p.c, p.d);

    if (this.onMissionChange) this.onMissionChange(this.currentMission, this.rf);
    if (this.onStepChange) this.onStepChange(this.step);
    return this.currentMission;
  }

  submitPrediction(optionId) {
    const option = this.currentMission.predictionOptions.find(o => o.id === optionId);
    if (!option) return null;

    this.studentPrediction = option;
    this.step = 'EXPERIMENT';

    const feedback = this.tutor.getPredictionFeedback(option.correct, option, this.currentMission);
    if (this.onStepChange) this.onStepChange(this.step);
    return feedback;
  }

  markFlightConducted() {
    this.flightConducted = true;
    if (this.step === 'EXPERIMENT') {
      this.step = 'REASONING';
      if (this.onStepChange) this.onStepChange(this.step);
    }
  }

  requestHint() {
    this.progress.recordHintUse();
    return this.hintEngine.getNextHint(this.currentMission);
  }

  submitReasoning(rawAnswer) {
    this.progress.recordTrial();
    const expected = this.currentMission.expectedAnswer;
    let validation = { isCorrect: false, feedback: '' };

    if (expected.type === 'CHOICE') {
      const isOk = rawAnswer === expected.correctId;
      validation = {
        isCorrect: isOk,
        feedback: isOk ? 'Chính xác! Lựa chọn của em hoàn toàn khớp với kết quả thực nghiệm.' : 'Lựa chọn chưa chính xác. Hãy quan sát kỹ lại dữ liệu trên màn hình và bảng Hộp đen!'
      };
    } else if (expected.type === 'NUMERIC') {
      const numVal = MathValidator.parseNumberOrFraction(rawAnswer);
      const isOk = MathValidator.isApproximatelyEqual(numVal, expected.value);
      validation = {
        isCorrect: isOk,
        feedback: isOk ? `Chính xác! Giá trị tìm được là ${expected.value}.` : `Giá trị ${rawAnswer} chưa chính xác. Hãy kiểm tra lại xu hướng các con số!`
      };
      if (!isOk && numVal !== null && MathValidator.isApproximatelyEqual(numVal, -expected.value)) {
        validation.misconceptionCode = 'FORGOT_SIGN';
      }
    } else if (expected.type === 'ASYMPTOTE_FORMULA') {
      if (expected.variable === 'x') {
        const expectedX = this.rf.hasVerticalAsymptote ? this.rf.verticalAsymptoteX : 0;
        validation = MathValidator.validateVerticalAsymptote(rawAnswer, expectedX, this.rf);
      } else {
        const expectedY = this.rf.hasHorizontalAsymptote ? this.rf.horizontalAsymptoteY : 0;
        validation = MathValidator.validateHorizontalAsymptote(rawAnswer, expectedY, this.rf);
      }
    } else if (expected.type === 'DESIGN_VALIDATION') {
      validation = MathValidator.validateFlightDesign(
        this.rf.a, this.rf.b, this.rf.c, this.rf.d,
        expected.targetVA, expected.targetHA
      );
      validation.isCorrect = validation.isValid;
    }

    if (validation.isCorrect || validation.isValid) {
      this.step = 'COMPLETED';
      const logReport = this.generateFlightLog();
      this.progress.completeMission(this.currentMission.id, logReport);
      if (this.onStepChange) this.onStepChange(this.step);
    } else {
      if (validation.misconceptionCode) {
        this.progress.recordMisconception();
      }
      this.adaptive.recordAttempt(false, validation.misconceptionCode);
    }

    return validation;
  }

  generateFlightLog() {
    return {
      missionId: this.currentMission.id,
      missionTitle: this.currentMission.title,
      rank: this.currentMission.rank,
      timestamp: new Date().toLocaleString('vi-VN'),
      prediction: this.studentPrediction ? this.studentPrediction.text : 'Chưa ghi nhận',
      formula: this.currentMission.unlockedFormula,
      conclusion: this.currentMission.logConclusion,
      hintsUsed: this.hintEngine.currentTier
    };
  }

  getNextMissionId() {
    const idx = MISSIONS_DATA.findIndex(m => m.id === this.currentMission.id);
    if (idx >= 0 && idx < MISSIONS_DATA.length - 1) {
      return MISSIONS_DATA[idx + 1].id;
    }
    return null;
  }
}
