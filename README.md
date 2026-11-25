# HerbaScan 1.2 – hướng dẫn chạy trên máy tính và điện thoại

HerbaScan là web app responsive/PWA. Máy tính và điện thoại dùng chung một đường link; điện thoại cần HTTPS để cấp quyền camera.

## A. Tra cứu đa nguồn không cần API key

Bản 1.2 bổ sung `/api/taxa/search` để tra cứu tên khoa học qua hai nguồn mở:
- GBIF Species API: đối sánh tên khoa học, họ và bậc phân loại.
- iNaturalist Taxa API: gợi ý taxon, tên phổ biến và số quan sát.

Trong giao diện, mở mục **Tra cứu đa nguồn thực vật**, nhập tên như `Colocasia esculenta` rồi chọn **Tra cứu nguồn mở**. Các nguồn này giúp đối chiếu phân loại; chúng KHÔNG tự nhận diện ảnh và không xác nhận cây ăn được.

## B. Nhận diện ảnh bằng AI

Nhận diện ảnh vẫn dùng Pl@ntNet API ở bản hiện tại. GBIF/iNaturalist là lớp bổ sung dữ liệu, không phải dịch vụ thay thế nhận diện ảnh. Vì vậy muốn bật nhận diện ảnh và Live Scan cần API key Pl@ntNet (hoặc sau này tích hợp nhà cung cấp AI ảnh khác).

1. Mở https://my.plantnet.org/ và đăng ký tài khoản, xác nhận email.
2. Đăng nhập, mở Settings → API key (hoặc https://my.plantnet.org/settings/api-key).
3. Tạo/copy Private API Key. Không gửi key vào chat, không đăng lên GitHub và không đặt key trong mã HTML.
4. Gói Free hiện cho tối đa 500 lượt nhận diện/ngày; một lần Live Scan gửi một lượt. Nên tạm dừng Live Scan khi không dùng.

## C. Chạy thử trên máy tính Windows

Cài Node.js 20 LTS trở lên từ https://nodejs.org/.

1. Giải nén ZIP. Mở thư mục `HerbaScan` (thư mục có `package.json`).
2. Mở PowerShell tại thư mục đó.
3. Chạy `npm install`.
4. Tạo file `.env` cùng cấp `server.js`, nội dung:

```env
PLANTNET_API_KEY=dan_private_api_key_cua_ban_vao_day
PORT=3000
```

5. Chạy `npm start`.
6. Mở `http://localhost:3000` trên máy tính. Kiểm tra `http://localhost:3000/api/health` phải trả JSON có `ok: true`.

## D. Đưa lên Internet để dùng cả máy tính và điện thoại (Render)

Cần tài khoản GitHub và Render. Các nút/tên menu có thể thay đổi theo giao diện nhà cung cấp.

1. Tạo repository GitHub mới, ví dụ `herbascan`.
2. Tải các file trong thư mục `HerbaScan` lên repository (không tải file `.env`; `.gitignore` đã chặn file này). Có thể dùng GitHub web → Add file → Upload files.
3. Đăng nhập https://render.com/ và kết nối GitHub.
4. Chọn New → Web Service → repository `herbascan`.
5. Cấu hình: Runtime `Node`; Build Command `npm install`; Start Command `npm start`; Health Check Path `/api/health`; chọn gói phù hợp (Free nếu chỉ thử nghiệm).
6. Trong Environment, thêm `PLANTNET_API_KEY` với giá trị private key. Không đặt key vào source code. Lưu và deploy.
7. Chờ trạng thái Live. Mở URL `https://ten-dich-vu.onrender.com`; `/api/health` phải trả `ok:true`.
8. Mở URL HTTPS trên máy tính và điện thoại. Trên điện thoại, chọn cho phép camera; dùng Chrome/Edge/Safari cập nhật. Có thể chọn “Thêm vào màn hình chính” để cài như ứng dụng.

Có thể dùng `render.yaml` kèm repository để khai báo cấu hình, nhưng vẫn phải nhập secret `PLANTNET_API_KEY` trong Dashboard.

## E. Cách sử dụng

- Live Scan: bật camera, hướng vào một cây/nguyên liệu rõ nét; hệ thống lấy một khung hình khoảng 4 giây/lần. Dừng camera khi xong để tiết kiệm quota và dữ liệu di động.
- Nhận diện ảnh: tải tối đa 5 ảnh của cùng một cây, ưu tiên lá, mặt dưới lá, thân/cuống, hoa/quả.
- Trợ lý đi chợ: tra tên nguyên liệu và món ăn từ dữ liệu gợi ý có sẵn. Dữ liệu món ăn hiện là hướng dẫn mẫu, không phải tư vấn an toàn thực phẩm cá nhân hóa.

## F. Xử lý lỗi thường gặp

- `PLANTNET_API_KEY` chưa cấu hình: nhập key trong `.env` khi chạy local hoặc Environment trên Render, sau đó khởi động/deploy lại.
- Camera không bật trên điện thoại: phải mở bằng HTTPS, không mở file HTML trực tiếp; cấp quyền camera trong trình duyệt.
- `Failed to fetch`: kiểm tra URL backend, deploy logs và `/api/health`.
- HTTP 429: đã hết quota trong ngày; chờ quota reset.
- Render Free có thể tự ngủ khi không có truy cập; lần mở đầu sau thời gian ngủ có thể chậm.

## Quyền riêng tư và giới hạn

Ảnh được gửi tới máy chủ HerbaScan rồi chuyển tới Pl@ntNet để định danh. Pl@ntNet nêu rằng ảnh không được lưu thành ảnh trong cơ sở dữ liệu của họ, nhưng lịch sử truy vấn (thời điểm và URL ảnh) được lưu để thống kê/quản lý quota. Hãy tránh gửi ảnh có khuôn mặt, giấy tờ hoặc dữ liệu riêng tư.

Kết quả là gợi ý định danh thực vật, không chứng nhận cây ăn được, cây thuốc hay an toàn. Không ăn/bôi/dùng cây chỉ dựa vào kết quả AI. Các tên dân gian như “khoai ngọt”, “bạc hà” thay đổi theo vùng; cần xác minh với người bán và người có chuyên môn.

Dịch vụ nhận diện dùng Pl@ntNet API; cần ghi nhận Powered by Pl@ntNet theo điều khoản hiện hành.
