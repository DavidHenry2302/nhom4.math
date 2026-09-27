/**
 * Progress.js
 * LocalStorage persistence for user progression, Flight Logs, ranks, and XP.
 * 100% Client-side LocalStorage persistence.
 */

const STORAGE_KEY = 'flight_math_lab_progress_v2';

export class Progress {
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
      console.warn('Could not read localStorage, using initial progress.', e);
    }

    return {
      currentMissionId: 'F1',
      completedMissions: [],
      xp: 0,
      rank: 'CADET', // 'CADET', 'PILOT', 'RESEARCHER', 'COMMANDER'
      flightLogs: [],
      stats: {
        trials: 0,
        hintsUsed: 0,
        misconceptionsCaught: 0,
        certified: false
      }
    };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Could not save to localStorage.', e);
    }
  }

  isCompleted(missionId) {
    return this.data.completedMissions.includes(missionId);
  }

  completeMission(missionId, logReport, xpReward = 100) {
    if (!this.data.completedMissions.includes(missionId)) {
      this.data.completedMissions.push(missionId);
      this.data.xp += xpReward;
    }

    // Save Flight Log report
    if (logReport) {
      const existingIdx = this.data.flightLogs.findIndex(l => l.missionId === missionId);
      if (existingIdx >= 0) {
        this.data.flightLogs[existingIdx] = logReport;
      } else {
        this.data.flightLogs.push(logReport);
      }
    }

    this.updateRank();
    this.save();
  }

  updateRank() {
    const completed = this.data.completedMissions;
    if (completed.includes('FINAL')) {
      this.data.rank = 'COMMANDER';
      this.data.stats.certified = true;
    } else if (completed.includes('M8') || completed.includes('M9')) {
      this.data.rank = 'COMMANDER';
    } else if (completed.includes('M6') || completed.includes('M7')) {
      this.data.rank = 'RESEARCHER';
    } else if (completed.includes('M3') || completed.includes('M4') || completed.includes('M5')) {
      this.data.rank = 'PILOT';
    } else {
      this.data.rank = 'CADET';
    }
  }

  recordTrial() {
    this.data.stats.trials++;
    this.save();
  }

  recordHintUse() {
    this.data.stats.hintsUsed++;
    this.save();
  }

  recordMisconception() {
    this.data.stats.misconceptionsCaught++;
    this.save();
  }

  resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.load();
  }
}
