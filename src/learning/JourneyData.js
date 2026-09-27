/**
 * JourneyData.js
 * Comprehensive data and curriculum for the 9-Stage Flight Training Journey:
 * Phase 1: Học lý thuyết & Khám phá (Ải 1 -> Ải 5)
 * Phase 2: Luyện tập & Vận dụng (Ải 6 -> Ải 7)
 * Phase 3: Thực hành bay & Tốt nghiệp (Ải 8 -> Ải 9)
 */

export const JOURNEY_STAGES = [
  // ================= PHASE 1: HỌC LÝ THUYẾT & KHÁM PHÁ =================
  {
    stage: 1,
    phase: 1,
    id: 'STAGE_1',
    code: 'ẢI 1',
    title: 'Flight Academy — Làm quen với máy bay',
    subtitle: 'Khám phá cách điều khiển máy bay: x là gì và f(x) là gì?',
    badgeName: 'Tân binh Hàng không',
    theoryBrief: 'Trong máy tính điều khiển bay, x là cần gạt vị trí (Input), còn f(x) là cao độ thực tế của máy bay (Output).',
    initialParams: { a: 2, b: 1, c: 0, d: 1 }, // f(x) = 2x + 1
    startX: 0,
    taskInstruction: 'Hãy kéo Cần gạt vị trí x và quan sát máy bay thay đổi độ cao f(x).',
    quizQuestion: 'Khi kéo cần gạt tới vị trí x = 3, máy tính bay tính ra độ cao f(3) = 2*(3) + 1 bằng bao nhiêu?',
    quizOptions: [
      { id: 'A', text: 'f(3) = 6', correct: false },
      { id: 'B', text: 'f(3) = 7', correct: true },
      { id: 'C', text: 'f(3) = 5', correct: false }
    ],
    hint: 'Thay số 3 vào vị trí x: 2 nhân 3 bằng 6, cộng thêm 1 ta được 7.',
    unlockedConcept: 'Input (vị trí x) ➔ Hàm số f ➔ Output (độ cao f(x))'
  },

  {
    stage: 2,
    phase: 1,
    id: 'STAGE_2',
    code: 'ẢI 2',
    title: 'Theory Lab — Đọc bản đồ bay',
    subtitle: 'Giải mã công thức hàm phân thức tổng quát f(x) = (ax + b) / (cx + d)',
    badgeName: 'Học viên Lý thuyết',
    theoryBrief: 'Đường bay của phi cơ được điều khiển bởi 4 tham số a, b, c, d. Không cần học thuộc vội! Hãy bấm vào từng tham số để xem nó làm gì.',
    initialParams: { a: 2, b: 1, c: 1, d: 3 },
    startX: 0,
    paramGuides: {
      a: 'Hệ số a ở tử số: Cùng với c quyết định trần bay ổn định của máy bay.',
      b: 'Hệ số b ở tử số: Thay đổi độ cao ban đầu khi cất cánh f(0).',
      c: 'Hệ số c ở mẫu số: Xuất hiện ở cả trần bay và bức tường cấm bay.',
      d: 'Hệ số d ở mẫu số: Cùng với c quyết định vị trí bức tường cấm bay.'
    },
    quizQuestion: 'Biểu thức f(x) = (ax + b)/(cx + d) có mẫu số là gì?',
    quizOptions: [
      { id: 'A', text: 'Mẫu số là (cx + d)', correct: true },
      { id: 'B', text: 'Mẫu số là (ax + b)', correct: false },
      { id: 'C', text: 'Mẫu số là (a/c)', correct: false }
    ],
    hint: 'Phân số có dạng Tử số / Mẫu số. Phần nằm ở dưới dấu gạch ngang chính là mẫu số cx + d.',
    unlockedConcept: 'Hàm phân thức bậc nhất trên bậc nhất: Tử số ax + b, Mẫu số cx + d.'
  },

  {
    stage: 3,
    phase: 1,
    id: 'STAGE_3',
    code: 'ẢI 3',
    title: 'Observation Lab — Quan sát thực nghiệm',
    subtitle: 'Thử nghiệm bay xa với hàm số f(x) = (2x + 1)/(x + 3) và theo dõi số liệu',
    badgeName: 'Nhà quan sát bay',
    theoryBrief: 'Khoa học bắt đầu từ quan sát. Hãy cho máy bay bay tới các khoảng cách x rất lớn và xem độ cao có tăng mãi mãi không.',
    initialParams: { a: 2, b: 1, c: 1, d: 3 },
    startX: 0,
    samplePoints: [
      { x: 0, y: 0.33, note: 'Khởi hành' },
      { x: 1, y: 0.75, note: 'Tăng nhanh' },
      { x: 5, y: 1.38, note: 'Tăng chậm lại' },
      { x: 10, y: 1.62, note: 'Đường bay cong ngang' },
      { x: 100, y: 1.95, note: 'Tiến sát số 2' },
      { x: 1000, y: 1.995, note: 'Gần như không tăng thêm!' }
    ],
    quizQuestion: 'Nhìn vào bảng số liệu: Khi x tăng cực lớn (100 -> 1000), độ cao f(x) có xu hướng như thế nào?',
    quizOptions: [
      { id: 'A', text: 'Tiếp tục tăng vùn vụt lên hàng nghìn mét', correct: false },
      { id: 'B', text: 'Tăng chậm dần và tiến cực sát về độ cao 2', correct: true },
      { id: 'C', text: 'Giảm dần về số 0', correct: false }
    ],
    hint: 'Hãy nhìn hai giá trị cuối cùng: tại x = 100 thì f(x) = 1.95; tại x = 1000 thì f(x) = 1.995. Cả hai đều đang tiến gần số 2.',
    unlockedConcept: 'Độ cao bị chặn trên bởi một mức thăng bằng khi bay xa vô tận.'
  },

  {
    stage: 4,
    phase: 1,
    id: 'STAGE_4',
    code: 'ẢI 4',
    title: 'Limit Lab — Khám phá Giới hạn & Trần bay',
    subtitle: 'Tìm ra công thức Tiệm cận ngang khi bay về hai đầu vô cực',
    badgeName: 'Thợ săn Giới hạn',
    theoryBrief: 'Mức độ cao ổn định mà máy bay không bao giờ vượt qua khi x tiến ra vô cực được gọi là TIỆM CẬN NGANG (Trần bay).',
    initialParams: { a: 2, b: 1, c: 1, d: 3 },
    startX: 0,
    quizQuestion: 'Khi x rất lớn, số +1 và +3 trở nên quá nhỏ so với x. Tỷ số (2x + 1)/(x + 3) xấp xỉ bằng (2x)/(x) = ?',
    quizOptions: [
      { id: 'A', text: 'Bằng 2 (tức y = 2)', correct: true },
      { id: 'B', text: 'Bằng 1 (tức y = 1)', correct: false },
      { id: 'C', text: 'Bằng 3 (tức y = 3)', correct: false }
    ],
    hint: 'Triệt tiêu x ở cả tử và mẫu: (2x) / (1x) = 2/1 = 2.',
    unlockedFormula: '\\lim_{x \\to \\pm\\infty} \\frac{ax+b}{cx+d} = \\frac{a}{c} \\implies \\boxed{y = \\frac{a}{c}} \\quad (\\text{Tiệm cận ngang})',
    unlockedConcept: 'Tiệm cận ngang y = a/c là trần bay ổn định của phi cơ khi x -> ±∞.'
  },

  {
    stage: 5,
    phase: 1,
    id: 'STAGE_5',
    code: 'ẢI 5',
    title: 'Critical Lab — Vùng cấm bay & Tiệm cận đứng',
    subtitle: '🚨 Cảnh báo khẩn cấp: Bức tường kỳ dị khiến mẫu số triệt tiêu về 0',
    badgeName: 'Chinh phục Vùng cấm',
    theoryBrief: 'Một hệ thống mới: f(x) = (2x+1)/(x-3). Có một tọa độ x bí ẩn mà máy bay KHÔNG THỂ bay qua! Hãy điều tra tìm nó.',
    initialParams: { a: 2, b: 1, c: 1, d: -3 },
    startX: 0,
    targetCriticalX: 3,
    quizQuestion: 'Điều gì xảy ra với mẫu số (x - 3) tại đúng vị trí x = 3 khiến máy tính báo lỗi khẩn cấp?',
    quizOptions: [
      { id: 'A', text: 'Mẫu số bằng 0 (phép chia cho 0 không xác định)', correct: true },
      { id: 'B', text: 'Mẫu số bằng 3', correct: false },
      { id: 'C', text: 'Mẫu số bằng -3', correct: false }
    ],
    hint: 'Thay x = 3 vào mẫu số: 3 - 3 = 0. Trong toán học, chia cho 0 là điều cấm kỵ sinh ra sự bất ổn vô hạn!',
    unlockedFormula: 'cx + d = 0 \\implies cx = -d \\implies \\boxed{x = -\\frac{d}{c}} \\quad (\\text{Tiệm cận đứng})',
    unlockedConcept: 'Tiệm cận đứng x = -d/c là bức tường cấm bay sinh ra do mẫu số triệt tiêu về 0.'
  },

  // ================= PHASE 2: LUYỆN TẬP & VẬN DỤNG =================
  {
    stage: 6,
    phase: 2,
    id: 'STAGE_6',
    code: 'ẢI 6',
    title: 'Exercise Room — Phòng sát hạch kỹ năng',
    subtitle: 'Vận dụng 2 công thức vừa phát hiện để xác định nhanh các đường tiệm cận',
    badgeName: 'Phi công Sát hạch',
    theoryBrief: 'Đã đến lúc kiểm tra phản xạ! Dùng 2 công thức: TCĐ: x = -d/c và TCN: y = a/c.',
    challenges: [
      {
        question: 'Tìm Tiệm cận đứng của hàm số: f(x) = (3x + 2) / (2x - 4)',
        expectedAnswer: '2',
        hint: 'Cho mẫu số bằng 0: 2x - 4 = 0 => 2x = 4 => x = 4/2 = 2.',
        formulaKey: 'x = 2'
      },
      {
        question: 'Tìm Tiệm cận ngang của hàm số: f(x) = (3x + 2) / (2x - 4)',
        expectedAnswer: '1.5', // or 3/2
        hint: 'Lấy hệ số a chia cho c: a = 3, c = 2 => y = 3/2 = 1.5.',
        formulaKey: 'y = 3/2'
      }
    ],
    unlockedConcept: 'Thành thạo kỹ năng tính nhanh Tiệm cận đứng và Tiệm cận ngang.'
  },

  {
    stage: 7,
    phase: 2,
    id: 'STAGE_7',
    code: 'ẢI 7',
    title: 'Problem Lab — Kỹ sư Thiết kế & Đừng tin AI',
    subtitle: 'Bài toán ngược: Thiết kế đường bay và kiểm chứng phản biện tuyên bố của AI',
    badgeName: 'Kỹ sư Thiết kế Bay',
    theoryBrief: 'Nhà khoa học không chỉ giải toán xuôi mà còn thiết kế ngược và biết nghi ngờ, kiểm chứng kết luận của AI.',
    initialParams: { a: 3, b: 1, c: 1, d: -2 },
    challengeType: 'DESIGN_AND_CRITIQUE',
    taskDesign: 'Trung tâm yêu cầu: Thiết kế chuyến bay có TCĐ x = 2 và TCN y = 3. Em cần chọn c = 1 thì a và d bằng bao nhiêu?',
    quizOptions: [
      { id: 'A', text: 'a = 3 và d = -2 (vì y = 3/1 = 3 và x = -(-2)/1 = 2)', correct: true },
      { id: 'B', text: 'a = 2 và d = 3', correct: false },
      { id: 'C', text: 'a = 1 và d = 2', correct: false }
    ],
    critiqueQuestion: 'AI tuyên bố: "Nếu d tăng thì TCĐ x = -d/c luôn dịch sang phải". Tuyên bố này:',
    critiqueOptions: [
      { id: 'A', text: 'Chưa chắc! Nếu c âm (c = -1) thì x = d, khi d tăng x mới tăng; nhưng nếu c dương (c = 1) thì x = -d, d tăng x lại giảm sang trái!', correct: true },
      { id: 'B', text: 'Luôn đúng trong mọi trường hợp', correct: false }
    ],
    hint: 'Nhìn vào công thức x = -d/c. Dấu của c quyết định chiều biến thiên!',
    unlockedConcept: 'Tư duy phản biện khoa học: Luôn kiểm tra điều kiện của mẫu số và dấu của hệ số.'
  },

  // ================= PHASE 3: THỰC HÀNH BAY & TỐT NGHIỆP =================
  {
    stage: 8,
    phase: 3,
    id: 'STAGE_8',
    code: 'ẢI 8',
    title: 'Flight Simulator — Buồng lái mô phỏng toàn diện',
    subtitle: 'Chào mừng lên buồng lái chuyên nghiệp: Tự do điều khiển toàn bộ công cụ',
    badgeName: 'Cơ trưởng Mô phỏng',
    theoryBrief: 'Bây giờ em đã là một phi công nghiên cứu thực thụ! Toàn bộ hệ thống Radar, Đồng hồ HUD, Hộp đen Telemetry và các tham số a, b, c, d đã được mở khóa.',
    initialParams: { a: 2, b: 1, c: 1, d: -4 }, // VA x = 4, HA y = 2
    startX: 0,
    isFullSimulator: true,
    flightMissionTask: 'Thực hiện một chuyến bay an toàn: Bay từ x = 0, khảo sát trần bay y = 2 và tránh bức tường nguy hiểm x = 4.',
    unlockedConcept: 'Làm chủ buồng lái mô phỏng toán học toàn diện.'
  },

  {
    stage: 9,
    phase: 3,
    id: 'STAGE_9',
    code: 'ẢI 9',
    title: 'Final Flight — Chuyến bay Thử nghiệm Tốt nghiệp',
    subtitle: '🏆 Bài thi tốt nghiệp: Giải mã con tàu bí ẩn và nhận Chứng Chỉ Danh Dự',
    badgeName: 'Nhà Nghiên Cứu Tốt Nghiệp',
    theoryBrief: 'Hệ thống giấu kín phương trình. Bằng kỹ năng bay, em hãy xác định Tiệm cận đứng và Tiệm cận ngang của phi cơ bí ẩn này.',
    initialParams: { a: 4, b: 2, c: 2, d: -6 }, // Hidden: VA = 3, HA = 2
    hiddenParams: true,
    startX: 0,
    isFinalFlight: true,
    quizQuestion: 'Dựa vào dữ liệu bay thực nghiệm, cặp tiệm cận (TCĐ, TCN) của phi cơ bí ẩn là:',
    quizOptions: [
      { id: 'A', text: 'Tiệm cận đứng x = 3 và Tiệm cận ngang y = 2', correct: true },
      { id: 'B', text: 'Tiệm cận đứng x = 2 và Tiệm cận ngang y = 4', correct: false },
      { id: 'C', text: 'Tiệm cận đứng x = -3 và Tiệm cận ngang y = 1', correct: false }
    ],
    hint: 'Cho máy bay bay tới x = 1000 để thấy trần bay tiến về 2. Sau đó kiểm tra điểm báo động STALL tại x = 3.',
    unlockedConcept: 'TỐT NGHIỆP XUẤT SẮC! ĐÃ ĐẠT CHUẨN FLIGHT RESEARCHER CERTIFIED.'
  }
];
