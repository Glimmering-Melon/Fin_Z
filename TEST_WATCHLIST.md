# Test Watchlist Feature

## Cách test nhanh (không cần đợi team):

### Option 1: Chạy script tự động
```bash
setup-watchlist-test.bat
```

### Option 2: Chạy từng bước

#### Bước 1: Setup database
```bash
php artisan migrate
php artisan db:seed --class=WatchlistTestSeeder
```

#### Bước 2: Build frontend
```bash
npm install
npm run dev
```
(Mở terminal mới cho bước 3)

#### Bước 3: Start server
```bash
php artisan serve
```

#### Bước 4: Mở browser
```
http://localhost:8000/test/watchlist
```

## Test data đã tạo:

### Stocks có sẵn:
- VNM - Vinamilk
- VIC - Vingroup  
- HPG - Hoa Phat Group
- VHM - Vinhomes
- FPT - FPT Corporation

### User test:
- Email: test@example.com
- Password: password

### Watchlist mặc định:
- VNM, FPT, HPG đã được thêm sẵn

## Các tính năng để test:

### ✅ Add Stock
1. Nhập symbol: VIC hoặc VHM
2. Click "Add"
3. Stock xuất hiện trong danh sách

### ✅ Remove Stock
1. Click button "Remove" ở bất kỳ stock nào
2. Stock biến mất khỏi danh sách

### ✅ Sort
1. Click vào header "Symbol" - Sort theo tên
2. Click vào header "Price" - Sort theo giá
3. Click vào header "Change" - Sort theo % thay đổi
4. Click lại lần nữa - Đảo chiều sort (asc/desc)

### ✅ Real-time Update
- Đợi 30 giây, data sẽ tự động refresh

### ✅ UI Features
- Màu xanh: Giá tăng
- Màu đỏ: Giá giảm
- Hover effect trên table rows

## Test API trực tiếp:

### Lấy watchlist
```bash
curl http://localhost:8000/api/user/watchlist
```

### Thêm stock
```bash
curl -X POST http://localhost:8000/api/user/watchlist ^
  -H "Content-Type: application/json" ^
  -d "{\"symbol\":\"VIC\"}"
```

### Xóa stock (thay {id} bằng ID thực)
```bash
curl -X DELETE http://localhost:8000/api/user/watchlist/1
```

## Troubleshooting:

### Lỗi "composer not found"
- Cài Composer: https://getcomposer.org/download/
- Sau đó chạy: `composer install`

### Lỗi "npm not found"
- Cài Node.js: https://nodejs.org/
- Sau đó chạy: `npm install`

### Lỗi database connection
- Check file .env
- Đảm bảo MySQL đang chạy
- Tạo database: `CREATE DATABASE stock_dashboard;`

### Page trắng
- Check console browser (F12)
- Chạy: `npm run dev` trong terminal riêng
- Refresh browser
