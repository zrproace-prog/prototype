# Design Brief — Luồng Quản lý Ngăn Ví Phụ (phía Chủ Ví)

| | |
|---|---|
| **Feature** | Ngăn Ví Phụ — phía chủ ví (ba/mẹ) |
| **Flow** | Tạo Ngăn Ví Phụ → Quản lý → Nạp tiền → Khảo sát |
| **PM** | Product Growth |
| **Reference** | Prototype HTML `index_1-69ee0927.html` |

---

## 1. Bối cảnh

Phụ huynh MoMo muốn cấp một ngăn ví riêng cho con/người thân — vừa cho con tự lập, vừa kiểm soát chi tiêu, vừa chặn các dịch vụ tài chính rủi ro (Trả Sau, Vay Nhanh). Brief này mô tả toàn bộ trải nghiệm phía chủ ví: từ onboarding, tạo ngăn ví, quản lý ngăn ví đã tạo, nạp tiền cho con, và kết thúc bằng khảo sát trải nghiệm.

---

## 2. Flow tổng quan

Chủ ví thấy **onboarding** giới thiệu Ngăn Ví Phụ → vào **Home Quản lý Ngăn Ví Phụ** (lần đầu là empty state) → tap "Thêm Ngăn Ví Phụ" → đi qua **wizard 3 bước** (Nhập SĐT người thân → Thiết lập hạn mức → Xem lại & xác nhận) → màn **tạo thành công** với link mời để chia sẻ → quay về Home, ví mới hiện ở trạng thái "Đang chờ kích hoạt" → khi tap vào ví đang chờ → hiển thị **màn chờ kích hoạt** giải thích cần người thân kích hoạt → khi ví đã active, chủ ví có thể vào **màn chi tiết Ngăn Ví Phụ** (xem số dư, hạn mức, lịch sử giao dịch) và thực hiện hành động (Nạp tiền / Rút tiền / Tạm dừng) → flow **nạp tiền** (nhập số tiền + lời nhắn) → **nạp tiền thành công** → cuối trải nghiệm, user được mời tham gia **khảo sát** (9 câu PSSUQ) → **cảm ơn** kết thúc.

**Tổng: ~13 màn, chia 5 cụm.**

---

## 3. Chi tiết từng màn

### CỤM 1 — Onboarding & Home

#### Màn 1 — Onboarding
**Mục đích:** Giới thiệu 3 value prop của tính năng Ví Phụ để user hiểu.
**Requirement:** Giới thiệu 3 value prop, mỗi value prop có icon + tiêu đề + 1 dòng mô tả:

1. **An toàn từ A đến Z** — Đặt hạn mức tháng cho con. Vượt mức là không tiêu được.
2. **Bố mẹ luôn nắm rõ** — Xem con tiêu gì, ở đâu, lúc nào — ngay trên MoMo của bạn.
3. **Chặn dịch vụ rủi ro** — Chỉ thanh toán & chuyển tiền. Không Trả Sau, không Vay Nhanh.

Tiêu đề lớn: "Cho con tự lập, bố mẹ vẫn yên tâm" + có link "Bỏ qua" ở góc trên phải.

**CTA:** Khám phá ngay

#### Màn 2 — Home Quản lý Ngăn Ví Phụ
**Mục đích:** Entry point để chủ ví tạo mới hoặc quản lý các Ngăn Ví Phụ hiện có.
**Requirement:** Hiển thị số dư ví chính + section "Ngăn Ví phụ của tôi". 2 trạng thái:

- **Empty state:** thông báo chưa có ngăn ví nào.
- **Có ví:** danh sách các Ngăn Ví Phụ đã tạo (tên, số dư, hạn mức, trạng thái Hoạt động / Tạm dừng / Đang chờ kích hoạt), mỗi item có shortcut Nạp tiền & Xem chi tiết.

Luôn có entry point "Thêm Ngăn Ví phụ" + sub "Mời thành viên gia đình".

**CTA:** Thêm Ngăn Ví phụ

---

### CỤM 2 — Wizard tạo Ngăn Ví Phụ (3 bước)

#### Màn 3 — Nhập SĐT (Bước 1/3)
**Mục đích:** Chủ ví nhập SĐT người thân muốn mời.
**Requirement:** Progress bar 3 bước (Nhập SĐT — Hạn mức — Xác nhận). Tiêu đề "Nhập số điện thoại" + sub "Nhập SĐT của người thân để gửi lời mời kích hoạt Ngăn Ví phụ." Ô nhập SĐT với prefix +84.
**CTA:** Tiếp tục

#### Màn 4 — Thiết lập hạn mức (Bước 2/3)
**Mục đích:** Chủ ví set hạn mức chi tiêu/tháng + nhận thông tin whitelist dịch vụ.
**Requirement:** Gồm 2 section:

1. **Hạn mức giao dịch:** Ô nhập số tiền (tối đa 2.000.000 ₫) + 4 mức gợi ý: 500K / 1tr / 1.5tr / 2tr. Hint "Tổng chi tiêu tối đa mỗi tháng, không vượt quá 2.000.000 ₫".
2. **Dịch vụ được phép sử dụng:** Thông báo _"Ví Phụ chỉ được phép sử dụng các dịch vụ **chuyển tiền, thanh toán**. Không được phép sử dụng các **dịch vụ tài chính** trên MoMo (Ví Trả Sau, Vay Nhanh,...)."_

**CTA:** Tiếp tục

#### Màn 5 — Xem lại & Xác nhận (Bước 3/3)
**Mục đích:** Chủ ví review thông tin và đồng ý điều khoản trước khi tạo ví.
**Requirement:** Gồm 3 phần:

1. **Thông tin người được mời:** avatar + tên + SĐT.
2. **Thông tin ngăn ví:** Hạn mức / tháng + Dịch vụ được phép (Chuyển tiền, thanh toán).
3. **Đồng ý điều khoản:** _"Tôi đồng ý với Điều khoản sử dụng Ngăn Ví Phụ và xác nhận thông tin trên là chính xác."_

CTA disabled cho đến khi tick checkbox.

**CTA:** Xác nhận thêm Ngăn Ví phụ

#### Màn 6 — Tạo thành công + Share
**Mục đích:** Confirm thành công + cho chủ ví share link mời người thân kích hoạt.
**Requirement:** Title "Thêm Ngăn Ví phụ thành công!" + body khác nhau cho 2 case (người thân đã có MoMo / chưa có MoMo). Hiển thị link mời rút gọn (vd `momo.vn/vi-phu/abc123`) + option copy.

Khi tap "Chia sẻ" → mở bottom sheet với các option: Messenger / Zalo / SMS / Telegram / Sao chép / Khác.

**CTA chính:** Về trang ví
**CTA phụ:** Chia sẻ

---

### CỤM 3 — Trạng thái chờ kích hoạt

#### Màn 7 — Ví đang chờ kích hoạt
**Mục đích:** Thông báo cho chủ ví biết Ngăn Ví Phụ chưa kích hoạt được vì người thân chưa làm thao tác kích hoạt.
**Requirement:** Title "Ví phụ của bạn đang chờ kích hoạt" + body _"Nhờ người thân gửi lời mời kích hoạt qua MoMo để bắt đầu nhận tiền."_
**CTA:** Quay lại

---

### CỤM 4 — Chi tiết & Nạp tiền

#### Màn 8 — Chi tiết Ngăn Ví Phụ
**Mục đích:** Chủ ví xem thông tin tổng quan của một Ngăn Ví Phụ và thực hiện hành động quản lý.
**Requirement:** Thông tin tổng quan: avatar + tên + SĐT + trạng thái + số dư, hạn mức/tháng, số tiền đã dùng tháng này. 3 hành động nhanh: **Nạp tiền / Rút tiền / Tạm dừng (hoặc Mở lại)**. Bảng thông tin: hạn mức/tháng, dịch vụ được phép, trạng thái. Section lịch sử giao dịch của ngăn ví này.

#### Màn 9 — Nạp tiền cho Ngăn Ví Phụ
**Mục đích:** Chủ ví nhập số tiền và lời nhắn để nạp vào Ngăn Ví Phụ.
**Requirement:** Hiển thị người nhận (avatar + tên). Ô nhập số tiền (với numpad số riêng). 3 mức gợi ý nhanh: 200K / 500K / 1 triệu. Ô lời nhắn (tối đa 160 ký tự) + 3 gợi ý lời nhắn:

- _"Ba gửi tiền nha con"_
- _"Tiền tiêu vặt tháng này"_
- _"Con dùng tiết kiệm nha!"_

**CTA:** Nạp tiền

#### Màn 10 — Nạp tiền thành công
**Mục đích:** Confirm giao dịch nạp tiền hoàn tất.
**Requirement:** Title "Nạp tiền thành công!" + số tiền đã nạp (lớn, nổi bật) + tên ngăn ví nhận. Bảng thông tin giao dịch: Từ (Ví chính MoMo) / Đến (tên ngăn ví) / Thời gian / Mã GD.
**CTA chính:** Hoàn thành
**CTA phụ:** Xem chi tiết ví phụ

---

### CỤM 5 — Khảo sát kết thúc trải nghiệm

#### Màn 11 — Mời khảo sát
**Mục đích:** Cảm ơn user đã trải nghiệm và mời tham gia khảo sát ngắn.
**Requirement:** Title "Cảm ơn bạn rất nhiều!" + body _"Bạn vừa hoàn thành luồng trải nghiệm quản lý Ví Phụ MoMo."_ Thông báo về khảo sát: "Chỉ 9 câu hỏi đơn giản, khoảng 2 phút".
**CTA chính:** Bắt đầu khảo sát
**CTA phụ:** Bỏ qua

#### Màn 12 — Khảo sát trải nghiệm
**Mục đích:** Thu thập feedback theo bộ câu hỏi PSSUQ 9 câu.
**Requirement:** Ô nhập tên user. 9 câu hỏi chia 3 section (Mức độ dễ sử dụng / Thông tin hướng dẫn / Giao diện & cảm nhận chung). Mỗi câu thang điểm 1–7.
**CTA:** Gửi khảo sát

#### Màn 13 — Cảm ơn cuối
**Mục đích:** Cảm ơn user đã hoàn thành khảo sát.
**Requirement:** Title "Bạn thật tuyệt vời!" + body cảm ơn + lời chào "Hẹn gặp lại bạn lần sau nhé!"
**CTA:** Về trang chủ MoMo

---

## 4. Lưu ý chung

- Tham khảo prototype HTML để hình dung tone & feel.
- Design system: pink primary của MoMo, font Be Vietnam Pro.
- Các màn **mới đặc thù cho Ngăn Ví Phụ** cần đầu tư design: Onboarding (M1), Home quản lý (M2), Wizard tạo (M3–M5), Success + Share (M6), Detail (M8), Nạp tiền (M9–M10).

---

## 5. Out of scope

- Flow phía người được mời (đã có brief riêng).
- Flow rút tiền từ Ngăn Ví Phụ về ví chính.
- Flow chỉnh sửa hạn mức / đổi thông tin Ngăn Ví Phụ sau khi đã tạo.
- Flow xóa / huỷ liên kết Ngăn Ví Phụ.

---

## 6. Câu hỏi cần align với design

1. Số lượng tối đa Ngăn Ví Phụ một chủ ví có thể tạo? Cần xử lý empty state khi vượt giới hạn.
2. Khi chủ ví tap "Tạm dừng" ở Màn 8 → có cần modal confirm trước khi tạm dừng không?
3. Có nên cho chủ ví đặt nickname riêng cho Ngăn Ví Phụ (khác với tên người thân) để dễ phân biệt nếu có nhiều ngăn?
4. Màn 9 (Nạp tiền) — có cần check warning khi số tiền nạp + số dư hiện tại vượt hạn mức/tháng không?

---

_12 May 2026 — Product Growth_
