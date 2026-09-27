/**
 * MissionsData.js
 * Complete curriculum data for Flight Math Lab:
 * - Foundation Lab (F1 - F4)
 * - Missions 0 to 10 + Mission 7.5 (Hole)
 * - Capstone Final Mission
 * - Mini-Labs (Adaptive Remediation) & Expert Missions
 */

export const MISSIONS_DATA = [
  // ================= FOUNDATION LAB =================
  {
    id: 'F1',
    category: 'FOUNDATION',
    code: 'F1',
    title: 'F1 — Điều khiển tọa độ x',
    rank: 'CADET',
    story: 'Chào mừng Cadet đến với trung tâm bay. Trước khi cất cánh, chúng ta cần làm quen với tọa độ của không gian bay.',
    mystery: 'Khi em thay đổi giá trị x, chiếc máy bay di chuyển theo phương nào?',
    initialParams: { a: 0, b: 2, c: 0, d: 1 }, // f(x) = 2 (bay ngang)
    startX: 0,
    predictionPrompt: 'Theo em, biến số x đại diện cho điều gì trong mô phỏng bay?',
    predictionOptions: [
      { id: 'A', text: 'Vị trí theo phương ngang (khoảng cách bay)', correct: true },
      { id: 'B', text: 'Cao độ máy bay so với mặt đất', correct: false },
      { id: 'C', text: 'Vận tốc động cơ', correct: false }
    ],
    flightTask: 'Hãy kéo thanh trượt x từ 0 sang 10 và quan sát máy bay trên màn hình radar.',
    reasoningPrompt: 'Em nhận xét gì về hướng di chuyển khi x tăng dần?',
    expectedAnswer: { type: 'CHOICE', correctId: 'A' },
    hints: [
      'Nhìn vào trục tọa độ nằm ngang ở đáy màn hình radar.',
      'Trục hoành được đánh dấu bằng chữ x.',
      'x chính là tọa độ vị trí theo phương ngang của chuyến bay.',
      'x tăng nghĩa là máy bay di chuyển từ trái sang phải theo phương ngang.'
    ],
    unlockedFormula: 'x \\text{ : Biến số đầu vào (Vị trí ngang)}',
    logConclusion: ' Cadet hiểu x là biến độc lập đại diện cho khoảng cách bay dọc theo trục hoành.'
  },

  {
    id: 'F2',
    category: 'FOUNDATION',
    code: 'F2',
    title: 'F2 — f(x) là gì? (Input → Function → Output)',
    rank: 'CADET',
    story: 'Hệ thống máy tính điều khiển bay nhận tọa độ vị trí x làm đầu vào và tính toán ra độ cao f(x).',
    mystery: 'Nếu phương trình độ cao là f(x) = 2x + 1, khi máy bay đến vị trí x = 2, độ cao f(2) sẽ bằng bao nhiêu?',
    initialParams: { a: 2, b: 1, c: 0, d: 1 }, // f(x) = 2x + 1
    startX: 0,
    predictionPrompt: 'Tính giá trị f(2) khi f(x) = 2x + 1:',
    predictionOptions: [
      { id: 'A', text: 'f(2) = 4', correct: false },
      { id: 'B', text: 'f(2) = 5', correct: true },
      { id: 'C', text: 'f(2) = 3', correct: false }
    ],
    flightTask: 'Bấm BAY THỬ hoặc nhảy tới x = 2 để Hộp đen ghi nhận độ cao thực tế f(2).',
    reasoningPrompt: 'Quy tắc nào biến đổi số 2 thành số 5 trong máy tính bay?',
    expectedAnswer: { type: 'NUMERIC', value: 5 },
    hints: [
      'Thay số 2 vào vị trí của x trong biểu thức 2x + 1.',
      'Ta có phép tính: 2 * 2 + 1.',
      '2 nhân 2 bằng 4, cộng thêm 1 là 5.',
      'Đáp số là 5. Hàm số f(x) là quy tắc gán mỗi giá trị x với một độ cao f(x) duy nhất.'
    ],
    unlockedFormula: 'f(x) = 2x + 1 \\implies f(2) = 5 \\quad \\text{(Quy tắc Ánh xạ)}',
    logConclusion: 'Cadet hiểu rõ cơ chế: x (Input) -> Hàm số f -> f(x) (Output: Độ cao).'
  },

  {
    id: 'F3',
    category: 'FOUNDATION',
    code: 'F3',
    title: 'F3 — Mẫu số & Sự bất ổn',
    rank: 'CADET',
    story: 'Bây giờ chúng ta xét một hệ thống điều khiển có phân thức: f(x) = 1 / (x - 2).',
    mystery: 'Điều gì xảy ra với máy bay khi x tiến rất gần đến giá trị 2?',
    initialParams: { a: 0, b: 1, c: 1, d: -2 }, // f(x) = 1 / (x - 2)
    startX: 0,
    predictionPrompt: 'Khi x = 2, mẫu số (x - 2) bằng bao nhiêu và phép chia 1/0 có thực hiện được không?',
    predictionOptions: [
      { id: 'A', text: 'Mẫu số = 0, phép chia không xác định', correct: true },
      { id: 'B', text: 'Mẫu số = 2, f(2) = 0.5', correct: false },
      { id: 'C', text: 'f(2) = 0', correct: false }
    ],
    flightTask: 'Cho máy bay bay từ x = 0 đến x = 1.95 và quan sát cao độ trên Hộp đen.',
    reasoningPrompt: 'Tại sao khi x càng gần 2 thì độ cao lại tăng vọt bất thường?',
    expectedAnswer: { type: 'CHOICE', correctId: 'A' },
    hints: [
      'Thay x = 2 vào mẫu số: 2 - 2 = ?',
      'Trong số học, phép chia cho 0 là không xác định.',
      'Khi mẫu số tiến dần về 0 từ số dương nhỏ (0.1, 0.01), phân số 1/mẫu sẽ trở nên cực kỳ lớn.',
      'Tại x = 2, hàm số không xác định. Đây là nguyên nhân sinh ra sự bất ổn định.'
    ],
    unlockedFormula: 'x - 2 = 0 \\implies x = 2 \\quad \\text{(Điểm mẫu số triệt tiêu)}',
    logConclusion: 'Cadet phát hiện: Mẫu số bằng 0 tạo ra vùng kỳ dị không xác định.'
  },

  {
    id: 'F4',
    category: 'FOUNDATION',
    code: 'F4',
    title: 'F4 — "Tiến gần" không có nghĩa là "Bằng"',
    rank: 'CADET',
    story: 'Trong nghiên cứu bay, khái niệm Giới hạn (Limit) mô tả xu hướng khi máy bay đến rất gần một vị trí mà không nhất thiết phải chạm tới vị trí đó.',
    mystery: 'Xét dãy tọa độ x: 1.9, 1.99, 1.999, 1.9999... Biến x đang tiến dần tới số nào?',
    initialParams: { a: 0, b: 1, c: 1, d: -2 },
    startX: 1.0,
    predictionPrompt: 'Dãy số 1.9, 1.99, 1.999, 1.9999... đang tiến gần giá trị nào nhất?',
    predictionOptions: [
      { id: 'A', text: 'Tiến gần tới 2', correct: true },
      { id: 'B', text: 'Tiến gần tới 1', correct: false },
      { id: 'C', text: 'Tiến gần tới vô cực', correct: false }
    ],
    flightTask: 'Quan sát các mốc x trong bảng dữ liệu Hộp đen và khoảng cách đến điểm 2.',
    reasoningPrompt: 'Dù x có thể là 1.99999999, x đã bằng 2 chưa?',
    expectedAnswer: { type: 'NUMERIC', value: 2 },
    hints: [
      'Lấy 2 trừ đi các số trong dãy: 2 - 1.9 = 0.1; 2 - 1.99 = 0.01; 2 - 1.999 = 0.001.',
      'Khoảng cách giữa x và 2 đang co dần về 0.',
      'x có thể tiến gần 2 bao nhiêu tùy ý nhưng chưa bao giờ chạm vào 2.',
      'Ký hiệu toán học của hiện tượng này là x -> 2.'
    ],
    unlockedFormula: 'x \\to 2 \\quad (x \\ne 2) \\quad \\text{Khái niệm tiếp cận}',
    logConclusion: 'Cadet nắm chắc khái niệm cốt lõi: x -> x0 biểu thị xu hướng tiếp cận vô hạn mà không cần trùng.'
  },

  // ================= MAIN MISSIONS =================
  {
    id: 'M0',
    category: 'STANDARD',
    code: 'M0',
    title: 'Mission 0 — Làm quen hệ thống điều khiển',
    rank: 'CADET',
    story: 'Chào mừng đến phòng nghiên cứu Flight Lab. Trước mắt em là bộ điều khiển toán học f(x) = (ax+b)/(cx+d).',
    mystery: 'Có 4 tham số a, b, c, d. Hãy thử thay đổi tham số a và quan sát xem điều gì xảy ra với đường bay của máy bay?',
    initialParams: { a: 2, b: 1, c: 1, d: 3 }, // f(x) = (2x+1)/(x+3)
    startX: 0,
    predictionPrompt: 'Em chưa cần hiểu hết công thức. Khi kéo thanh slider tham số a, em dự đoán máy bay sẽ:',
    predictionOptions: [
      { id: 'A', text: 'Thay đổi hình dáng và độ cao đường bay', correct: true },
      { id: 'B', text: 'Không có bất kỳ thay đổi nào', correct: false },
      { id: 'C', text: 'Biến mất khỏi màn hình ngay lập tức', correct: false }
    ],
    flightTask: 'Kéo thử slider a từ 1 đến 5 trên bảng điều khiển bên phải.',
    reasoningPrompt: 'Em vừa thay đổi tham số a. Nhưng câu hỏi thú vị hơn là: tham số nào thực sự điều khiển điều gì?',
    expectedAnswer: { type: 'CHOICE', correctId: 'A' },
    hints: [
      'Kéo slider a sang phải để tăng giá trị lên 4 hoặc 5.',
      'Nhìn vào đường bay huỳnh quang màu xanh trên màn hình radar.',
      'Độ cao của đường cong rõ ràng bị dịch chuyển theo a.',
      'Các tham số a, b, c, d là các núm vặn điều khiển chuyến bay.'
    ],
    unlockedFormula: 'f(x) = \\frac{ax+b}{cx+d} \\quad \\text{(Hệ thống phân thức tổng quát)}',
    logConclusion: 'Cadet khởi động thành công hệ thống tham số bay của Flight Math Lab.'
  },

  {
    id: 'M1',
    category: 'STANDARD',
    code: 'M1',
    title: 'Mission 1 — Máy bay đang đi đâu?',
    rank: 'CADET',
    story: 'Hệ thống được thiết lập tại f(x) = (2x+1)/(x+3). Máy bay chuẩn bị cất cánh từ x = 0.',
    mystery: 'Nếu cho máy bay bay về phía trước (tăng x từ 0 lên 1, 2, 5, 10), độ cao mô phỏng sẽ thay đổi thế nào?',
    initialParams: { a: 2, b: 1, c: 1, d: 3 },
    startX: 0,
    predictionPrompt: '🧠 Dự đoán trước khi bay: Nếu tăng x, em nghĩ độ cao mô phỏng sẽ:',
    predictionOptions: [
      { id: 'A', text: 'Tăng đều đặn theo đường thẳng', correct: false },
      { id: 'B', text: 'Giảm dần về 0', correct: false },
      { id: 'C', text: 'Tăng nhưng tăng chậm dần, uốn cong', correct: true },
      { id: 'D', text: 'Chưa thể biết trước', correct: false }
    ],
    flightTask: 'Bấm [▶ BAY THỬ] để máy bay bay từ x = 0 tới x = 10 và theo dõi Hộp đen.',
    reasoningPrompt: 'Nhìn vào bảng dữ liệu: x = 0 -> 0.33; x = 2 -> 1.00; x = 10 -> 1.73. Độ cao có tiếp tục tăng mãi theo đường dốc đứng không?',
    expectedAnswer: { type: 'CHOICE', correctId: 'C' },
    hints: [
      'Bấm nút [▶ BAY THỬ] và nhìn vào bảng số liệu bên dưới.',
      'Khoảng tăng từ x=0 lên x=1 là 0.75 - 0.33 = +0.42.',
      'Khoảng tăng từ x=9 lên x=10 nhỏ hơn nhiều (chỉ khoảng 0.03).',
      'Độ dốc tiếp tuyến (slope) giảm dần, đường bay cong thoải dần sang ngang.'
    ],
    unlockedFormula: 'f(0) = \\frac{1}{3} \\approx 0.33, \\quad f(10) = \\frac{21}{13} \\approx 1.73',
    logConclusion: 'Cadet phát hiện: Quan hệ giữa x và f(x) không phải đường thẳng mà là đường cong có tốc độ tăng giảm dần.'
  },

  {
    id: 'M2',
    category: 'STANDARD',
    code: 'M2',
    title: 'Mission 2 — Máy bay có thể bay cao mãi không?',
    rank: 'CADET',
    story: 'Bây giờ chúng ta cấp thêm nhiên liệu cho máy bay bay xa hơn nữa: x = 10, 50, 100, 1000...',
    mystery: 'Điều kỳ lạ là x tiếp tục tăng cực lớn, nhưng độ cao gần như không tăng thêm. Độ cao đang tiến gần con số nào?',
    initialParams: { a: 2, b: 1, c: 1, d: 3 },
    startX: 10,
    predictionPrompt: 'Khi x = 1000, em đoán f(1000) = (2*1000 + 1)/(1000 + 3) sẽ xấp xỉ bao nhiêu?',
    predictionOptions: [
      { id: 'A', text: 'Xấp xỉ 2', correct: true },
      { id: 'B', text: 'Xấp xỉ 1000', correct: false },
      { id: 'C', text: 'Xấp xỉ 2000', correct: false }
    ],
    flightTask: 'Bấm nút [Nhảy tới x = 100] rồi [Nhảy tới x = 1000] để kiểm tra dữ liệu đo.',
    reasoningPrompt: 'Dãy số cao độ: 1.73, 1.94, 1.98, 1.998... Khi x -> +vô cực, f(x) bị chặn bởi con số nào?',
    expectedAnswer: { type: 'NUMERIC', value: 2 },
    hints: [
      'Nhìn vào tử số 2x + 1 và mẫu số x + 3 khi x rất lớn (ví dụ x = 1000).',
      '2*1000 + 1 = 2001, và 1000 + 3 = 1003.',
      'Lấy 2001 chia cho 1003, kết quả xấp xỉ bằng bao nhiêu?',
      '2001/1003 = 1.995... tiến cực sát số 2. Đường thẳng y = 2 được gọi là Tiệm cận ngang!'
    ],
    unlockedFormula: '\\lim_{x \\to +\\infty} f(x) = 2 \\implies \\boxed{y = 2} \\quad \\text{(Tiệm cận ngang)}',
    logConclusion: 'Cadet phát hiện Tiệm cận ngang y = 2 đóng vai trò như trần bay ổn định khi bay xa vô tận.'
  },

  {
    id: 'M3',
    category: 'PILOT',
    code: 'M3',
    title: 'Mission 3 — Thử bay ngược lại (x → -∞)',
    rank: 'PILOT',
    story: 'Học viện đặt câu hỏi: Liệu khi bay ngược chiều về bên trái (x tiến về âm vô cực x → -∞), trần bay ổn định có bị thay đổi?',
    mystery: 'Hãy cho máy bay bay về hướng x = -10, -50, -100, -1000.',
    initialParams: { a: 2, b: 1, c: 1, d: 3 },
    startX: -10,
    predictionPrompt: 'Khi x → -∞, em dự đoán giới hạn độ cao f(x) sẽ:',
    predictionOptions: [
      { id: 'A', text: 'Vẫn tiến gần về độ cao y = 2', correct: true },
      { id: 'B', text: 'Đổi thành y = -2', correct: false },
      { id: 'C', text: 'Tiến về âm vô cực', correct: false }
    ],
    flightTask: 'Bấm [BAY NGƯỢC] hoặc kiểm tra các giá trị x âm lớn (-100, -1000) trên Hộp đen.',
    reasoningPrompt: 'Tỷ số giữa các bậc cao nhất (2x) / (x) cho kết quả là bao nhiêu dù x là dương hay âm?',
    expectedAnswer: { type: 'NUMERIC', value: 2 },
    hints: [
      'Tính thử f(-1000) = (2*(-1000) + 1) / (-1000 + 3) = -1999 / -997.',
      'Âm chia âm cho ra kết quả mang dấu dương: -1999 / -997 ≈ 2.005.',
      'Dù bay về +vô cực hay -vô cực, tỷ số 2x/x luôn triệt tiêu x và tiến về 2/1.',
      'Công thức tổng quát cho tiệm cận ngang của f(x) = (ax+b)/(cx+d) khi c ≠ 0 là y = a/c.'
    ],
    unlockedFormula: '\\lim_{x \\to \\pm\\infty} f(x) = \\frac{a}{c} \\implies \\boxed{y = \\frac{a}{c}} \\quad \\text{(Quy luật Tiệm cận ngang)}',
    logConclusion: 'Pilot chứng minh tính đối xứng hai đầu vô cực của Tiệm cận ngang: y = a/c.'
  },

  {
    id: 'M4',
    category: 'PILOT',
    code: 'M4',
    title: 'Mission 4 — Vùng cấm bay (Critical Zone)',
    rank: 'PILOT',
    story: '🚨 CẢNH BÁO KHẨN CẤP: Trung tâm radar phát hiện một cấu hình điều khiển mới: f(x) = (2x+1)/(x-3).',
    mystery: 'Trong hệ thống này xuất hiện một "bức tường năng lượng vô hình" khiến máy bay không thể vượt qua. Hãy tìm giá trị tọa độ x nguy hiểm đó!',
    initialParams: { a: 2, b: 1, c: 1, d: -3 }, // f(x) = (2x+1)/(x-3)
    startX: 0,
    predictionPrompt: 'Cho máy bay tiếp cận dần: x = 0, 1, 2, 2.5, 2.9, 2.99. Em dự đoán điều gì sắp xảy ra?',
    predictionOptions: [
      { id: 'A', text: 'Máy bay bay qua êm ái như bình thường', correct: false },
      { id: 'B', text: 'Độ dốc và cao độ tăng vọt dữ dội và chạm ngưỡng báo động STALL', correct: true },
      { id: 'C', text: 'Độ cao quay ngược về 0', correct: false }
    ],
    flightTask: 'Bấm [BAY THỬ] từ x = 0 và quan sát còi báo động PULL UP khi x tiến gần bức tường.',
    reasoningPrompt: 'Tại tọa độ x nào máy bay bị hệ thống an toàn dừng khẩn cấp?',
    expectedAnswer: { type: 'NUMERIC', value: 3 },
    hints: [
      'Nhìn vào chuỗi dữ liệu hộp đen: x = 2 -> f(x) = -5; x = 2.9 -> f(x) = -68; x = 2.99 -> f(x) = -698 (hoặc tăng vọt nếu đi từ phải).',
      'Khoảng cách tới vùng nguy hiểm đang tiến về 0.',
      'Giá trị x mà máy bay không thể chạm tới là số nguyên nào?',
      'Đó chính là x = 3. Tại đó mẫu số x - 3 trở thành 0.'
    ],
    unlockedFormula: 'x \\to 3^- \\implies f(x) \\to -\\infty, \\quad x \\to 3^+ \\implies f(x) \\to +\\infty',
    logConclusion: 'Pilot phát hiện Vùng cấm bay tại x = 3 nơi cao độ bùng nổ ra vô cực.'
  },

  {
    id: 'M5',
    category: 'PILOT',
    code: 'M5',
    title: 'Mission 5 — Tự tìm Tiệm cận đứng',
    rank: 'PILOT',
    story: 'AI không đưa công thức. Người phi công nghiên cứu phải tự tìm ra cơ chế toán học tạo nên bức tường cấm bay ở Mission 4.',
    mystery: 'Điều gì đã xảy ra trong mẫu số (x - 3) tại đúng thời điểm x = 3?',
    initialParams: { a: 2, b: 1, c: 1, d: -3 },
    startX: 0,
    predictionPrompt: 'Khi x = 3, giá trị của biểu thức mẫu số (x - 3) bằng bao nhiêu?',
    predictionOptions: [
      { id: 'A', text: 'Mẫu số bằng 0', correct: true },
      { id: 'B', text: 'Mẫu số bằng 3', correct: false },
      { id: 'C', text: 'Mẫu số bằng 1', correct: false }
    ],
    flightTask: 'Hãy nhập công thức phương trình cần giải để tìm điểm mẫu số bằng 0 của mẫu tổng quát cx + d.',
    reasoningPrompt: 'Giải phương trình cx + d = 0, ta tìm được x bằng bao nhiêu theo c và d?',
    expectedAnswer: { type: 'ASYMPTOTE_FORMULA', variable: 'x', symbolic: '-d/c' },
    hints: [
      'Đặt mẫu số bằng 0: cx + d = 0.',
      'Chuyển số hạng d sang vế phải: cx = -d.',
      'Chia cả hai vế cho c (với c ≠ 0): x = ?',
      'Ta thu được công thức tiệm cận đứng tổng quát: x = -d/c. Hãy nhập -d/c.'
    ],
    unlockedFormula: 'cx + d = 0 \\iff cx = -d \\iff \\boxed{x = -\\frac{d}{c}} \\quad \\text{(Công thức Tiệm cận đứng)}',
    logConclusion: 'Pilot tự suy luận và chứng minh thành công công thức Tiệm cận đứng x = -d/c.'
  },

  {
    id: 'M6',
    category: 'RESEARCHER',
    code: 'M6',
    title: 'Mission 6 — "Đừng tin AI" (Tư duy phản biện)',
    rank: 'RESEARCHER',
    story: '🤖 AI INSTRUCTOR ĐƯA RA MỘT TUYÊN BỐ: "Nếu tham số d tăng lên thì đường tiệm cận đứng x = -d/c luôn luôn dịch chuyển sang bên phải (tăng giá trị x)".',
    mystery: 'Đừng vội tin lời AI! Liệu nhận định của AI có luôn đúng trong mọi trường hợp không? Hãy thiết kế một thí nghiệm để kiểm chứng.',
    initialParams: { a: 2, b: 1, c: -1, d: 2 }, // c = -1 !!
    startX: 0,
    predictionPrompt: 'Em nghĩ nhận định "d tăng thì tiệm cận đứng x = -d/c luôn dịch sang phải" là:',
    predictionOptions: [
      { id: 'A', text: 'Hoàn toàn đúng trong mọi trường hợp', correct: false },
      { id: 'B', text: 'Sai hoặc chưa đầy đủ: còn phụ thuộc vào dấu của c!', correct: true }
    ],
    flightTask: 'Thử nghiệm: Chọn c = -1, tăng d từ 2 lên 6. Quan sát vị trí tiệm cận đứng x = -d/c xem nó dịch sang phải hay sang trái?',
    reasoningPrompt: 'Khi c = -1: Với d = 2 thì x = -2/(-1) = 2. Với d = 6 thì x = -6/(-1) = 6. Nhưng nếu c = 1: d tăng thì x = -d giảm! Vậy chiều dịch chuyển phụ thuộc vào điều gì?',
    expectedAnswer: { type: 'CHOICE', correctId: 'B' },
    hints: [
      'Tính x = -d / c với 2 trường hợp c = 1 và c = -1.',
      'Trường hợp c = 1: x = -d. Khi d tăng (ví dụ d = 1 -> 5) thì x = -1 -> -5 (dịch sang TRÁI!).',
      'Trường hợp c = -1: x = d. Khi d tăng thì x tăng (dịch sang PHẢI).',
      'Như vậy tuyên bố của AI chỉ đúng khi c < 0, và hoàn toàn sai khi c > 0! Em vừa bác bỏ thành công nhận định của AI.'
    ],
    unlockedFormula: 'x = -\\frac{d}{c} \\implies \\frac{\\partial x}{\\partial d} = -\\frac{1}{c} \\quad \\text{(Dấu phụ thuộc vào c)}',
    logConclusion: 'Flight Researcher hoàn thành xuất sắc thử thách AI Literacy: Khoa học đòi hỏi kiểm chứng thực nghiệm, AI không phải chân lý tuyệt đối.'
  },

  {
    id: 'M7',
    category: 'RESEARCHER',
    code: 'M7',
    title: 'Mission 7 — Phòng thí nghiệm tham số (Matrix Lab)',
    rank: 'RESEARCHER',
    story: 'Toàn quyền điều khiển hệ thống 4 slider a, b, c, d được bàn giao cho Flight Researcher.',
    mystery: 'Nhiệm vụ: Hãy tìm xem từng tham số ảnh hưởng đến Tiệm cận ngang (TCN) hay Tiệm cận đứng (TCĐ)?',
    initialParams: { a: 2, b: 1, c: 1, d: 3 },
    startX: 0,
    predictionPrompt: 'Khi thay đổi tham số b, vị trí của Tiệm cận ngang và Tiệm cận đứng có bị thay đổi không?',
    predictionOptions: [
      { id: 'A', text: 'Cả 2 tiệm cận đều thay đổi vị trí', correct: false },
      { id: 'B', text: 'Tham số b không xuất hiện trong công thức vị trí của cả 2 tiệm cận (khi không triệt tiêu nhân tử)', correct: true },
      { id: 'C', text: 'Chỉ có tiệm cận đứng thay đổi', correct: false }
    ],
    flightTask: 'Lần lượt kéo từng thanh a, b, c, d và quan sát 2 đường tiệm cận huỳnh quang trên màn hình.',
    reasoningPrompt: 'Tóm lại: Tham số nào quyết định Tiệm cận ngang y? Tham số nào quyết định Tiệm cận đứng x?',
    expectedAnswer: { type: 'CHOICE', correctId: 'B' },
    hints: [
      'Nhìn lại 2 công thức đã mở khóa: TCN là y = a/c; TCĐ là x = -d/c.',
      'Trong công thức y = a/c chỉ có mặt a và c.',
      'Trong công thức x = -d/c chỉ có mặt d và c.',
      'Tham số b chỉ ảnh hưởng đến giao điểm với trục tung f(0) = b/d và độ cong, không làm dời vị trí 2 tiệm cận (khi ad - bc ≠ 0).'
    ],
    unlockedFormula: '\\begin{cases} y_{\\text{TCN}} = \\dfrac{a}{c} & (\\text{phụ thuộc } a, c) \\\\[6pt] x_{\\text{TCĐ}} = -\\dfrac{d}{c} & (\\text{phụ thuộc } c, d) \\end{cases}',
    logConclusion: 'Flight Researcher xác lập ma trận tham số hoàn chỉnh của hàm nhất biến.'
  },

  {
    id: 'M7_5',
    category: 'ADVANCED',
    code: 'M7.5',
    title: 'Mission 7.5 — "Chiếc máy bay biến mất" (Điểm thủng - Hole)',
    rank: 'RESEARCHER',
    story: 'Một kỹ sư vô tình thiết lập cấu hình: a = 2, b = 4, c = 1, d = 2. Tức hàm số f(x) = (2x+4)/(x+2).',
    mystery: 'Mẫu số có x + 2 = 0 tại x = -2. Nhưng tại sao trên màn hình radar lại KHÔNG CÓ đường tiệm cận đứng màu đỏ?',
    initialParams: { a: 2, b: 4, c: 1, d: 2 }, // ad - bc = 4 - 4 = 0 !!
    startX: 0,
    predictionPrompt: 'Rút gọn phân thức f(x) = (2x+4)/(x+2) = 2(x+2)/(x+2) với điều kiện x ≠ -2. Hàm số trở thành:',
    predictionOptions: [
      { id: 'A', text: 'Đường thẳng hằng số y = 2 với một điểm thủng (Hole) tại x = -2', correct: true },
      { id: 'B', text: 'Đường cong hypebol bình thường', correct: false },
      { id: 'C', text: 'Hàm số không xác định trên toàn trục số', correct: false }
    ],
    flightTask: 'Quan sát ký hiệu hình tròn thủng tại tọa độ (-2, 2) trên radar. Máy bay bay qua đường nằm ngang y = 2.',
    reasoningPrompt: 'Điều kiện đại số nào giữa a, b, c, d dẫn đến việc tử và mẫu triệt tiêu nhau hoàn toàn?',
    expectedAnswer: { type: 'CHOICE', correctId: 'A' },
    hints: [
      'Tính biểu thức định thức: a*d - b*c.',
      'Ở đây: 2*2 - 4*1 = 4 - 4 = 0.',
      'Khi ad - bc = 0, tử số là bội số của mẫu số: (2x+4) = 2*(x+2).',
      'Nhân tử chung (x+2) bị triệt tiêu! Không có tiệm cận đứng, chỉ có một điểm gián đoạn khử được (Removable Discontinuity).'
    ],
    unlockedFormula: 'ad - bc = 0 \\implies f(x) = \\frac{a}{c} \\quad (x \\ne -\\frac{d}{c}) \\quad \\text{[Điểm thủng - Hole]}',
    logConclusion: 'Flight Researcher khám phá trường hợp suy biến kỳ thú: Khử nhân tử loại bỏ tiệm cận đứng.'
  },

  {
    id: 'M8',
    category: 'ADVANCED',
    code: 'M8',
    title: 'Mission 8 — Thiết kế chuyến bay (Flight Design)',
    rank: 'RESEARCHER',
    story: 'Trung tâm không lưu giao nhiệm vụ thiết kế đường bay an toàn theo yêu cầu tác chiến hàng không.',
    mystery: 'Nhiệm vụ: Hãy tìm bộ tham số (a, b, c, d) để hệ thống đạt chính xác Tiệm cận đứng x = 2 và Tiệm cận ngang y = 3.',
    initialParams: { a: 1, b: 1, c: 1, d: 1 },
    startX: 0,
    predictionPrompt: 'Từ công thức x = -d/c = 2 và y = a/c = 3, nếu ta chọn c = 1 thì d và a phải bằng bao nhiêu?',
    predictionOptions: [
      { id: 'A', text: 'a = 3, d = -2 (chọn b = 1)', correct: true },
      { id: 'B', text: 'a = 2, d = 3', correct: false },
      { id: 'C', text: 'a = -3, d = 2', correct: false }
    ],
    flightTask: 'Chỉnh các thanh slider sao cho a = 3, c = 1, d = -2 (và b = 1) rồi bấm [NGHIỆM THU HỆ THỐNG].',
    reasoningPrompt: 'Kiểm tra lại: Tiệm cận đứng có đúng là x = -(-2)/1 = 2 và Tiệm cận ngang y = 3/1 = 3 không?',
    expectedAnswer: { type: 'DESIGN_VALIDATION', targetVA: 2, targetHA: 3 },
    hints: [
      'Với c = 1: -d/1 = 2 => d = -2.',
      'Với c = 1: a/1 = 3 => a = 3.',
      'Chọn b bất kỳ sao cho ad - bc ≠ 0 (ví dụ chọn b = 1, khi đó 3*(-2) - 1*1 = -7 ≠ 0).',
      'Ta thu được hàm số: f(x) = (3x + 1) / (x - 2).'
    ],
    unlockedFormula: '\\begin{cases} -d/c = 2 \\\\[4pt] a/c = 3 \\end{cases} \\implies f(x) = \\frac{3x+1}{x-2} \\quad \\text{(Thiết kế thành công)}',
    logConclusion: 'Flight Researcher làm chủ bài toán ngược: Từ yêu cầu hình học tiệm cận kiến tạo phương trình hàm số.'
  },

  {
    id: 'M9',
    category: 'COMMANDER',
    code: 'M9',
    title: 'Mission 9 — "Máy bay bị mất dữ liệu" (Reverse Engineering)',
    rank: 'COMMANDER',
    story: 'Hệ thống lưu trữ bị sét đánh làm hỏng file phương trình. Chỉ còn lại bảng dữ liệu Hộp đen của chuyến bay cứu nạn.',
    mystery: 'Dữ liệu Hộp đen: (x=1, y=4), (x=2, y=7), (x=2.5, y=13), (x=2.9, y=61), (x=2.99, y=601). Hãy xác định tọa độ tiệm cận đứng bị mất!',
    initialParams: { a: 3, b: 1, c: 1, d: -3 }, // hidden formula
    startX: 1,
    predictionPrompt: 'Quan sát độ tăng phi mã: y tăng từ 4 -> 7 -> 13 -> 61 -> 601 khi x tiến gần số nào?',
    predictionOptions: [
      { id: 'A', text: 'Tiệm cận đứng tại x = 3', correct: true },
      { id: 'B', text: 'Tiệm cận đứng tại x = 2', correct: false },
      { id: 'C', text: 'Tiệm cận đứng tại x = 10', correct: false }
    ],
    flightTask: 'Kiểm tra bảng Telemetry, vẽ đồ thị điểm và tìm vị trí tiệm cận đứng.',
    reasoningPrompt: 'Khoảng cách giữa x và 3 đang là 0.1 (tại 2.9) rồi 0.01 (tại 2.99). Khi khoảng cách tiến về 0, độ cao tiến về đâu?',
    expectedAnswer: { type: 'NUMERIC', value: 3 },
    hints: [
      'Nhìn vào dãy x: 2.5, 2.9, 2.99...',
      'Dãy này đang tiến cực sát đến số nguyên 3.',
      'Khi x tiến sát 3, độ cao bùng nổ từ 61 lên 601.',
      'Đây là dấu hiệu kinh điển của tiệm cận đứng x = 3.'
    ],
    unlockedFormula: '\\lim_{x \\to 3^-} f(x) = +\\infty \\implies \\boxed{x = 3} \\quad \\text{(Khôi phục từ Hộp đen)}',
    logConclusion: 'Commander giải mã thành công dữ liệu Hộp đen bị mất bằng tư duy đảo ngược.'
  },

  {
    id: 'M10',
    category: 'COMMANDER',
    code: 'M10',
    title: 'Mission 10 — Điều tra sự cố bay (Incident Investigation)',
    rank: 'COMMANDER',
    story: '🚨 BÁO CÁO TAI NẠN: Một drone nghiên cứu bị mất kiểm soát cao độ trong chuyến bay thử nghiệm.',
    mystery: 'Dữ liệu ghi lại: (t=1, x=1.0, y=3), (t=2, x=1.8, y=8), (t=3, x=1.95, y=40), (t=4, x=1.99, y=200). Hãy kết luận nguyên nhân toán học dẫn đến sự cố!',
    initialParams: { a: 2, b: 0, c: 1, d: -2 }, // x_VA = 2
    startX: 1,
    predictionPrompt: 'Nguyên nhân cốt lõi khiến máy bay gặp nạn mất khống chế cao độ là:',
    predictionOptions: [
      { id: 'A', text: 'Đường bay lao vào lân cận Tiệm cận đứng x = 2 khiến cao độ tiến ra vô cực', correct: true },
      { id: 'B', text: 'Động cơ hết nhiên liệu rơi tự do', correct: false },
      { id: 'C', text: 'Gặp tiệm cận ngang', correct: false }
    ],
    flightTask: 'Lập biên bản điều tra tai nạn bằng cách xác nhận giá trị x kỳ dị của sự cố.',
    reasoningPrompt: 'Giới hạn lim(x -> 2^-) f(x) dẫn đến giá trị nào?',
    expectedAnswer: { type: 'NUMERIC', value: 2 },
    hints: [
      'Xem bảng ghi thời gian: x từ 1.0 -> 1.8 -> 1.95 -> 1.99.',
      'x đang tiến sát đến 2 từ bên trái (x -> 2^-).',
      'Độ cao phóng đại từ 3 lên 200, gia tốc thẳng đứng tiến tới vô hạn.',
      'Kết luận: Phi hành đoàn đã vi phạm khoảng cách an toàn với tiệm cận đứng x = 2.'
    ],
    unlockedFormula: '\\text{Biên bản điều tra sự cố: } \\lim_{x \\to 2^-} f(x) = +\\infty \\implies \\text{Sự cố Tiệm cận đứng x = 2}',
    logConclusion: 'Commander hoàn tất hồ sơ điều tra tai nạn hàng không với cơ sở toán học chuẩn xác.'
  },

  // ================= FINAL CAPSTONE MISSION =================
  {
    id: 'FINAL',
    category: 'CAPSTONE',
    code: 'FINAL',
    title: 'Final Mission — You Are The Flight Researcher',
    rank: 'COMMANDER',
    story: '🏆 CHỨNG CHỈ TỐT NGHIỆP: Học viện cấp cho bạn một hệ thống tàu bay thử nghiệm hoàn toàn mới với các tham số bị ẩn bí mật.',
    mystery: 'Không có công thức nào được hé lộ trước. Bằng kinh nghiệm thực nghiệm, bạn hãy tìm ra Tiệm cận đứng và Tiệm cận ngang của chiếc phi cơ này!',
    initialParams: { a: 4, b: 2, c: 2, d: -6 }, // hidden: VA = -(-6)/2 = 3, HA = 4/2 = 2
    hiddenParams: true,
    startX: 0,
    predictionPrompt: 'Hãy chạy các chuyến bay thử nghiệm, khảo sát dữ liệu x tiến ra vô cực và tìm điểm kỳ dị. Dự đoán cặp tiệm cận (x_VA, y_HA):',
    predictionOptions: [
      { id: 'A', text: 'Tiệm cận đứng x = 3, Tiệm cận ngang y = 2', correct: true },
      { id: 'B', text: 'Tiệm cận đứng x = 2, Tiệm cận ngang y = 4', correct: false },
      { id: 'C', text: 'Tiệm cận đứng x = -3, Tiệm cận ngang y = 1', correct: false }
    ],
    flightTask: 'Sử dụng toàn bộ công cụ: Bay thử, Bay ngược, Nhảy tọa độ, Hộp đen, và Bật Chế độ Khoa học để điều tra.',
    reasoningPrompt: 'Trình bày kết luận điều tra về hệ thống máy bay bí ẩn.',
    expectedAnswer: { type: 'CHOICE', correctId: 'A' },
    hints: [
      'Cho máy bay bay tới x = 1000 để tìm tiệm cận ngang: độ cao dừng ở mức nào?',
      'Tại x = 1000, f(x) tiến sát 2.0. Vậy Tiệm cận ngang là y = 2.',
      'Dò tìm vùng cấm bay nơi độ cao bùng nổ: thử các điểm x = 2, 2.5, 2.9, 3.1...',
      'Tại x = 3, còi báo động STALL hú vang. Vậy Tiệm cận đứng là x = 3.'
    ],
    unlockedFormula: '\\boxed{x = 3 \\quad \\& \\quad y = 2} \\implies \\text{HỆ THỐNG ĐÃ ĐƯỢC GIẢI MÃ}',
    logConclusion: 'XUẤT SẮC! Học viên đã hoàn thành toàn bộ khóa huấn luyện và chính thức được phong cấp FLIGHT RESEARCHER CERTIFIED.'
  }
];

/**
 * Mini-Labs for adaptive remediation when student struggles with linear denominator
 */
export const MINI_LABS = {
  DENOMINATOR_SOLVER: {
    id: 'MINI_DENOM',
    title: 'Mini-Lab: Khắc phục kỹ năng giải phương trình mẫu số',
    message: 'Có vẻ phần tìm giá trị làm mẫu số bằng 0 vẫn chưa chắc. Chúng ta cùng thực hiện một thí nghiệm ngắn để củng cố nền tảng.',
    steps: [
      { equation: 'x + 2 = 0', answer: -2, hint: 'Chuyển +2 sang vế phải đổi dấu thành -2.' },
      { equation: '2x + 4 = 0', answer: -2, hint: '2x = -4 => x = -4/2 = -2.' },
      { equation: 'cx + d = 0', symbolic: '-d/c', hint: 'cx = -d => x = -d/c.' }
    ]
  }
};
