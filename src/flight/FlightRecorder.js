/**
 * FlightRecorder.js
 * Aviation Black Box & Scientific Telemetry Logger.
 * Records (t, x, f(x), distanceToCritical, slope, status)
 * Supports export to CSV, Markdown Table, and clipboard copy.
 */

export class FlightRecorder {
  constructor(maxEntries = 250) {
    this.maxEntries = maxEntries;
    this.records = [];
    this.startTime = Date.now();
    this.isRecording = false;
  }

  start() {
    this.isRecording = true;
    this.startTime = Date.now();
  }

  stop() {
    this.isRecording = false;
  }

  clear() {
    this.records = [];
    this.startTime = Date.now();
  }

  /**
   * Log telemetry snapshot
   */
  log(x, fx, distanceToVA, slope, status = 'NORMAL') {
    const elapsedSeconds = Number(((Date.now() - this.startTime) / 1000).toFixed(1));
    const entry = {
      id: this.records.length + 1,
      time: elapsedSeconds,
      x: Number(x.toFixed(3)),
      fx: fx !== null && Number.isFinite(fx) ? Number(fx.toFixed(3)) : 'UNDEFINED',
      distanceToVA: distanceToVA !== null ? Number(distanceToVA.toFixed(3)) : 'N/A',
      slope: slope !== null && Number.isFinite(slope) ? Number(slope.toFixed(3)) : 'N/A',
      status
    };

    this.records.push(entry);
    if (this.records.length > this.maxEntries) {
      this.records.shift();
    }
    return entry;
  }

  getRecent(count = 10) {
    return this.records.slice(-count);
  }

  getAll() {
    return [...this.records];
  }

  /**
   * Generates CSV format string
   */
  toCSV() {
    const headers = ['Record_ID', 'Time_s', 'Position_x', 'Altitude_f(x)', 'Distance_to_VA', 'Slope_f_prime', 'Status'];
    const rows = this.records.map(r => 
      [r.id, r.time, r.x, r.fx, r.distanceToVA, r.slope, `"${r.status}"`].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Generates Markdown/Aviation table format
   */
  toFormattedTable(limit = 15) {
    const subset = this.records.slice(-limit);
    if (subset.length === 0) return 'Chưa có dữ liệu ghi nhận từ Hộp đen.';

    let md = '| Time (s) | x | f(x) (Cao độ) | Khoảng cách tới TCĐ | Trạng thái |\n';
    md += '| :---: | :---: | :---: | :---: | :---: |\n';
    subset.forEach(r => {
      md += `| ${r.time} | ${r.x} | ${r.fx} | ${r.distanceToVA} | ${r.status} |\n`;
    });
    return md;
  }

  /**
   * Trích xuất phân tích tóm tắt cho Flight Log
   */
  generateSummaryStats() {
    if (this.records.length === 0) return null;

    const validAltitudes = this.records
      .map(r => r.fx)
      .filter(val => typeof val === 'number' && Number.isFinite(val));

    if (validAltitudes.length === 0) return null;

    const minAlt = Math.min(...validAltitudes);
    const maxAlt = Math.max(...validAltitudes);
    const lastEntry = this.records[this.records.length - 1];

    return {
      totalSamples: this.records.length,
      initialX: this.records[0].x,
      finalX: lastEntry.x,
      initialAltitude: this.records[0].fx,
      finalAltitude: lastEntry.fx,
      minAltitude: minAlt,
      maxAltitude: maxAlt,
      criticalApproached: this.records.some(r => r.status === 'CRITICAL' || r.status === 'STALL')
    };
  }
}
