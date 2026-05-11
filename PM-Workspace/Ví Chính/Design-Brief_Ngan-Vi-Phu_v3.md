# Design Brief — Ngăn Ví Phụ (Sub-Wallet)

| | |
|---|---|
| **Feature** | Ngăn Ví Phụ — Sub-Wallet |
| **Scope** | Toàn bộ trải nghiệm: phía Ví Chính (chủ ví) + phía Ngăn Ví Phụ (người được mời) |
| **PM Owner** | Product Growth |
| **Status** | Ready for design |
| **Priority** | P1 |
| **References** | Solution Overview (SubWallet_Solution_Overview.docx) · Prototype HTML (Ví Chính: `index_1.html` · Người được mời: `index.html`) |

---

## 1. Bối cảnh & Mục tiêu

### 1.1 User problem

Theo **Thông tư 23/2019/TT-NHNN**, để sở hữu một tài khoản ví MoMo hợp lệ và sử dụng đầy đủ các dịch vụ, người dùng phải đáp ứng đồng thời:
- Hoàn thành xác thực danh tính (eKYC).
- Liên kết tài khoản ngân hàng chính chủ.

Nhiều người dùng có nhu cầu sử dụng MoMo để thanh toán nhưng không đáp ứng được một hoặc cả hai điều kiện trên, hoặc có hiểu biết hạn chế về công nghệ. Họ không biết bắt đầu từ đâu, trong khi nhu cầu thực sự chỉ đơn giản là vào ví để thanh toán dịch vụ.

**Nhóm bị ảnh hưởng chính:**
- **Trẻ em & thanh thiếu niên** — chưa đủ điều kiện mở tài khoản ngân hàng độc lập.
- **Người lớn tuổi** — hạn chế công nghệ, khó hoàn thành eKYC và liên kết ngân hàng.
- **Underbanked** — chưa có tài khoản ngân hàng hoặc không đủ điều kiện liên kết.

### 1.2 Giải pháp

Tính năng **Ngăn Ví Phụ (Sub-Wallet)** cho phép một tài khoản Ví MoMo (gọi là **Ví Chính**) tạo và quản lý các **Ngăn Ví Phụ** cho người thân trong gia đình. Ngăn Ví Phụ có thể sử dụng phần lớn tiện ích MoMo (thanh toán, chuyển tiền, nạp tiền) **trong hạn mức do Ví Chính đặt**, không cần eKYC độc lập, không cần liên kết ngân hàng, và bị chặn các dịch vụ tài chính (Ví Trả Sau, Vay Nhanh, Đầu tư, Bảo hiểm).

### 1.3 Business goal

**Tăng MAU (Monthly Active Users)** bằng cách mở rộng tệp người dùng sang nhóm chưa thể tự đáp ứng yêu cầu eKYC / liên kết ngân hàng.

---

## 2. Tóm tắt giải pháp & Business rules

### 2.1 Vai trò

| | Ví Chính | Ngăn Ví Phụ |
|---|---|---|
| **Tạo & mời** | ✅ Tạo và mời Ngăn Ví Phụ qua SĐT | — |
| **Cài đặt hạn mức** | ✅ Đặt hạn mức/giao dịch & hạn mức/ngày cho mỗi ngăn ví | — |
| **Nạp/rút tiền** | ✅ Nạp/rút từ Ví Chính ↔ Ngăn Ví Phụ | ✅ Nhận tiền từ Ví Chính |
| **Xem giao dịch & số dư** | ✅ Xem toàn bộ giao dịch + số dư của Ngăn Ví Phụ (có thể bật/tắt hiển thị) | ✅ Xem giao dịch + số dư của chính mình |
| **Thanh toán & chuyển tiền** | — | ✅ Trong hạn mức được cấp |
| **Khóa/Mở khóa** | ✅ Tạm dừng hoặc kích hoạt lại Ngăn Ví Phụ | — |
| **Hủy liên kết** | ✅ Ngắt kết nối Ngăn Ví Phụ | ✅ Từ chối yêu cầu liên kết khi nhận lời mời |
| **Dịch vụ tài chính (Vay Nhanh, Trả Sau, Đầu tư, Bảo hiểm)** | ✅ Bình thường | ❌ Không được dùng |

### 2.2 Business rules

- Một Ví Chính có thể liên kết **một hoặc nhiều** Ngăn Ví Phụ.
- Ngăn Ví Phụ **không cần** eKYC độc lập và **không cần** liên kết ngân hàng. Mọi hoạt động vẫn thuộc trách nhiệm của Ví Chính.
- **Whitelist dịch vụ Ngăn Ví Phụ:** thanh toán, chuyển tiền, nạp tiền (trong hạn mức).
- **Blacklist dịch vụ Ngăn Ví Phụ:** Ví Trả Sau, Vay Nhanh, Đầu tư, Bảo hiểm — toàn bộ dịch vụ tài chính trên MoMo.
- **Trạng thái Ngăn Ví Phụ:** _Đang chờ kích hoạt_ → _Hoạt động_ ↔ _Tạm dừng_ → _Đã hủy liên kết_.
- **Xác thực kích hoạt:** OTP 4 chữ số gửi đến SĐT của người được mời.

---

## 3. Phạm vi design brief

**In-scope (cần design trong card này):**
- **Luồng A** — Ví Chính tạo và quản lý Ngăn Ví Phụ (bao gồm cả nạp tiền và khảo sát trải nghiệm).
- **Luồng B** — Người được mời onboard và kích hoạt Ngăn Ví Phụ.

**Out of scope (sẽ tách card riêng):**
- Luồng rút tiền từ Ngăn Ví Phụ về Ví Chính.
- Luồng chỉnh sửa hạn mức / thông tin Ngăn Ví Phụ sau khi đã tạo.
- Luồng hủy liên kết Ngăn Ví Phụ.
- Luồng yêu cầu nạp tiền (từ phía Ngăn Ví Phụ gửi cho Ví Chính).
- Push notification & email templates.

---

## 4. Luồng A — Ví Chính tạo và quản lý Ngăn Ví Phụ

### 4.1 Flow tổng quan

Chủ ví thấy **onboarding** giới thiệu tính năng → vào **Home quản lý Ngăn Ví Phụ** (lần đầu là empty state) → tap "Thêm Ngăn Ví Phụ" → đi qua **wizard 3 bước** (Nhập SĐT người thân → Thiết lập hạn mức → Xem lại & xác nhận) → màn **tạo thành công** với link mời để chia sẻ → quay về Home, ví mới hiện ở trạng thái "Đang chờ kích hoạt" → khi tap vào ví đang chờ → màn **chờ kích hoạt** giải thích cần người thân kích hoạt → khi ví đã active, chủ ví vào **màn chi tiết Ngăn Ví Phụ** để xem số dư, hạn mức, lịch sử giao dịch và thực hiện hành động (Nạp tiền / Rút tiền / Tạm dừng) → flow **nạp tiền** (nhập số tiền + lời nhắn) → **nạp tiền thành công** → cuối trải nghiệm, user được mời tham gia **khảo sát** (9 câu PSSUQ) → **cảm ơn** kết thúc.

**Tổng: 13 màn, chia 5 cụm.**

### 4.2 Chi tiết từng màn

#### CỤM A1 — Onboarding & Home

**Màn A1 — Onboarding**
- **Mục đích:** Giới thiệu 3 value prop của tính năng để chủ ví hiểu giá trị.
- **Requirement:** Tiêu đề "Cho con tự lập, bố mẹ vẫn yên tâm" + giới thiệu 3 value prop, mỗi value prop có icon + tiêu đề + 1 dòng mô tả:
  1. **An toàn từ A đến Z** — Đặt hạn mức tháng cho con. Vượt mức là không tiêu được.
  2. **Bố mẹ luôn nắm rõ** — Xem con tiêu gì, ở đâu, lúc nào — ngay trên MoMo của bạn.
  3. **Chặn dịch vụ rủi ro** — Chỉ thanh toán & chuyển tiền. Không Trả Sau, không Vay Nhanh.

  Có link "Bỏ qua" ở góc trên phải.
- **CTA:** Khám phá ngay

**Màn A2 — Home Quản lý Ngăn Ví Phụ**
- **Mục đích:** Entry point để chủ ví tạo mới hoặc quản lý các Ngăn Ví Phụ hiện có.
- **Requirement:** Hiển thị số dư ví chính + section "Ngăn Ví phụ của tôi". 2 trạng thái:
  - **Empty state:** thông báo chưa có ngăn ví nào.
  - **Có ví:** danh sách các Ngăn Ví Phụ đã tạo (tên, số dư, hạn mức, trạng thái Hoạt động / Tạm dừng / Đang chờ kích hoạt), mỗi item có shortcut Nạp tiền & Xem chi tiết.

  Luôn có entry point "Thêm Ngăn Ví Phụ" + sub "Mời thành viên gia đình".
- **CTA:** Thêm Ngăn Ví phụ

---

#### CỤM A2 — Wizard tạo Ngăn Ví Phụ (3 bước)

**Màn A3 — Nhập SĐT (Bước 1/3)**
- **Mục đích:** Chủ ví nhập SĐT người thân muốn mời.
- **Requirement:** Progress bar 3 bước (Nhập SĐT — Hạn mức — Xác nhận). Tiêu đề "Nhập số điện thoại" + sub "Nhập SĐT của người thân để gửi lời mời kích hoạt Ngăn Ví phụ." Ô nhập SĐT với prefix +84.
- **CTA:** Tiếp tục

**Màn A4 — Thiết lập hạn mức (Bước 2/3)**
- **Mục đích:** Chủ ví set hạn mức chi tiêu/tháng + nhận thông tin về whitelist dịch vụ.
- **Requirement:** Gồm 2 section:
  1. **Hạn mức giao dịch:** Ô nhập số tiền (tối đa **2.000.000 ₫**) + 4 mức gợi ý: **500K / 1tr / 1.5tr / 2tr**. Hint: _"Tổng chi tiêu tối đa mỗi tháng, không vượt quá 2.000.000 ₫"._
  2. **Dịch vụ được phép sử dụng:** Thông báo: _"Ví Phụ chỉ được phép sử dụng các dịch vụ **chuyển tiền, thanh toán**. Không được phép sử dụng các **dịch vụ tài chính** trên MoMo (Ví Trả Sau, Vay Nhanh,...)."_
- **CTA:** Tiếp tục

> ⚠️ **Open question:** Solution overview yêu cầu **hạn mức/ngày + hạn mức/giao dịch** (và cả Họ tên + Mối quan hệ), nhưng prototype hiện tại chỉ có **hạn mức/tháng**. Cần align trước khi design — xem mục 7.

**Màn A5 — Xem lại & Xác nhận (Bước 3/3)**
- **Mục đích:** Chủ ví review thông tin và đồng ý điều khoản trước khi tạo ví.
- **Requirement:** Gồm 3 phần:
  1. **Thông tin người được mời:** avatar + tên + SĐT.
  2. **Thông tin ngăn ví:** Hạn mức / tháng + Dịch vụ được phép (Chuyển tiền, thanh toán).
  3. **Đồng ý điều khoản:** _"Tôi đồng ý với Điều khoản sử dụng Ngăn Ví Phụ và xác nhận thông tin trên là chính xác."_

  CTA disabled cho đến khi tick checkbox.
- **CTA:** Xác nhận thêm Ngăn Ví phụ

**Màn A6 — Tạo thành công + Share**
- **Mục đích:** Confirm thành công + cho chủ ví share link mời người thân kích hoạt.
- **Requirement:** Title "Thêm Ngăn Ví phụ thành công!" + body khác nhau cho 2 case (người thân đã có MoMo / chưa có MoMo). Hiển thị link mời rút gọn (vd `momo.vn/vi-phu/abc123`) + option copy.

  Khi tap "Chia sẻ" → mở bottom sheet với các option: Messenger / Zalo / SMS / Telegram / Sao chép / Khác.
- **CTA chính:** Về trang ví
- **CTA phụ:** Chia sẻ

---

#### CỤM A3 — Trạng thái chờ kích hoạt

**Màn A7 — Ngăn Ví Phụ đang chờ kích hoạt**
- **Mục đích:** Thông báo cho chủ ví biết Ngăn Ví Phụ chưa kích hoạt được vì người thân chưa làm thao tác kích hoạt.
- **Requirement:** Title "Ví phụ của bạn đang chờ kích hoạt" + body _"Nhờ người thân gửi lời mời kích hoạt qua MoMo để bắt đầu nhận tiền."_ Có shortcut copy/share lại link mời.
- **CTA:** Quay lại

---

#### CỤM A4 — Chi tiết & Nạp tiền

**Màn A8 — Chi tiết Ngăn Ví Phụ**
- **Mục đích:** Chủ ví xem thông tin tổng quan và thực hiện hành động quản lý cho một Ngăn Ví Phụ đã kích hoạt.
- **Requirement:** Thông tin tổng quan: avatar + tên + SĐT + trạng thái + số dư, hạn mức/tháng, số tiền đã dùng tháng này. 3 hành động nhanh: **Nạp tiền / Rút tiền / Tạm dừng (hoặc Mở lại)**. Bảng thông tin: hạn mức/tháng, dịch vụ được phép, trạng thái. Section lịch sử giao dịch của ngăn ví này.

**Màn A9 — Nạp tiền cho Ngăn Ví Phụ**
- **Mục đích:** Chủ ví nhập số tiền và lời nhắn để nạp vào Ngăn Ví Phụ.
- **Requirement:** Hiển thị người nhận (avatar + tên). Ô nhập số tiền (có numpad riêng). 3 mức gợi ý nhanh: **200K / 500K / 1 triệu**. Ô lời nhắn (tối đa 160 ký tự) + 3 gợi ý lời nhắn:
  - _"Ba gửi tiền nha con"_
  - _"Tiền tiêu vặt tháng này"_
  - _"Con dùng tiết kiệm nha!"_
- **CTA:** Nạp tiền

**Màn A10 — Nạp tiền thành công**
- **Mục đích:** Confirm giao dịch nạp tiền hoàn tất.
- **Requirement:** Title "Nạp tiền thành công!" + số tiền đã nạp + tên ngăn ví nhận. Bảng thông tin giao dịch: Từ (Ví chính MoMo) / Đến (tên ngăn ví) / Thời gian / Mã GD.
- **CTA chính:** Hoàn thành
- **CTA phụ:** Xem chi tiết ví phụ

---

#### CỤM A5 — Khảo sát kết thúc trải nghiệm

**Màn A11 — Mời khảo sát**
- **Mục đích:** Cảm ơn user và mời tham gia khảo sát ngắn.
- **Requirement:** Title "Cảm ơn bạn rất nhiều!" + thông tin về khảo sát: "Chỉ 9 câu hỏi đơn giản, khoảng 2 phút".
- **CTA chính:** Bắt đầu khảo sát
- **CTA phụ:** Bỏ qua

**Màn A12 — Khảo sát trải nghiệm**
- **Mục đích:** Thu thập feedback theo bộ câu hỏi PSSUQ 9 câu.
- **Requirement:** Ô nhập tên user. 9 câu hỏi chia 3 section (Mức độ dễ sử dụng / Thông tin hướng dẫn / Giao diện & cảm nhận chung). Mỗi câu thang điểm 1–7.
- **CTA:** Gửi khảo sát

**Màn A13 — Cảm ơn cuối**
- **Mục đích:** Cảm ơn user đã hoàn thành khảo sát.
- **Requirement:** Title "Bạn thật tuyệt vời!" + body cảm ơn + lời chào "Hẹn gặp lại bạn lần sau nhé!"
- **CTA:** Về trang chủ MoMo

---

## 5. Luồng B — Người được mời onboard & kích hoạt Ngăn Ví Phụ

### 5.1 Flow tổng quan

Người được mời nhận **SMS** từ chủ ví với link mời → mở **Google Play** cài app MoMo (nếu chưa có) → mở app và **đăng ký tài khoản MoMo** (SĐT → OTP → mật khẩu → điều khoản dịch vụ) → khai báo **AML** (công việc + chức vụ) → vào màn **giới thiệu Ngăn Ví Phụ** → xem **yêu cầu liên kết từ Ví Chính** → tap "Chấp nhận yêu cầu" → nhập **OTP 4 số** xác nhận đồng ý liên kết → **kích hoạt Ngăn Ví Phụ thành công** → vào **Home Ngăn Ví Phụ** → có thể trải nghiệm thực tế bằng **quét QR thanh toán Circle K** (demo) → **thanh toán thành công** → mời tham gia **khảo sát** → hoàn thành.

**Tổng: ~17 màn (không tính 2 màn mock OS), chia 7 cụm.**

### 5.2 Chi tiết từng màn

#### CỤM B1 — Vào app (mock OS-native, không cần đầu tư design)

**Màn B1 — SMS lời mời từ chủ ví**
- **Mục đích:** Mô phỏng tin nhắn người được mời nhận từ chủ ví (entry point).
- **Requirement:** Khung iMessage với tin nhắn text + link card MoMo. Nội dung: _"Cha tạo Ngăn Ví Phụ MoMo cho con rồi nè! Con nhấn link này để kích hoạt là xài được liền nha 😊 👇"_.

**Màn B2 — Google Play (Cài app MoMo)**
- **Mục đích:** Mô phỏng user mở Play Store để cài MoMo.
- **Requirement:** Trang detail app MoMo. CTA "Cài đặt" có 3 trạng thái: chưa cài / đang cài / đã cài.

---

#### CỤM B2 — Đăng ký tài khoản MoMo

Gồm 4 màn theo pattern chuẩn của MoMo: **Nhập SĐT → Nhập OTP → Tạo mật khẩu → Đồng ý Điều khoản dịch vụ**. Designer reuse design system hiện có — brief này chỉ cần đảm bảo flow consistent.

---

#### CỤM B3 — Khai báo AML

**Màn B7 — AML: Công việc (Bước 1/2)**
- **Mục đích:** Thu thập thông tin nghề nghiệp theo quy định AML.
- **Requirement:** Câu hỏi "Công việc của bạn là gì?" + danh sách lựa chọn: Nhân viên văn phòng / Học sinh - Sinh viên / Tài chính - Ngân hàng / Bảo hiểm / Kinh doanh - Tự doanh / Khác.
- **CTA:** Tiếp tục

**Màn B8 — AML: Chức vụ (Bước 2/2)**
- **Mục đích:** Thu thập thông tin chức vụ theo quy định AML.
- **Requirement:** Câu hỏi "Chức vụ của bạn là gì?" + danh sách lựa chọn: Nhân viên / Trưởng phòng / Phó Giám đốc / Chủ doanh nghiệp / Khác.
- **CTA:** Tiếp tục

---

#### CỤM B4 — Onboarding & Chấp nhận yêu cầu liên kết

**Màn B9 — Giới thiệu Ngăn Ví Phụ**
- **Mục đích:** Giới thiệu giá trị của Ngăn Ví Phụ cho người được mời.
- **Requirement:** Tiêu đề "Chào mừng đến Ví Phụ!" + giới thiệu 3 value prop, mỗi value prop có icon + tiêu đề + 1 dòng mô tả:
  1. **Nhận tiền từ ba mẹ dễ dàng** — Ba mẹ nạp tiền trực tiếp vào Ngăn Ví Phụ của con — không cần trao tay tiền mặt.
  2. **Quản lý chi tiêu riêng** — Theo dõi lịch sử giao dịch độc lập, lập ngân sách chi tiêu hàng tháng.
  3. **Bảo mật & kiểm soát** — Ví Chính có thể theo dõi và kiểm soát hạn mức, đảm bảo an toàn tài chính.
- **CTA:** Khám phá

**Màn B10 — Yêu cầu liên kết từ Ví Chính**
- **Mục đích:** User review chi tiết yêu cầu mời từ chủ ví trước khi chấp nhận.
- **Requirement:**
  - Thông tin người gửi yêu cầu (tên chủ Ví Chính, SĐT, hạn mức/tháng, trạng thái "Chờ duyệt").
  - Cảnh báo phạm vi sử dụng: _"Ví Phụ chỉ dùng để thanh toán và giao dịch. Không thể sử dụng các dịch vụ tài chính như Ví Trả Sau, Vay nhanh, Đầu tư, Bảo hiểm."_
  - Checkbox đồng ý điều khoản sử dụng Ví Phụ.
- **CTA chính:** Chấp nhận yêu cầu
- **CTA phụ:** Từ chối

**Màn B11 — OTP xác nhận chấp nhận liên kết**
- **Mục đích:** Xác minh bằng OTP để chính thức chấp nhận liên kết Ngăn Ví Phụ với Ví Chính.
- **Requirement:** 4 ô nhập OTP + thông báo mã đã gửi đến SĐT + timer đếm ngược và nút gửi lại. Banner thông tin: _"Bằng cách nhập OTP, bạn xác nhận đồng ý liên kết Ví Phụ với tài khoản Ví Chính."_
- **CTA:** Xác nhận

---

#### CỤM B5 — Kích hoạt thành công + Home

**Màn B12 — Kích hoạt Ngăn Ví Phụ thành công**
- **Mục đích:** Confirm Ngăn Ví Phụ đã được kích hoạt thành công.
- **Requirement:** Title "Ngăn Ví Phụ đã được kích hoạt!" + bảng thông tin liên kết: SĐT, Chủ Ví Chính, Hạn mức tháng, Hạn mức/giao dịch, Trạng thái (Đã kích hoạt), Ngày kích hoạt.
- **CTA:** Vào Ngăn Ví Phụ của tôi

**Màn B13 — Home Ngăn Ví Phụ**
- **Mục đích:** Màn chính của Ngăn Ví Phụ — user xem số dư, hạn mức, lịch sử giao dịch.
- **Requirement:** Thông tin user (tên, SĐT, trạng thái liên kết, số dư). Khu vực hạn mức tháng (đã dùng / tổng + % sử dụng). Section "Giao dịch gần đây". Nút yêu cầu nạp tiền (gửi cho ba/mẹ). Tab bar điều hướng dưới cùng.

---

#### CỤM B6 — Demo sử dụng (Quét QR thanh toán Circle K)

**Màn B14 — Quét QR thanh toán**
- **Mục đích:** User dùng camera quét mã QR tại điểm thanh toán (demo Circle K).
- **Requirement:** Màn camera full-screen với khung quét QR. Khi quét thành công → hiển thị thông tin merchant.
- **CTA:** (tự động chuyển khi quét thành công)

**Màn B15 — Thanh toán cho merchant**
- **Mục đích:** User xác nhận số tiền và thanh toán.
- **Requirement:** Thông tin merchant (Circle K). Số tiền cần trả (hoặc cho user nhập). Hiển thị số dư còn lại sau khi trả.
- **CTA:** Thanh toán

**Màn B16 — Thanh toán thành công**
- **Mục đích:** Confirm giao dịch hoàn tất.
- **Requirement:** Title "Thanh toán thành công!" + số tiền + thông tin giao dịch (Merchant, Mã GD, Thời gian, Phương thức).
- **CTA:** Hoàn tất

---

#### CỤM B7 — Khảo sát kết thúc trải nghiệm

**Màn B17 — Mời khảo sát**
- **Mục đích:** Cảm ơn user và mời tham gia khảo sát ngắn.
- **Requirement:** Title "Cảm ơn bạn rất nhiều!" + mô tả khảo sát "Chỉ 9 câu hỏi đơn giản, khoảng 2 phút".
- **CTA chính:** Bắt đầu khảo sát
- **CTA phụ:** Bỏ qua

**Màn B18 — Khảo sát trải nghiệm**
- **Mục đích:** Thu thập feedback theo bộ câu hỏi PSSUQ 9 câu.
- **Requirement:** Ô nhập tên user. 9 câu hỏi chia 3 section (Mức độ dễ sử dụng / Thông tin hướng dẫn / Giao diện & cảm nhận chung). Mỗi câu thang điểm 1–7.
- **CTA:** Gửi khảo sát

**Màn B19 — Cảm ơn cuối**
- **Mục đích:** Cảm ơn user đã hoàn thành khảo sát.
- **Requirement:** Title "Bạn thật tuyệt vời!" + lời cảm ơn.
- **CTA:** Về trang chủ MoMo

---

## 6. Design system & guidelines

- Tham khảo prototype HTML và MoMo Design System hiện hành để đảm bảo consistency.
- Pink primary của MoMo, font **Be Vietnam Pro**.
- Các màn pattern chuẩn (đăng ký, OTP, AML, khảo sát) → designer **reuse** từ design system, không cần design lại từ đầu.
- Các màn **mới đặc thù cho Ngăn Ví Phụ** cần đầu tư design riêng:
  - Luồng A: Onboarding (A1), Home quản lý (A2), Wizard tạo (A3–A5), Success + Share (A6), Chờ kích hoạt (A7), Chi tiết Ngăn Ví Phụ (A8), Nạp tiền (A9–A10).
  - Luồng B: Onboarding (B9), Yêu cầu liên kết (B10), OTP chấp nhận (B11), Kích hoạt thành công (B12), Home Ngăn Ví Phụ (B13).

---

## 7. Câu hỏi cần align trước design review

1. **Hạn mức:** Solution overview yêu cầu **hạn mức/ngày + hạn mức/giao dịch**, prototype hiện tại chỉ có **hạn mức/tháng** với cap 2.000.000 ₫. Cần thống nhất:
   - v1 dùng cấu trúc hạn mức nào?
   - Cap tối đa cần align với compliance/risk team.

2. **Thiết lập ngăn ví (Màn A4):** Solution overview yêu cầu chủ ví nhập thêm **Họ và tên + Mối quan hệ** với người được mời, prototype hiện không có. Có đưa vào v1 không?

3. **eKYC cho Ngăn Ví Phụ:** Solution overview nói Ngăn Ví Phụ **không cần** eKYC độc lập (vì mọi thứ thuộc trách nhiệm Ví Chính). Tuy nhiên có prototype trước đó có bước eKYC sinh trắc học (NFC + Face match). Cần xác nhận: v1 có yêu cầu eKYC phía người được mời hay không? Nếu có thì khi nào trigger?

4. **Số lượng Ngăn Ví Phụ tối đa** mà một Ví Chính có thể tạo? Cần handle UX khi vượt giới hạn (Màn A2).

5. **Case người được mời đã có MoMo + đã eKYC sẵn:** Có skip toàn bộ cụm B2 (đăng ký) + cụm B3 (AML) không?

6. **Khi user "Từ chối yêu cầu" ở Màn B10:** Flow đi về đâu? Có cần modal confirm "Bạn chắc chắn từ chối?" trước khi chốt?

7. **Cụm B6 (demo Circle K):** Đây là flow thật trong production hay chỉ là demo cho usability test? Nếu là demo: có cần tách thiết kế riêng cho onboarding mode không?

8. **Khi tap "Tạm dừng" ở Màn A8:** Có cần modal confirm trước khi tạm dừng ngăn ví không?

9. **Cảnh báo overdraft (Màn A9):** Khi số tiền nạp + số dư hiện tại có thể giúp Ngăn Ví Phụ vượt hạn mức tháng → có cần warning không?

10. **Push notification & email:** Khi chủ ví tạo ngăn ví / người thân chấp nhận / có giao dịch — có cần thiết kế template thông báo không? (Hiện đang out of scope, nhưng nên flag cho roadmap.)

---

## 8. Acceptance criteria cho handoff

- [ ] Đủ high-fidelity của 32 màn (13 Luồng A + 19 Luồng B), size iPhone 15 Pro (393×852), light mode.
- [ ] State variants cho mọi input (default / focused / filled / error) và CTA (default / pressed / disabled / loading).
- [ ] Bottom sheet share (Màn A6) đầy đủ 6 share option.
- [ ] Error modals cho các edge case quan trọng (SĐT trùng, OTP sai, API fail).
- [ ] Empty state + filled state cho Home (Màn A2).
- [ ] Animation spec (transition, success, error shake).
- [ ] Asset export đầy đủ (icons, illustrations).
- [ ] Token mapping với MoMo Design System.

---

## 9. References

- **Solution Overview:** `SubWallet_Solution_Overview.docx`
- **Prototype Luồng A (Ví Chính):** `index_1.html`
- **Prototype Luồng B (Người được mời):** `index.html`
- **Regulation:** Thông tư 23/2019/TT-NHNN, Thông tư 40 (sinh trắc học).
- **Design system:** MoMo Figma UI Kit.

---

_12 May 2026 — Product Growth_
