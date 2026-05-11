# Design Brief — Luồng Tạo Ngăn Ví Phụ

| | |
|---|---|
| **Feature** | Ngăn Ví Phụ |
| **Flow** | Chủ ví tạo Ngăn Ví phụ và mời người thân |
| **PM** | Product Growth |
| **Reference** | Prototype HTML `index_1.html` |

---

## 1. Bối cảnh

Phụ huynh MoMo muốn cấp một ngăn ví riêng cho con/người thân — vừa cho con tự lập, vừa kiểm soát chi tiêu, vừa chặn các dịch vụ tài chính rủi ro (Trả Sau, Vay Nhanh). Brief này mô tả luồng chủ ví tạo một Ngăn Ví phụ mới và gửi lời mời kích hoạt.

---

## 2. Flow tổng quan

```
Onboarding ─▶ Home (empty) ─▶ Nhập SĐT ─▶ Hạn mức ─▶ Xem lại ─▶ Success
                                 └── wizard 3 bước ──┘
```

First-time user thấy Onboarding trước. Sau khi tạo xong, ví xuất hiện trong Home ở trạng thái "Đang chờ kích hoạt" kèm link mời để share.

**Tổng: 6 màn cần design.**

---

## 3. Các màn cần design

### Màn 1 — Onboarding

**Mục đích:** Giới thiệu các value prop của tính năng để user hiểu.

**Requirement:** Giới thiệu 3 value prop của tính năng Ví Phụ. Danh sách 3 lợi ích, mỗi lợi ích có icon + tiêu đề + 1 dòng mô tả:

1. **An toàn từ A đến Z** — Đặt hạn mức tháng cho con. Vượt mức là không tiêu được.
2. **Bố mẹ luôn nắm rõ** — Xem con tiêu gì, ở đâu, lúc nào — ngay trên MoMo của bạn.
3. **Chặn dịch vụ rủi ro** — Chỉ thanh toán & chuyển tiền. Không Trả Sau, không Vay Nhanh.

**CTA:** Khám phá ngay

---

### Màn 2 — Home (Empty state)

**Mục đích:** Entry point để user bắt đầu flow tạo Ngăn Ví phụ.

**Requirement:** Section "Ngăn Ví phụ của tôi" hiển thị empty state cho biết user chưa có ngăn ví nào. Bên dưới có entry point "Thêm Ngăn Ví phụ" với sub "Mời thành viên gia đình" để invite user tap vào tạo ví đầu tiên. Phía trên section là card số dư ví chính.

**CTA:** Thêm Ngăn Ví phụ

---

### Màn 3 — Nhập SĐT (Bước 1/3)

**Mục đích:** Chủ ví nhập SĐT người thân muốn mời.

**Requirement:** Progress bar 3 bước ở trên cùng (Nhập SĐT — Hạn mức — Xác nhận). Tiêu đề "Nhập số điện thoại" + sub "Nhập SĐT của người thân để gửi lời mời kích hoạt Ngăn Ví phụ." Ô nhập SĐT có prefix +84.

**CTA:** Tiếp tục

---

### Màn 4 — Thiết lập hạn mức (Bước 2/3)

**Mục đích:** Chủ ví set hạn mức chi tiêu/tháng cho ngăn ví phụ + nhận thông tin về whitelist dịch vụ.

**Requirement:** Gồm 2 section:

1. **Hạn mức giao dịch:** Ô nhập số tiền (tối đa 2.000.000 ₫) + 4 mức gợi ý chọn nhanh: 500K | 1tr | 1.5tr | 2tr. Có hint "Tổng chi tiêu tối đa mỗi tháng, không vượt quá 2.000.000 ₫".
2. **Dịch vụ được phép sử dụng:** Thông báo cho user biết: _"Ví Phụ chỉ được phép sử dụng các dịch vụ **chuyển tiền, thanh toán**. Không được phép sử dụng các **dịch vụ tài chính** trên MoMo (Ví Trả Sau, Vay Nhanh,...)."_

**CTA:** Tiếp tục

---

### Màn 5 — Xem lại & Xác nhận (Bước 3/3)

**Mục đích:** Chủ ví review thông tin và đồng ý điều khoản trước khi tạo ví.

**Requirement:** Gồm 3 phần:

1. **Thông tin người được mời:** avatar + tên + SĐT.
2. **Thông tin ngăn ví:** Hạn mức / tháng + Dịch vụ được phép (Chuyển tiền, thanh toán).
3. **Đồng ý điều khoản:** _"Tôi đồng ý với Điều khoản sử dụng Ngăn Ví Phụ và xác nhận thông tin trên là chính xác."_ (link mở T&C).

CTA disabled cho đến khi user tick đồng ý điều khoản.

**CTA:** Xác nhận thêm Ngăn Ví phụ

---

### Màn 6 — Tạo thành công + Share

**Mục đích:** Confirm thành công + cho chủ ví share link mời người thân kích hoạt.

**Requirement:** Title "Thêm Ngăn Ví phụ thành công!" + body thông báo lời mời đã được gửi. Hiển thị link mời rút gọn (vd `momo.vn/vi-phu/abc123`) kèm option copy.

Khi tap "Chia sẻ" → mở bottom sheet với 6 option: Messenger / Zalo / SMS / Telegram / Sao chép / Khác.

Sau khi về Home, ví mới xuất hiện trong danh sách với badge "Đang chờ kích hoạt".

**CTA chính:** Về trang ví
**CTA phụ:** Chia sẻ

---

## 4. Lưu ý

- Tham khảo prototype HTML để hình dung tone & feel.
- Design system: pink primary của MoMo, font Be Vietnam Pro.
- Error states và edge cases sẽ align cụ thể trong design review.

---

## 5. Out of scope

- Màn chi tiết ví phụ, nạp tiền, kích hoạt phía người được mời, list view khi có ≥1 ví — sẽ ở brief riêng.

---

_12 May 2026 — Product Growth_
