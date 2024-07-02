Link deploy: [ https://zola-3q9b.onrender.com](https://zolachat.onrender.com/chats)
1: Use case tổng quát:
![image](https://github.com/NguyenLeChiDai/final-chat-app-main/assets/157259663/2710a009-8db6-43e0-b23f-0c0b9205366f)
2: Class Diagram
![image](https://github.com/NguyenLeChiDai/final-chat-app-main/assets/157259663/90c3d39b-8e63-419b-99bf-bd242cc67bea)
3: Sơ đồ kiến trúc hệ thống:
![image](https://github.com/NguyenLeChiDai/final-chat-app-main/assets/157259663/cc83f86c-b0f8-45d9-95aa-c101c24b38b4)
4: Giao diện:
  
  4.1: Giao diện đăng ký
![image](https://github.com/NguyenLeChiDai/final-chat-app-main/assets/157259663/09f143c9-a54e-45b5-8d78-3a1e008c7b60)
   
    Giao diện đăng ký gồm:
    (1) Biểu tượng tên của ứng dụng chat
    Các ô nhập thông tin gồm: (2)tên tài khoản, (3)email, (4)số điên thoại
    (5) Nút bấm gửi OTP để gửi mã xác thực
    (6) Phần xác thực capcha “Tôi không phải là người máy”
    (7) Ô nhập mã OTP
    (8) Ô nhập mật khẩu và (9) xác nhận lại mật khẩu
    (10) Chọn ảnh đại diện.
    (11) Nút Đăng ký: nhấn để đăng ký tài khoản bằng các thông tin được điền ở trên

4.2: Giao diện đăng nhập
![image](https://github.com/NguyenLeChiDai/final-chat-app-main/assets/157259663/46203acc-07fd-4e69-b152-4ed105608d1b)
 
  Giao diện đăng nhập gồm:
  Các ô nhập thông tin gồm: (1)Số điện thoại (có thể chọn đầu số ở các quốc gia khác nhau) và (2) ô nhập mật khẩu.
  (3) Hiện: Hiển thị mật khẩu đang nhập
  (4) Nút Đăng nhập: nhấn đăng nhập vào tài khoản bằng thông tin đã nhập ở trên
4.3: Giao diện chat đơn
![image](https://github.com/NguyenLeChiDai/final-chat-app-main/assets/157259663/f5711f44-e033-41ae-bc72-476895c793be)

Giao diện chính gồm: 
- “Liên hệ” :
+ “Tạo nhóm mới”: nhấp vào để tạo một nhóm mới
+ Dánh sách các bạn bè hoặc nhóm
- Khu vực hiển thị dùng để chat
- Ô tìm kiếm bạn bè/ nhóm 
- Biểu tượng “cái chuông”: hiển thị số lượng tin chưa đọc khi có tin nhắn mới
Biểu tượng tài khoản cá nhân: chứa các thông tin các nhân

4.4: Giao diện xem hồ sơ
![image](https://github.com/NguyenLeChiDai/final-chat-app-main/assets/157259663/6f4cd1b7-b215-486f-b06d-fe6269b3f8cd)

Giao diện xem hồ sơ: 
Khi nhấp vào biểu tượng tài khoản sẽ hiển thị danh sách các chức năng gồm:
1: Xem hồ sơ
2: Đăng xuất
3: Xem yêu cầu kết bạn

4.5: Giao diện chỉnh sửa thông tin
![image](https://github.com/NguyenLeChiDai/final-chat-app-main/assets/157259663/694aed41-d5f7-4a11-8b7d-b0a525094708)

Giao diện web sửa hồ sơ:
1- Khung điền tên để cập nhật
2- Khung điền email để cập nhật
3- Khung điền số điện thoại để cập nhật
4- Khung điền mật khẩu để cập nhật
5- Lưu các thông tin mới cập nhật
6- Hủy các mục đã điền ở trên
7- Đóng giao diện cập nhật hồ sơ

4.6 Giao diện tạo nhóm mới:
![image](https://github.com/NguyenLeChiDai/final-chat-app-main/assets/157259663/376dfe3f-9674-48b4-8aa6-d40d13d204cc)

Giao diện tạo nhóm mới:
1 - Ô nhâp : Điền tên nhóm
2 - Ô tìm bạn bè để thêm vào nhóm
3 - Hiển thị các thành viên đã được chọn để thêm vào
4 – Hiển thị bạn bè theo tên đã tìm ở số 2 (nhấp vào để thêm vào nhóm
5 - Nút tạo nhóm: Nhấn để tạo nhóm

4.6: Giao diện tìm bạn bè
![image](https://github.com/NguyenLeChiDai/final-chat-app-main/assets/157259663/70ceb6f2-461a-4809-a27f-d17919538a93)

Giao diện tìm bạn bè:
1 - Ô nhập tên bạn bè muốn tìm
2 - Nút tìm: nhấn để tìm bạn bè
3 - Danh sách các bạn bè có tên liên quan được hiển thị bên dưới

4.7: Giao diện chat nhóm
![image](https://github.com/NguyenLeChiDai/final-chat-app-main/assets/157259663/9148e9fc-1e5e-43ff-9b5f-0e9a6c094cf8)

Giao diện chat nhóm
1- Tên nhóm đang chat
2- Tên nhóm
3- Tin nhắn nhóm
4- Xóa tin nhắn
5- Trả lời tin nhắn
6- Ảnh đại diện thành viên nhóm chat
7- Xem thông tin nhóm

4.8: Giao diện chỉnh sửa thông tin nhóm:
![image](https://github.com/NguyenLeChiDai/final-chat-app-main/assets/157259663/b20d2a34-d021-4a7d-9a20-c00bac4a4428)

Giao diện sửa thông tin, xóa nhóm gồm:
2- Danh sách nhóm
3- Nút “x” để xóa thành viên
4- Ô nhập tên nhóm mới nếu thay đổi
5- Nút cập nhật: nhấn để cập nhật lại sự thay đổi của nhóm (tên, thành viên)
6- Ô tìm bạn bè để thêm vào nhóm
7- Hiển thị các thành viên đã được chọn để thêm vào
8- Nút xóa nhóm: Xóa nhóm 
9- Rời nhóm: Rời khỏi nhóm















