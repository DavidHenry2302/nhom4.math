# BÁO CÁO SƠ KHẢO TỔNG QUAN DỰ ÁN FLIGHT MATH LAB

**Ngày khảo sát:** 26/09/2026  
**Phạm vi:** Tệp khởi chạy, tài liệu README, ứng dụng JavaScript chính, bộ kiểm thử, dữ liệu chương trình học, và các mô-đun trong `src/` cùng `css/`.

## 1. Tóm tắt điều hành

Flight Math Lab là ứng dụng web giáo dục Toán bằng tiếng Việt, dùng hình tượng buồng lái và hành trình bay để giúp học sinh khám phá hàm phân thức bậc nhất trên bậc nhất

\[
f(x)=\frac{ax+b}{cx+d}
\]

và các khái niệm giới hạn, tiệm cận ngang, tiệm cận đứng, điểm gián đoạn khử được. Người học tương tác với đồ thị/thông số, trả lời câu hỏi, nhận gợi ý, theo dõi tiến độ và khám phá các nhánh mở rộng. Ứng dụng được thiết kế chạy 100% phía trình duyệt (Front-end Web); tiến độ được lưu ở `localStorage`.

Dự án có nội dung sư phạm và bộ máy toán tương đối phong phú. Tuy vậy, trạng thái mã hiện có dấu hiệu của hai thế hệ kiến trúc: trang chính đang nạp một ứng dụng lớn độc lập trong `js/flight_lab_app.js`, trong khi `src/` chứa một ứng dụng mô-đun khác với `App.js`, `StageManager.js` và hành trình 9 ải. README mô tả hành trình 9 ải, nhưng ứng dụng đang được nạp lại mô tả tuyến chính 6 ải cùng 6 nhánh khám phá. Đây là điểm cần làm rõ trước khi phát triển tiếp.

## 2. Mục tiêu và đối tượng

- **Đối tượng dự kiến:** học sinh học hàm phân thức, giới hạn và tiệm cận; giáo viên có thể dùng như công cụ minh họa/thực hành.
- **Cách tiếp cận:** “thử nghiệm để tự phát hiện ra công thức”, chuyển biến số thành vị trí bay và giá trị hàm thành độ cao.
- **Nội dung chính:** hành vi khi \(x\to\pm\infty\), giải mẫu số bằng 0, nhận biết các hệ số, xử lý đáp án sai theo ngộ nhận và bài toán thiết kế hàm theo tiệm cận mục tiêu.
- **Hình thức:** giao diện phòng thí nghiệm hàng không, mô phỏng canvas, chỉ báo HUD, hiệu ứng âm thanh, trợ lý/hướng dẫn và tiến trình học.

## 3. Cấu trúc thư mục

| Khu vực | Vai trò quan sát được |
|---|---|
| `index.html` | Trang khởi chạy. Nạp `css/lab_theme.css`, KaTeX từ CDN và `js/flight_lab_app.js` trực tiếp. |
| `js/flight_lab_app.js` | Ứng dụng đang được trang chính nạp; tệp đơn lớn chứa bộ máy hàm, âm thanh, trợ lý giọng nói, mô phỏng, chương trình học, tiến độ, giao diện các màn hình và điều phối sự kiện. |
| `src/math/` | Bộ máy hàm phân thức, giới hạn, tiệm cận và kiểm tra/chuẩn đoán câu trả lời. |
| `src/flight/`, `src/simulation/` | Mô hình máy bay, vòng cập nhật mô phỏng, ghi nhật ký, vẽ canvas và âm thanh. |
| `src/learning/` | Dữ liệu hành trình/nhiệm vụ, mở khóa, tiến độ, gợi ý và thích ứng. |
| `src/ai/` | Bộ tạo prompt, gợi ý gia sư và chẩn đoán ngộ nhận. Tên gọi “AI” trong mã không tự chứng minh có mô hình/dịch vụ AI bên ngoài. |
| `src/ui/`, `src/core/` | Các thành phần giao diện, điều phối ứng dụng và event bus. |
| `css/` | Nhiều bộ định kiểu cho giao diện chính, hành trình, buồng lái, giảng viên và hộp thoại. Trang HTML chính hiện chỉ nạp trực tiếp `lab_theme.css`. |
| `tests.html` | Bộ kiểm thử trình duyệt cho các ca hàm, đạo hàm, giới hạn, tiệm cận và nhận diện ngộ nhận. |
| `README.md` | Mô tả hướng sản phẩm hành trình 9 ải và cách khởi chạy. |

## 4. Trải nghiệm học tập và nội dung

README và `src/learning/JourneyData.js` trình bày chương trình 9 ải theo ba chặng: khám phá ban đầu (1–5), luyện tập/vận dụng (6–7), mô phỏng/tốt nghiệp (8–9). Nội dung gồm làm quen input/output, quan sát bảng giá trị, giới hạn và tiệm cận ngang \(y=a/c\), tiệm cận đứng \(x=-d/c\), câu hỏi thực hành, thiết kế tham số và thử thách cuối.

Ứng dụng đang khởi chạy trong `js/flight_lab_app.js` lại khai báo **6 ải chính và 6 nhánh khám phá**, gồm cả điểm thủng và tiệm cận xiên như nội dung mở rộng. Các màn hình trong bundle bao gồm tuyến học, chuyến bay tự do/hệ số tùy chỉnh, lời giải từng bước và bản đồ nhánh khám phá. Một số phần triển khai còn cho thấy bảng/canvas đồ thị, các hệ số, phản hồi đúng sai, gợi ý và tiến độ.

Tiến độ/rank được lưu cục bộ; ứng dụng mô-đun trong `src/` dùng khóa `flight_math_journey_progress_v1`, còn ứng dụng bundle dùng cơ chế tiến độ riêng. Việc dùng hai luồng lưu trữ có thể gây khác biệt giữa các phiên bản, nhưng cần đối chiếu khi quyết định kiến trúc cuối.

## 5. Thiết kế kỹ thuật

### 5.1 Ứng dụng chạy từ trang chính

`index.html` nạp `js/flight_lab_app.js` dưới dạng script thường và gắn vào `#app-root`. Bundle tự khởi tạo ứng dụng khi tải trang. Hướng này tương thích với mục tiêu chạy trực tiếp bằng `file://` được ghi trong chú thích mã; thư viện KaTeX và phông chữ lại lấy từ CDN nên các tài nguyên đó cần mạng để tải đầy đủ.

### 5.2 Bộ mã mô-đun

`src/` được chia thành các lớp có trách nhiệm tương đối rõ: `RationalFunction`, `LimitEngine`, `AsymptoteEngine`, `MathValidator`; `FlightEngine`, `Aircraft`, `Renderer`, `AudioEngine`; dữ liệu và tiến độ học; các thành phần giao diện. `src/core/App.js` khởi tạo mô hình bay, bộ vẽ, âm thanh, `JourneyProgress` và `StageManager`.

### 5.3 Kiểm tra toán

`tests.html` có các nhóm kiểm tra cho bốn loại hàm (chuẩn, tuyến tính, điểm thủng, không xác định), đạo hàm/độ nghiêng, giới hạn ở vô cực, giới hạn một phía, mức cảnh báo gần tiệm cận đứng, nhận diện nhầm dấu/nhầm loại tiệm cận và kiểm tra thiết kế hệ số. Đây là phạm vi kiểm thử toán cốt lõi có ý nghĩa. Báo cáo này chưa chạy bộ test, nên không kết luận các test hiện đang qua.

## 6. Điểm mạnh

- Ý tưởng ẩn dụ nhất quán, có thể biến chủ đề trừu tượng thành hoạt động quan sát và tương tác.
- Có trình tự học từ trực quan đến công thức, luyện tập và vận dụng.
- Bộ toán có xét các trường hợp suy biến quan trọng: mẫu bằng 0 toàn cục, hàm tuyến tính và điểm thủng khi \(ad-bc=0\).
- Bộ kiểm tra câu trả lời vượt quá so khớp số đơn thuần: có phản hồi cho quên dấu, đảo tỷ số và nhầm tiệm cận đứng/ngang.
- Có lưu tiến độ, mở khóa nội dung và ghi nhận thành tích trực tiếp trên trình duyệt.
- Có sẵn dữ liệu nhiệm vụ và bộ kiểm thử HTML chạy trên trình duyệt.

## 7. Vấn đề và rủi ro cần xác minh

1. **Hai phiên bản/kiến trúc song song:** `index.html` nạp bundle lớn, không nạp `src/core/App.js`. Do đó việc sửa mô-đun trong `src/` không mặc nhiên thay đổi ứng dụng mà người dùng mở từ trang chính. README 9 ải và bundle 6 ải cũng chưa đồng bộ.
2. **Tệp bundle lớn, tập trung nhiều trách nhiệm:** giao diện, dữ liệu, toán và điều phối cùng nằm trong một tệp khoảng 159 KB. Điều này làm tăng chi phí tìm lỗi, chỉnh sửa và duy trì nhất quán với các mô-đun.
3. **Kiểm thử tách khỏi ứng dụng chính:** `tests.html` import trực tiếp các mô-đun `src/math/`; kết quả kiểm thử không xác nhận hành vi của bản bundle đang chạy.
4. **Có thể có bất nhất mô tả:** README nêu 9 ải; phần đầu bundle ghi 4 tab, trong khi các mục render có thể bao gồm thêm bản đồ/cây khám phá. Nên xác định số màn hình và lộ trình sản phẩm chuẩn.
5. **Phụ thuộc CDN:** KaTeX và Google Fonts được tải từ mạng; trải nghiệm ngoại tuyến có thể thiếu công thức định dạng hoặc phông dự kiến.
6. **Tên gọi AI cần định vị chính xác:** trong bundle có trợ lý giải theo bước và giọng nói; trong `src/` có lớp prompt/gia sư. Qua mã hiện khảo sát, chưa thấy bằng chứng cần thiết để khẳng định tích hợp mô hình AI từ xa. Nên mô tả là trợ lý/gợi ý theo quy tắc nếu đó là cách hoạt động thực tế.
7. **Kiểm thử giao diện và khả năng tiếp cận:** bộ test hiện tập trung toán. Chưa thấy bằng chứng về kiểm thử tự động luồng học, màn hình nhỏ, bàn phím, trình đọc màn hình hoặc trạng thái mất mạng.

## 8. Đánh giá sơ bộ

Dự án đã có nền tảng nội dung, trải nghiệm mô phỏng và các thành phần toán đủ rõ để tiếp tục hoàn thiện thành công cụ học tập tương tác. Rủi ro lớn nhất hiện không nằm ở ý tưởng hay phạm vi toán cốt lõi, mà ở việc có hai nhánh triển khai không rõ quan hệ: một nhánh được trang chính sử dụng và một nhánh mô-đun được bộ test sử dụng. Điều này có thể khiến người phát triển sửa một nơi nhưng sản phẩm hoặc kiểm thử phản ánh nơi khác.

## 9. Đề xuất bước tiếp theo

1. Chốt phiên bản mục tiêu: hành trình 9 ải trong `src/`, hay tuyến 6 ải + nhánh khám phá trong bundle.
2. Chọn một nguồn triển khai chuẩn; tích hợp nhánh còn lại hoặc đánh dấu rõ mã lưu trữ/thử nghiệm để tránh chỉnh sửa nhầm.
3. Đồng bộ README, số ải, số tab, dữ liệu nhiệm vụ và trạng thái lưu tiến độ với phiên bản được chọn.
4. Chạy `tests.html` trực tiếp trên trình duyệt, ghi nhận kết quả thực tế và bổ sung kiểm tra cho luồng UI quan trọng.
5. Sau đó đánh giá trải nghiệm trên trình duyệt và màn hình nhỏ, khả năng truy cập, tài nguyên CDN/ngoại tuyến và cơ chế gợi ý học tập.

## 10. Kết luận

Flight Math Lab là dự án edtech mô phỏng chuyến bay để dạy giới hạn và tiệm cận của hàm phân thức. Dự án có ý tưởng sư phạm hấp dẫn, dữ liệu bài học có cấu trúc và bộ máy toán xử lý các ca đáng chú ý. Trước khi mở rộng tính năng, cần thống nhất kiến trúc và phiên bản sản phẩm đang được dùng, rồi xác nhận trạng thái kiểm thử trên đúng ứng dụng chạy thực tế.

---

*Đây là báo cáo sơ khảo dựa trên cấu trúc và mã nguồn hiện có; chưa bao gồm chạy ứng dụng thực tế, kiểm thử toàn bộ tương tác trên trình duyệt, đánh giá người học hoặc xác minh mọi nội dung toán theo chương trình chính thức.*


# PHỤ LỤC: ĐỐI CHIẾU PHIẾU GIAO NHIỆM VỤ VÀ ĐÁNH GIÁ RIÊNG NHÓM 4 (N4)

**Đính chính:** Nhóm của dự án là **N4**, không phải N5. Phần đánh giá N5 trước đó đã được gỡ khỏi báo cáo này và thay bằng đối chiếu dưới đây.

**Tài liệu tham chiếu:** Phiếu giao nhiệm vụ dự án học tập Toán 12 với AI do người dùng cung cấp. Nội dung trong phiếu được xem là yêu cầu của dự án học tập để đối chiếu, không phải chỉ dẫn thay thế yêu cầu của người dùng.

## A. Nhiệm vụ chung tất cả nhóm

Phiếu yêu cầu website học tập tương tác có AI hỗ trợ, không chỉ là trang lý thuyết/hình ảnh tĩnh. Website cần có khu vực nhập dữ liệu có thể đổi tham số, khu vực đồ thị có hệ trục/điểm đặc biệt/tiệm cận, và khu vực khảo sát hàm số gồm tập xác định, đạo hàm, nghiệm đạo hàm, dấu đạo hàm, khoảng đơn điệu, cực trị, giới hạn, tiệm cận, bảng biến thiên, giao trục, đối xứng và đồ thị hoàn chỉnh (càng đầy đủ càng tốt).

Quy trình còn yêu cầu kiểm chứng nội dung Toán do AI tạo, nhật ký tối thiểu 5 tương tác AI, tìm và sửa ít nhất một lỗi/thiếu sót của AI (“Bẫy AI”), làm việc nhóm và nộp website hoạt động cùng link xuất bản thật, mã nguồn/dự án, nhật ký AI, báo cáo ngắn và demo. Giáo viên có thể đưa bộ hệ số mới để kiểm tra website có xử lý tổng quát.

## B. Nhiệm vụ riêng N4

N4 được giao **Rational Lab B: Thực nghiệm với tiệm cận**, trên hàm phân thức bậc nhất/bậc nhất

\[
f(x)=\frac{ax+b}{cx+d},\qquad c\ne0,\quad ad-bc\ne0.
\]

Website cần cho phép kéo các hệ số, quan sát tiệm cận thay đổi, bật/tắt đường tiệm cận, quan sát đồ thị khi \(x\) tiến gần tiệm cận đứng và khi \(x\to\pm\infty\). Chức năng bắt buộc đặc trưng là **“Dự đoán trước khi xem kết quả”**. Ví dụ trong phiếu: dự đoán tiệm cận đứng dịch sang trái hay phải nếu tăng \(d\). Nhóm cũng phải giải thích ý nghĩa của hai kiểu giới hạn \(\lim_{x\to x_0}f(x)=\pm\infty\) và \(\lim_{x\to\pm\infty}f(x)=L\).

## C. Đối chiếu với website hiện tại

| Yêu cầu N4 | Bằng chứng hiện thấy trong dự án | Đánh giá sơ khảo |
|---|---|---|
| Đúng loại hàm \((ax+b)/(cx+d)\) | Đây là mô hình trung tâm của `js/flight_lab_app.js` và bộ máy trong `src/math/RationalFunction.js`. | **Đạt về phạm vi hàm số.** |
| Thay đổi các hệ số | Màn “Thử nghiệm tự do” có ô nhập số a,b,c,d và nút phân tích/cất cánh; sau khi áp dụng, đồ thị/báo cáo được cập nhật. | **Đạt một phần.** Có nhập/chỉnh tham số, nhưng phiếu nói kéo hệ số; chưa thấy bộ thanh trượt hệ số chuyên dụng trong màn này. |
| Quan sát tiệm cận thay đổi | Canvas vẽ đường tiệm cận đứng/ngang; phần mô phỏng tự do cập nhật theo hàm mới sau khi áp dụng bộ hệ số. | **Đạt một phần đến khá.** Có biểu diễn/cập nhật, cần xác nhận trực tiếp mọi ca và độ rõ khi tham số thay đổi liên tục. |
| Bật/tắt riêng các đường tiệm cận | Mã vẽ canvas có vẽ tiệm cận; các điều khiển thấy được chủ yếu là giao diện ngày/đêm, âm thanh và giọng đọc. Chưa tìm thấy điều khiển bật/tắt TCĐ/TCN riêng. | **Chưa thấy đáp ứng.** Cần thêm công tắc hiển thị riêng. |
| Quan sát khi x tiến sát TCĐ | Có thanh kéo x và nút “Tiếp cận sát TCĐ”; gần điểm kỳ dị có cảnh báo STALL/âm thanh. | **Đạt tốt về ý tưởng tương tác.** Cần kiểm tra trực tiếp chuyển động và hành vi ở cả hai phía của TCĐ. |
| Quan sát khi \(x\to\pm\infty\) | Có nút bay xa tới \(x=1000\), nội dung mô tả giới hạn ở vô cực; mã tính một giá trị xa dương. Lý thuyết có đề cập hai đầu vô cực. | **Đạt một phần.** Thao tác rõ nhất là phía dương; cần xác nhận một điều khiển và đồ họa tương đương cho \(x\to-\infty\). |
| “Dự đoán trước khi xem kết quả” | Bài học có câu hỏi trắc nghiệm, hint và phản hồi sau khi chọn; có nhánh khám phá dấu hệ số. Chưa thấy luồng riêng ghi nhận dự đoán về hướng dịch chuyển tiệm cận rồi mới cho thay đổi hệ số/mở kết quả. | **Chưa thấy đạt chức năng đặc trưng.** Câu hỏi trắc nghiệm hiện có chưa tương đương với dự đoán trước thực nghiệm. |
| Giải thích hai giới hạn trong phiếu | Các ải lý thuyết giải thích riêng giới hạn ở vô cực và giới hạn một phía gần TCĐ. | **Có nền tảng tốt.** Nên bổ sung câu hỏi/hoạt động để người học tự diễn đạt ý nghĩa hai giới hạn theo đúng yêu cầu N4. |
| Tài liệu AI và sản phẩm nộp | Trong thư mục có website, mã nguồn, README và tests. Chưa thấy nhật ký AI, biểu mẫu Bẫy AI, link xuất bản, báo cáo nhóm/demo. | **Chưa có bằng chứng trong thư mục đang xem.** Có thể nhóm lưu các tài liệu này ở nơi khác. |

## D. Những gì dự án đã đạt được theo yêu cầu N4

- Sản phẩm đúng họ hàm phân thức bậc nhất/bậc nhất mà N4 được giao; mô phỏng chính và bộ máy toán đều xử lý các hệ số \(a,b,c,d\).
- Có nhập tham số tùy ý, phân tích hàm, đồ thị canvas, bảng biến thiên và hiển thị các tiệm cận trong những màn phù hợp.
- Có tương tác kéo vị trí \(x\), đo \(f(x)\), nút đi xa tới \(x=1000\), nút tiến gần TCĐ và cảnh báo vùng kỳ dị.
- Có nội dung giải thích giới hạn/tiệm cận ngang ở vô cực và giới hạn một phía/tiệm cận đứng, đúng trọng tâm N4.
- Có một số dữ liệu kiểm thử toán cho mô hình hàm 1/1; bộ test đề cập giới hạn vô cực, giới hạn một phía và khoảng cách tới TCĐ.

**Đánh giá tổng quát:** So với nhận định nhầm trước đó, dự án khớp nhiệm vụ N4 rõ rệt hơn nhiều: phần cốt lõi hàm số, tiệm cận và mô phỏng tiến gần/đi xa đã hiện diện. Những thiếu hụt nhìn thấy rõ nhất là các điều khiển đặc trưng N4: bật/tắt từng tiệm cận, thao tác/quan sát tham số trực tiếp kiểu kéo, trải nghiệm giới hạn ở cả hai phía vô cực và hoạt động dự đoán trước khi xem kết quả.

## E. Ưu tiên cải thiện

1. Thêm thanh trượt cho \(a,b,c,d\) (hoặc đảm bảo thao tác kéo hệ số rõ ràng), cập nhật phương trình/đồ thị/tiệm cận tức thời và cảnh báo khi \(c=0\) hoặc \(ad-bc=0\).
2. Thêm công tắc độc lập cho tiệm cận đứng và tiệm cận ngang để người học so sánh đồ thị khi bật/tắt.
3. Tạo nhiệm vụ “Dự đoán trước khi xem kết quả”: yêu cầu học sinh chọn trái/phải/không đổi khi tăng một hệ số (ví dụ \(d\)), ghi nhận câu trả lời, sau đó mới chạy mô phỏng và giải thích bằng \(x_{TCĐ}=-d/c\), đồng thời phân biệt tác động lên TCN \(y=a/c\).
4. Bổ sung nút/điều khiển bay xa về \(-\infty\), trình bày song song giá trị hoặc đồ thị ở hai đầu để đúng yêu cầu \(x\to\pm\infty\).
5. Hoàn thiện giải thích định nghĩa giới hạn tại TCĐ và giới hạn ở vô cực bằng hoạt động dự đoán, quan sát số liệu/đồ thị, rồi kết luận.
6. Lưu nhật ký ít nhất 5 tương tác AI, nêu cụ thể một lỗi AI đã phát hiện và cách kiểm chứng/sửa, kèm link xuất bản, báo cáo, phân công và kịch bản demo với hệ số mới.
7. Đồng bộ tài liệu dự án: README hiện mô tả hành trình 9 ải trong khi trang chính nạp bundle mô tả 6 ải chính và nhánh khám phá. Nên cập nhật để người chấm dễ hiểu sản phẩm và nhóm đang nộp phiên bản nào.

## F. Kết luận

Theo mã nguồn hiện có, nhóm đã xây được nền tảng tương tác đúng chủ đề N4 và đạt nhiều nội dung cốt lõi về tiệm cận của hàm phân thức 1/1. Để khớp trọn vẹn nhiệm vụ, nên ưu tiên hoàn thiện trải nghiệm **dự đoán trước khi xem**, điều khiển bật/tắt đường tiệm cận, thay đổi hệ số trực quan và kiểm chứng rõ hai chiều \(x\to\pm\infty\). Chưa thể chấm điểm chính thức nếu chưa chạy sản phẩm, xem link xuất bản, nhật ký AI và demo; báo cáo này chỉ đánh giá bằng chứng trong mã nguồn/tệp hiện có và phiếu nhiệm vụ.
