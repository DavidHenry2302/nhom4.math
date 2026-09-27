/**
 * MisconceptionEngine.js
 * Identifies and provides deep pedagogical feedback for common student mathematical misconceptions.
 */

export class MisconceptionEngine {
  static getMisconceptionDetails(code) {
    const registry = {
      'FORGOT_SIGN': {
        title: 'Lỗi chuyển vế đổi dấu',
        explanation: 'Khi giải phương trình mẫu số triệt tiêu (ví dụ: x + 3 = 0), chuyển vế hạng tử tự do qua vế phải bắt buộc phải đổi dấu (+3 thành -3).',
        socraticQuestion: 'Nếu thay số 3 vào mẫu số x + 3, kết quả là 3 + 3 = 6 (chưa triệt tiêu). Vậy số nào cộng với 3 mới bằng 0?'
      },
      'CONFUSED_HA_WITH_VA': {
        title: 'Nhầm lẫn giữa Tiệm cận đứng và Tiệm cận ngang',
        explanation: 'Tiệm cận đứng là đường thẳng thẳng đứng song song trục tung (phương trình có dạng x = x₀). Tiệm cận ngang là đường nằm ngang song song trục hoành (phương trình dạng y = y₀).',
        socraticQuestion: 'Độ cao máy bay thay đổi theo trục tung y hay trục hoành x?'
      },
      'CONFUSED_VA_WITH_HA': {
        title: 'Nhầm lẫn giữa Tiệm cận ngang và Tiệm cận đứng',
        explanation: 'Tiệm cận ngang là mức cao độ ổn định y mà máy bay tiến gần khi bay xa vô tận.',
        socraticQuestion: 'Trần bay ổn định là đường nằm ngang hay thẳng đứng?'
      },
      'INVERTED_RATIO': {
        title: 'Nghịch đảo tỷ số hệ số',
        explanation: 'Khi x tiến ra vô cực, f(x) ≈ (ax)/(cx) = a/c. Hệ số của tử số a nằm ở trên, hệ số của mẫu c nằm ở dưới.',
        socraticQuestion: 'Bậc cao nhất ở tử số có hệ số là gì? Bậc cao nhất ở mẫu có hệ số là gì?'
      },
      'FORGOT_NEGATIVE_SIGN_FORMULA': {
        title: 'Quên dấu trừ trong công thức Tiệm cận đứng',
        explanation: 'Từ phương trình cx + d = 0, ta có cx = -d, do đó nghiệm là x = -d/c.',
        socraticQuestion: 'Khi chuyển số hạng d qua dấu bằng thì d mang dấu gì?'
      },
      'IGNORED_SIGN_OF_C': {
        title: 'Bỏ qua ảnh hưởng của dấu tham số c',
        explanation: 'Tọa độ tiệm cận đứng là x = -d/c. Chiều thay đổi của x khi d tăng phụ thuộc trực tiếp vào dấu của c.',
        socraticQuestion: 'Khi c là số âm (ví dụ c = -1), -d/(-1) sẽ bằng +d hay -d?'
      },
      'MISSED_HOLE': {
        title: 'Ngộ nhận về mẫu số bằng 0 luôn tạo tiệm cận đứng',
        explanation: 'Khi tử số và mẫu số có nhân tử chung triệt tiêu (ad - bc = 0), đồ thị chỉ bị khuyết một điểm (Điểm thủng - Hole), không hình thành tiệm cận đứng.',
        socraticQuestion: 'Liệu tử số có thể chia hết cho mẫu số để rút gọn hoàn toàn không?'
      }
    };

    return registry[code] || null;
  }
}
