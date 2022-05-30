# Picsart Image HLS

## Hướng dẫn cài đặt
1. Giải nén thư mục tool trên VPS - Ubuntu >20.04
2. `cd` vào thư mục tool
3. Chạy `sudo bash install.sh`
4. Cài MongoDB - `https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/`
5. Cài settings trong file `.env`
6. Sau khi cài xong chạy `sudo bash init_api.sh && sudo bash init_worker.sh` để start tool
7. Bắt đầu upload

## API:

`/api/private/drive/{action}/{file_id}`
- `create`: tạo file
- `get`: get thông tin file
- `retry`: retry nếu file lỗi
- `delete`: xoá file

`/api/private/stat/{action}`
- `videos`: số video đã xong, đang xử lí, đã hoàn thành
- `done`: list video đã hoàn thành (max 100 vid mới nhất)
- `errors`: toàn bộ video lỗi
- `processing`: toàn bộ video đang xử lí