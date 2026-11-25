# SmartStock AI - Hệ thống Quản lý Kho & Nhập Xuất Hàng Thông Minh

Ứng dụng web Frontend hoàn chỉnh phục vụ đề tài báo cáo thực tập: **"Hệ thống Quản lý Kho & Nhập Xuất Hàng Thông Minh (SmartStock AI)"** dành cho ngành **Thiết bị công nghệ & Linh kiện máy tính**.

---

## 🚀 Công nghệ sử dụng (Tech Stack)

- **Framework**: Vue 3 (Composition API với cú pháp `<script setup>`)
- **Build tool**: Vite (khởi động tức thì, HMR siêu nhanh)
- **State Management**: Pinia (Store quản lý trạng thái tồn kho, đồng bộ dữ liệu thời gian thực giữa tất cả các màn hình)
- **Router**: Vue Router 4 (chuyển đổi linh hoạt giữa 5 phân hệ qua Sidebar)
- **Styling**: TailwindCSS (tông màu trắng, xanh dương chủ đạo `#1D4ED8` và xám nhạt hiện đại)
- **Icons**: Lucide Vue Next (`lucide-vue-next`)

---

## 📋 Cấu trúc 5 Màn hình Chức năng

1. **Tổng quan (`DashboardView.vue`)**:
   - **4 thẻ thống kê cốt lõi**:
     - *Tổng giá trị tồn kho*: `1.480.000.000đ` (tính theo giá vốn thời điểm thực tế)
     - *Phiếu nhập tháng này*: `42 phiếu`
     - *Phiếu xuất tháng này*: `118 phiếu`
     - *Cảnh báo sắp hết*: `4 sản phẩm` (chạm ngưỡng an toàn)
   - **Bảng Cảnh báo hàng sắp hết tồn kho**: Hiển thị Mã SKU, Tên sản phẩm, Tồn hiện tại, Định mức tối thiểu, Badge đỏ *"Cần nhập gấp"* và nút thao tác *"+ Nhập ngay"*.
   - **Bảng Hoạt động nhập xuất gần đây**: Nhật ký các giao dịch nhập xuất, thông báo cảnh báo kho theo thời gian thực.

2. **Sản phẩm & Tồn kho (`ProductView.vue`)**:
   - Ô tìm kiếm theo tên hoặc mã SKU thời gian thực.
   - Bộ lọc danh mục theo tabs: *Tất cả*, *Laptop*, *Linh kiện PC*, *Thiết bị mạng*, *Phụ kiện*.
   - Bảng 10 sản phẩm mẫu ngành công nghệ cao (Asus ROG, Dell XPS, CPU i7-14700K, RTX 4070 Super, RAM Corsair DDR5, SSD Samsung 990 Pro...) với đầy đủ Mã SKU, Tên, ĐVT, Giá nhập, Giá bán, Tồn kho, Trạng thái an toàn/cảnh báo.
   - Nút **"+ Thêm sản phẩm"** mở Modal nhập liệu đầy đủ và thêm ngay vào kho hàng.

3. **Nhập kho (`StockInView.vue`)**:
   - Danh sách phiếu nhập kho (PN001, PN002...) hiển thị chi tiết Nhà cung cấp (Synnex FPT, Digiworld, Mai Hoàng...), Người lập (*Trịnh Hoàng Thái*), Số lượng mặt hàng, Tổng tiền nhập.
   - Nút **"+ Lập phiếu nhập kho"** mở form cho phép chọn nhà cung cấp, thêm nhiều dòng sản phẩm, tự động tính tổng tiền.
   - **Đặc biệt**: Bấm lưu sẽ **tự động cộng dồn vào tồn kho** của trang Sản phẩm & Tồn kho ngay lập tức.

4. **Xuất kho (`StockOutView.vue`)**:
   - Danh sách phiếu xuất kho (PX001, PX002...) hiển thị nơi nhận (Showroom Quận 1, Khách hàng dự án FPT Software...), Tổng giá trị xuất.
   - Nút **"+ Lập phiếu xuất kho"** mở form xuất hàng.
   - **Kiểm soát nghiệp vụ kho**: Nếu số lượng xuất **lớn hơn số lượng tồn thực tế**, hệ thống lập tức hiển thị **thông báo lỗi đỏ** cảnh báo và chặn xuất kho. Ngược lại, xuất thành công và **trừ trực tiếp vào tồn kho**.

5. **Trợ lý AI Kho hàng (`AiAssistantView.vue`)**:
   - **Khung chat bên trái**: Tích hợp trợ lý ảo SmartStock AI v2.5.
   - 3 nút bấm câu hỏi gợi ý nhanh:
     1. *"Mặt hàng nào sắp hết tồn kho?"* -> AI tự động quét danh sách các sản phẩm $\le$ minStock và đưa ra khuyến nghị số lượng cần nhập bù trong 48h.
     2. *"Thống kê tổng giá trị hàng tồn hiện tại"* -> AI tính toán tổng vốn lưu kho, phân rã tỷ trọng theo từng nhóm danh mục.
     3. *"Gợi ý kế hoạch nhập hàng tuần tới"* -> AI lập bảng kế hoạch nhập hàng thông minh (gợi ý số lượng, đơn giá dự kiến, nhà cung cấp uy tín).
   - Cho phép người dùng nhập bất kỳ câu hỏi tự do nào để phân tích dữ liệu kho.
   - **Bảng số liệu tóm tắt bên phải**: Hiển thị Live AI Feed, tỷ lệ an toàn kho (%), danh sách ưu tiên nhập ngay.

---

## 🛠 Hướng dẫn Cài đặt & Khởi chạy

### Bước 1: Mở Terminal tại thư mục dự án
```bash
cd d:\thuctap\demo
```

### Bước 2: Cài đặt thư viện (nếu cần tải lại)
```bash
npm install
```

### Bước 3: Khởi chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```

Truy cập trên trình duyệt tại: **`http://localhost:3000`** (hoặc cổng hiển thị trên Terminal).

### Bước 4: Đóng gói dự án (Build Production)
```bash
npm run build
```
Mã nguồn được tối ưu trong thư mục `dist/` sẵn sàng triển khai.

