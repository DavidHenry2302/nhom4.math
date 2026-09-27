/**
 * JourneyProgress.js
 * Manages Stage unlocking, persistent progress in localStorage, and Flight Researcher ranks.
 */

const STORAGE_KEY = 'flight_math_journey_progress_v1';

export class JourneyProgress {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read journey progress from localStorage', e);
    }

    return {
      currentStage: 1,
      unlockedStages: [1], // Only Stage 1 unlocked initially
      completedStages: [],
      xp: 0,
      certified: false
    };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Could not save journey progress to localStorage', e);
    }
  }

  isUnlocked(stageNum) {
    return this.data.unlockedStages.includes(stageNum);
  }

  isCompleted(stageNum) {
    return this.data.completedStages.includes(stageNum);
  }

  completeStage(stageNum, xpGain = 150) {
    if (!this.data.completedStages.includes(stageNum)) {
      this.data.completedStages.push(stageNum);
      this.data.xp += xpGain;
    }

    const nextStage = stageNum + 1;
    if (nextStage <= 9 && !this.data.unlockedStages.includes(nextStage)) {
      this.data.unlockedStages.push(nextStage);
    }

    if (stageNum === 9) {
      this.data.certified = true;
    }

    this.save();
  }

  setStage(stageNum) {
    if (this.isUnlocked(stageNum)) {
      this.data.currentStage = stageNum;
      this.save();
      return true;
    }
    return false;
  }

  getRank() {
    const completed = this.data.completedStages.length;
    if (completed >= 9) return { name: 'Cơ trưởng Nghiên cứu', code: 'COMMANDER', badge: '🏆' };
    if (completed >= 6) return { name: 'Sĩ quan Sát hạch', code: 'OFFICER', badge: '🎖️' };
    if (completed >= 3) return { name: 'Phi công Khám phá', code: 'PILOT', badge: '✈️' };
    return { name: 'Tân binh Hàng không', code: 'CADET', badge: '🧑✈️' };
  }

  getProgressPercentage() {
    return Math.round((this.data.completedStages.length / 9) * 100);
  }

  resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.load();
  }
}
