/**
 * HintEngine.js
 * Manages the 4-tier progressive hint system:
 * Tier 1: Quan sát (Observation)
 * Tier 2: Gợi hướng (Conceptual direction)
 * Tier 3: Công thức nền (Foundational formula)
 * Tier 4: Giải mẫu chi tiết (Step-by-step resolution)
 */

export class HintEngine {
  constructor() {
    this.currentTier = 0; // 0: no hints requested, 1..4
    this.tierLabels = [
      '',
      'Tầng 1 — Quan sát trực quan',
      'Tầng 2 — Gợi hướng tư duy',
      'Tầng 3 — Công thức nền tảng',
      'Tầng 4 — Hướng dẫn giải chi tiết'
    ];
  }

  reset() {
    this.currentTier = 0;
  }

  canRequestMore(mission) {
    if (!mission || !mission.hints) return false;
    return this.currentTier < mission.hints.length && this.currentTier < 4;
  }

  getNextHint(mission) {
    if (!this.canRequestMore(mission)) {
      return null;
    }
    this.currentTier++;
    const hintText = mission.hints[this.currentTier - 1];
    return {
      tier: this.currentTier,
      label: this.tierLabels[this.currentTier],
      text: hintText,
      remaining: mission.hints.length - this.currentTier
    };
  }

  getAllUnlockedHints(mission) {
    if (!mission || !mission.hints) return [];
    return mission.hints.slice(0, this.currentTier).map((text, idx) => ({
      tier: idx + 1,
      label: this.tierLabels[idx + 1],
      text
    }));
  }
}
