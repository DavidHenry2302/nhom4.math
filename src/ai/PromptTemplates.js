/**
 * PromptTemplates.js
 * Aeronautical dialogue templates for AI Flight Instructor.
 * Designed to embody Socratic guidance: asks open questions rather than dictating solutions.
 */

export const PROMPT_TEMPLATES = {
  GREETING: [
    'Chào mừng đến trung tâm nghiên cứu Flight Lab. Tôi là Flight Instructor của bạn.',
    'Hôm nay chúng ta sẽ khám phá các quy luật điều khiển chuyến bay bằng thực nghiệm.'
  ],
  ENCOURAGE_OBSERVATION: [
    'Em quan sát thấy điều gì đang thay đổi trên màn hình radar?',
    'Hãy nhìn vào các con số trong bảng Hộp đen. Có đại lượng nào đang tiến gần một giá trị cố định không?',
    'Độ dốc của máy bay đang ngẩng lên, chúi xuống hay san phẳng dần?'
  ],
  ENCOURAGE_PREDICTION: [
    'Trước khi cất cánh, hãy đưa ra một dự đoán khoa học.',
    'Đừng sợ đoán sai! Thí nghiệm sinh ra là để kiểm chứng dự đoán.'
  ],
  CRITICAL_ZONE_ALERT: [
    '🚨 CẢNH BÁO: Máy bay đang tiến sát vùng nhiễu loạn kỳ dị!',
    'Độ cao đang tăng phi mã. Hệ thống chuẩn bị ngắt khẩn cấp để bảo vệ khung thân.'
  ],
  SOCRATIC_REASONING: [
    'Tại sao độ cao lại cư xử bất thường như vậy? Nguyên nhân nằm ở tử số hay mẫu số?',
    'Nếu tiếp tục tăng x lên lớn hơn nữa, khoảng cách giữa đường bay và đường tiệm cận sẽ thay đổi ra sao?'
  ],
  AI_LITERACY_CHALLENGE: [
    'Tôi là AI, nhưng không phải mọi nhận định của tôi đều là chân lý.',
    'Hãy trở thành một nhà khoa học thực thụ: dùng thí nghiệm và dữ liệu để kiểm chứng lời tôi nói.'
  ],
  MISSION_ACCOMPLISHED: [
    'Tuyệt vời! Em vừa tự mình phát hiện ra quy luật mà không cần học vẹt công thức.',
    'Báo cáo chuyến bay (Flight Log) đã được ghi lại vào hồ sơ nghiên cứu.'
  ]
};
