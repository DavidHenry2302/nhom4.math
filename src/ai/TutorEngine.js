/**
 * TutorEngine.js
 * Intelligent Socratic Tutoring System (Client-side, Rule & State-driven).
 * Generates pedagogical feedback, Socratic counter-questions, and AI Literacy interactions.
 */

import { PROMPT_TEMPLATES } from './PromptTemplates.js';
import { MisconceptionEngine } from './MisconceptionEngine.js';

export class TutorEngine {
  constructor() {
    this.instructorName = 'Flight Instructor AI';
  }

  getMissionGreeting(mission) {
    return `🛫 **${mission.title}**\n\n${mission.story}\n\n❓ **Bí ẩn:** ${mission.mystery}`;
  }

  getPredictionFeedback(isCorrect, studentOption, mission) {
    if (isCorrect) {
      return {
        type: 'SUCCESS',
        message: `✓ Dự đoán rất sắc bén! Bây giờ hãy cho máy bay cất cánh để kiểm chứng thực nghiệm xem dữ liệu có khớp với dự đoán của em không.`
      };
    } else {
      return {
        type: 'INTRIGUE',
        message: `Một giả thuyết thú vị! Khoa học bắt đầu từ những dự đoán bất ngờ. Hãy bấm [BAY THỬ] để kiểm tra xem hệ số thực tế cư xử ra sao nhé!`
      };
    }
  }

  getDiagnosticFeedback(validationResult) {
    if (validationResult.isCorrect || validationResult.isValid) {
      return {
        type: 'SUCCESS',
        title: 'Chính xác!',
        message: validationResult.feedback
      };
    }

    if (validationResult.misconceptionCode) {
      const details = MisconceptionEngine.getMisconceptionDetails(validationResult.misconceptionCode);
      return {
        type: 'MISCONCEPTION',
        title: details ? details.title : 'Chưa chính xác',
        message: validationResult.feedback,
        socraticQuestion: details ? details.socraticQuestion : 'Em hãy quan sát kỹ lại dữ liệu trên Hộp đen.'
      };
    }

    return {
      type: 'RETRY',
      title: 'Thử lại',
      message: validationResult.feedback || 'Kết quả chưa khớp với dữ liệu thực nghiệm. Hãy dùng Gợi ý nếu cần!'
    };
  }

  getSocraticPromptForFlight(proximityStatus, currentX, currentY) {
    if (proximityStatus === 'STALL') {
      return `⚠️ **BÁO ĐỘNG STALL!** Máy bay vừa bị ngắt động cơ khẩn cấp tại x ≈ ${currentX.toFixed(2)}. Em nghĩ tại sao hệ thống máy tính lại không cho phép x tiếp tục tăng?`;
    }
    if (proximityStatus === 'CRITICAL') {
      return `🔥 Chú ý độ dốc đang ngẩng lên cực lớn! Mẫu số đang tiến rất sát số 0. Hãy chuẩn bị quan sát hiện tượng bùng nổ cao độ!`;
    }
    return null;
  }
}
