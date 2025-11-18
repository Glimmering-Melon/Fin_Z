# Hướng dẫn cài đặt MySQL cho Stock Dashboard

## 1. Cài đặt MySQL

### Windows
- Download MySQL Installer từ: https://dev.mysql.com/downloads/installer/
- Chọn "MySQL Server" và "MySQL Workbench"
- Thiết lập root password

### macOS
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

## 2. Tạo Database

### Cách 1: Sử dụng MySQL CLI
```bash
mysql -u root -p
```

Sau đó chạy các lệnh SQL:
```sql
CREATE DATABASE stock_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE stock_dashboard_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user riêng (khuyến nghị cho production)
CREATE USER 'stock_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON stock_dashboard.* TO 'stock_user'@'localhost';
GRANT ALL PRIVILEGES ON stock_dashboard_test.* TO 'stock_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Cách 2: Sử dụng MySQL Workbench
1. Mở MySQL Workbench
2. Connect đến MySQL Server
3. Chạy SQL script ở trên

## 3. Cấu hình Laravel

Cập nhật file `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stock_dashboard
DB_USERNAME=root
DB_PASSWORD=your_password
```

Hoặc nếu dùng user riêng:
```env
DB_USERNAME=stock_user
DB_PASSWORD=your_secure_password
```

## 4. Chạy Migrations

```bash
# Kiểm tra kết nối
php artisan db:show

# Chạy migrations
php artisan migrate

# Seed dữ liệu mẫu
php artisan db:seed --class=StockSeeder
```

## 5. Kiểm tra

```bash
# Xem danh sách tables
php artisan db:table

# Hoặc dùng MySQL CLI
mysql -u root -p stock_dashboard -e "SHOW TABLES;"
```

## 6. Troubleshooting

### Lỗi: "Access denied for user"
- Kiểm tra username/password trong `.env`
- Đảm bảo user có quyền truy cập database

### Lỗi: "Unknown database"
- Đảm bảo đã tạo database
- Kiểm tra tên database trong `.env`

### Lỗi: "SQLSTATE[HY000] [2002] Connection refused"
- Kiểm tra MySQL service đang chạy
- Windows: `net start MySQL80`
- macOS: `brew services start mysql`
- Linux: `sudo systemctl start mysql`

### Lỗi: "Specified key was too long"
- Đã được fix bằng cách sử dụng utf8mb4
- Nếu vẫn lỗi, thêm vào `AppServiceProvider`:
```php
use Illuminate\Support\Facades\Schema;

public function boot()
{
    Schema::defaultStringLength(191);
}
```

## 7. Performance Tuning (Optional)

Thêm vào file `my.cnf` hoặc `my.ini`:
```ini
[mysqld]
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
max_connections = 200
query_cache_size = 32M
```

## 8. Backup & Restore

### Backup
```bash
mysqldump -u root -p stock_dashboard > backup.sql
```

### Restore
```bash
mysql -u root -p stock_dashboard < backup.sql
```

## 9. Scheduled Jobs với MySQL

Đảm bảo queue connection sử dụng MySQL:
```env
QUEUE_CONNECTION=database
```

Chạy queue worker:
```bash
php artisan queue:work --tries=3
```
