# Design Brief — Luồng E2E Người Được Mời (Ngăn Ví Phụ)

| | |
|---|---|
| **Feature** | Ngăn Ví Phụ — phía người được mời (con / người thân) |
| **Flow** | Nhận lời mời → Cài app → Đăng ký MoMo → AML → Chấp nhận liên kết → eKYC → Kích hoạt → Sử dụng |
| **PM** | Product Growth |
| **Reference** | Prototype HTML `index.html` |

---

## 1. Bối cảnh

Sau khi chủ ví (ba/mẹ) tạo Ngăn Ví Phụ và gửi link mời, người được mời (con/người thân) cần đi qua một luồng dài để kích hoạt và sử dụng được. Brief này mô tả toàn bộ trải nghiệm phía người được mời — bao gồm cả case họ **chưa có tài khoản MoMo**.

---

## 2. Flow tổng quan

Người được mời nhận **SMS** từ ba/mẹ với link mời → mở **Google Play** cài app MoMo (nếu chưa có) → mở app và **đăng ký tài khoản MoMo** (SĐT → OTP → mật khẩu → điều khoản) → khai báo **AML** (công việc + chức vụ) → vào **giới thiệu Ví Phụ** → xem **yêu cầu liên kết từ Ví Chính** → tap "Chấp nhận yêu cầu" → đi qua **xác thực sinh trắc học eKYC** (chọn phương thức → quét chip NFC CCCD → xác thực khuôn mặt → thành công) → **kích hoạt Ngăn Ví Phụ thành công** → vào **Home Ngăn Ví Phụ** → trải nghiệm thực tế bằng **quét QR thanh toán Circle K** → **thanh toán thành công** → **cảm ơn** và mời tham gia **khảo sát** → hoàn thành.

**Tổng: ~23 màn, chia 7 cụm.**

---

## 3. Chi tiết từng màn

### CỤM 1 — Vào app

#### Màn 1 — SMS lời mời từ ba/mẹ
**Mục đích:** Mô phỏng tin nhắn người được mời nhận từ chủ ví (entry point).
**Requirement:** Khung iMessage với tin nhắn từ "Ba" và link card MoMo. Nội dung: _"Cha tạo Ngăn Ví Phụ MoMo cho con rồi nè! Con nhấn link này để kích hoạt là xài được liền nha 😊 👇"_.

> Mock OS-native, không cần đầu tư design.

#### Màn 2 — Google Play
**Mục đích:** Mô phỏng user mở Play Store để cài MoMo.
**Requirement:** Trang detail app MoMo. CTA "Cài đặt" có 3 trạng thái: chưa cài / đang cài / đã cài.

> Mock OS-native, không cần đầu tư design.

---

### CỤM 2 — Đăng ký tài khoản MoMo

Gồm 4 màn theo flow chuẩn của MoMo: **Nhập SĐT → Nhập OTP → Tạo mật khẩu → Điều khoản dịch vụ**. Designer reuse pattern hiện có — không cần chi tiết.

---

### CỤM 3 — Khai báo AML

#### Màn 7 — AML: Công việc (Bước 1/2)
**Mục đích:** Thu thập thông tin nghề nghiệp theo quy định AML.
**Requirement:** Câu hỏi "Công việc của bạn là gì?" + danh sách lựa chọn: Nhân viên văn phòng / Học sinh - Sinh viên / Tài chính - Ngân hàng / Bảo hiểm / Kinh doanh - Tự doanh / Khác.
**CTA:** Tiếp tục

#### Màn 8 — AML: Chức vụ (Bước 2/2)
**Mục đích:** Thu thập thông tin chức vụ theo quy định AML.
**Requirement:** Câu hỏi "Chức vụ của bạn là gì?" + danh sách lựa chọn: Nhân viên / Trưởng phòng / Phó Giám đốc / Chủ doanh nghiệp / Khác.
**CTA:** Tiếp tục

---

### CỤM 4 — Onboarding & Chấp nhận yêu cầu Ngăn Ví Phụ

#### Màn 9 — Giới thiệu Ví Phụ MoMo
**Mục đích:** Giới thiệu giá trị của Ngăn Ví Phụ cho người được mời.
**Requirement:** Tiêu đề "Chào mừng đến Ví Phụ!" + giới thiệu 3 value prop, mỗi value prop có icon + tiêu đề + 1 dòng mô tả:

1. **Nhận tiền từ ba mẹ dễ dàng** — Ba mẹ nạp tiền trực tiếp vào Ngăn Ví Phụ của con — không cần trao tay tiền mặt.
2. **Quản lý chi tiêu riêng** — Theo dõi lịch sử giao dịch độc lập, lập ngân sách chi tiêu hàng tháng.
3. **Bảo mật & kiểm soát** — Ví Chính có thể theo dõi và kiểm soát hạn mức, đảm bảo an toàn tài chính.

**CTA:** Khám phá

#### Màn 10 — Yêu cầu liên kết từ Ví Chính
**Mục đích:** User review chi tiết yêu cầu mời từ ba/mẹ trước khi chấp nhận.
**Requirement:** Thông tin người gửi yêu cầu (tên chủ Ví Chính, SĐT, hạn mức/tháng, trạng thái "Chờ duyệt"). Cảnh báo về phạm vi sử dụng: _"Ví Phụ chỉ dùng để thanh toán và giao dịch. Không thể sử dụng các dịch vụ tài chính như Ví Trả Sau, Vay nhanh, Đầu tư, Bảo hiểm."_ Checkbox đồng ý điều khoản sử dụng Ví Phụ.
**CTA chính:** Chấp nhận yêu cầu
**CTA phụ:** Từ chối

---

### CỤM 5 — Xác thực sinh trắc học (eKYC) sau khi chấp nhận

#### Màn 11 — Chọn phương thức xác thực sinh trắc học
**Mục đích:** User chọn cách xác thực sinh trắc học theo Thông tư 40.
**Requirement:** Thông báo về yêu cầu xác thực theo Thông Tư 40 + 3 phương thức:

1. **Xác thực bằng CCCD gắn chip** (cho thiết bị hỗ trợ NFC) — default.
2. **Xác thực qua tài khoản VNeID** (cần định danh VNeID mức 2).
3. **Nhờ người thân hỗ trợ hoặc đến các điểm đối tác của MoMo.**

**CTA:** Xác thực ngay

#### Màn 12 — Hướng dẫn quét chip CCCD
**Mục đích:** Hướng dẫn user cách quét chip NFC trên CCCD bằng điện thoại Android.
**Requirement:** Tiêu đề "Hướng dẫn xác thực trên thiết bị Android" + 3 bước:

1. Đặt thiết bị áp sát mặt sau CCCD nơi có chip.
2. Di chuyển từ từ cho đến khi xác minh xong.
3. Giữ chặt khi đang xác minh để đảm bảo độ chính xác.

**CTA chính:** Bắt đầu quét
**CTA phụ:** Hướng dẫn

#### Màn 13 — Đang quét chip NFC
**Mục đích:** Màn chờ user áp điện thoại vào chip CCCD để đọc NFC.
**Requirement:** Màn nền tối với vùng quét. Hướng dẫn _"Áp sát chip vào mặt sau của thẻ và di chuyển từ từ đến khi thẻ được quét xong."_ Có state khi scan thành công.
**CTA:** Hủy

#### Màn 14 — Hướng dẫn xác thực khuôn mặt
**Mục đích:** Yêu cầu user đưa khuôn mặt vào khung tròn để xác thực.
**Requirement:** Khung quét khuôn mặt + hướng dẫn _"Đưa khuôn mặt vào trong khung tròn."_ Có link "Xem hướng dẫn" và "Gửi phản hồi".
**CTA:** (tự động chuyển khi capture thành công)

#### Màn 15 — eKYC thành công
**Mục đích:** Confirm xác thực sinh trắc học hoàn tất.
**Requirement:** Title "Chúc mừng" + body _"Xác thực thông tin thành công. Tiếp tục các bước tiếp theo để sử dụng các dịch vụ của MoMo."_
**CTA:** Tiếp tục

---

### CỤM 6 — Kích hoạt Ngăn Ví Phụ thành công + Home

#### Màn 16 — Kích hoạt Ngăn Ví Phụ thành công
**Mục đích:** Confirm Ngăn Ví Phụ đã được kích hoạt thành công.
**Requirement:** Title "Ngăn Ví Phụ đã được kích hoạt!" + bảng thông tin chi tiết liên kết: SĐT, Chủ Ví Chính, Hạn mức tháng, Hạn mức/giao dịch, Trạng thái, Ngày kích hoạt.
**CTA:** Vào Ngăn Ví Phụ của tôi

#### Màn 17 — Home Ngăn Ví Phụ
**Mục đích:** Màn chính của Ngăn Ví Phụ — user xem số dư, hạn mức, lịch sử giao dịch.
**Requirement:** Hiển thị thông tin user (tên, SĐT, trạng thái liên kết, số dư). Khu vực hạn mức tháng (đã dùng / tổng + % sử dụng). Section "Giao dịch gần đây". Nút yêu cầu nạp tiền (gửi cho ba/mẹ). Tab bar điều hướng dưới cùng.

---

### CỤM 7 — Demo sử dụng + Khảo sát

#### Màn 18 — Quét QR thanh toán
**Mục đích:** User dùng camera quét mã QR tại điểm thanh toán (demo Circle K).
**Requirement:** Màn camera full-screen với khung quét QR. Khi quét thành công → hiển thị thông tin merchant.
**CTA:** (tự động chuyển khi quét thành công)

#### Màn 19 — Màn thanh toán Circle K
**Mục đích:** User xác nhận số tiền và thanh toán cho merchant.
**Requirement:** Thông tin merchant (Circle K). Số tiền cần trả (hoặc cho user nhập). Hiển thị số dư còn lại sau khi trả.
**CTA:** Thanh toán

#### Màn 20 — Thanh toán thành công
**Mục đích:** Confirm giao dịch hoàn tất.
**Requirement:** Title "Thanh toán thành công!" + số tiền + thông tin giao dịch (Merchant, Mã GD, Thời gian, Phương thức).
**CTA:** Hoàn tất

#### Màn 21 — Cảm ơn + Mời khảo sát
**Mục đích:** Cảm ơn user và mời tham gia khảo sát ngắn.
**Requirement:** Title "Cảm ơn bạn rất nhiều!" + mô tả khảo sát "Chỉ 9 câu hỏi đơn giản, khoảng 2 phút".
**CTA chính:** Bắt đầu khảo sát
**CTA phụ:** Bỏ qua

#### Màn 22 — Khảo sát trải nghiệm
**Mục đích:** Thu thập feedback theo bộ câu hỏi PSSUQ 9 câu.
**Requirement:** Ô nhập tên user. 9 câu hỏi chia 3 section (Mức độ dễ sử dụng / Thông tin hướng dẫn / Giao diện & cảm nhận chung). Mỗi câu thang điểm 1–7.
**CTA:** Gửi khảo sát

#### Màn 23 — Cảm ơn cuối
**Mục đích:** Cảm ơn user đã hoàn thành khảo sát.
**Requirement:** Title "Bạn thật tuyệt vời!" + lời cảm ơn.
**CTA:** Về trang chủ MoMo

---

## 4. Lưu ý chung

- Tham khảo prototype HTML để hình dung tone & feel.
- Design system: pink primary của MoMo, font Be Vietnam Pro.
- Các màn có pattern chuẩn MoMo (đăng ký, AML, eKYC) → reuse từ design system hiện hành.
- Các màn **mới đặc thù cho Ngăn Ví Phụ** cần đầu tư design riêng: Intro Ví Phụ (M9), Yêu cầu liên kết (M10), Kích hoạt thành công (M16), Home Ngăn Ví Phụ (M17).

---

## 5. Out of scope

- Flow chủ ví tạo Ngăn Ví Phụ (đã có brief riêng).
- Quản lý nhiều Ngăn Ví Phụ (list view).
- Flow yêu cầu nạp tiền từ con gửi cho ba/mẹ.
- Flow tạm dừng / xóa liên kết Ngăn Ví Phụ.

---

## 6. Câu hỏi cần align với design

1. Case người được mời **đã có MoMo + đã eKYC sẵn** → có cần skip cụm 2 (đăng ký) + cụm 3 (AML) + cụm 5 (eKYC) không?
2. Cụm 7 (sử dụng Circle K) — đây là demo onboarding hay flow thật?
3. Khi user **Từ chối yêu cầu** ở Màn 10 → flow đi về đâu? Có cần thêm màn confirm "Bạn chắc chắn từ chối?"
4. Hạn mức 20.000.000 đ (Màn 10) khác với 2.000.000 đ trong brief tạo Ngăn Ví Phụ — cần align lại.

---

_12 May 2026 — Product Growth_
