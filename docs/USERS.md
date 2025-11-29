# Test Users

Danh sách users đã được tạo sẵn để test hệ thống.

## Seeded Users

### 1. Admin User
```
Email: admin@stockdashboard.com
Password: Admin@123
Role: Administrator
```

### 2. Demo User
```
Email: demo@stockdashboard.com
Password: Demo@123
Role: Demo account for testing
```

### 3. John Doe
```
Email: john@example.com
Password: Password@123
Role: Regular user
```

### 4. Jane Smith
```
Email: jane@example.com
Password: Password@123
Role: Regular user
```

### 5. Bob Wilson
```
Email: bob@example.com
Password: Password@123
Role: Regular user
```

### 6. Alice Johnson
```
Email: alice@example.com
Password: Password@123
Role: Regular user
```

### 7-16. Random Users
- 10 additional users được tạo bằng Factory
- Random names và emails
- Password: `password` (default factory password)

## Chạy Seeder

### Seed tất cả
```bash
php artisan db:seed
```

### Seed chỉ users
```bash
php artisan db:seed --class=UserSeeder
```

### Fresh migration + seed
```bash
php artisan migrate:fresh --seed
```

## Đăng ký User Mới

### Via Web Interface
1. Truy cập: `http://localhost:8000/register`
2. Điền thông tin:
   - Name: Tên đầy đủ
   - Email: Email hợp lệ (unique)
   - Password: Tối thiểu 8 ký tự, phải có:
     - Chữ hoa (A-Z)
     - Chữ thường (a-z)
     - Số (0-9)
     - Ký tự đặc biệt (!@#$%^&*)
   - Confirm Password: Phải khớp với password
3. Click "Sign Up"

### Via Tinker
```bash
php artisan tinker

>>> use App\Models\User;
>>> use Illuminate\Support\Facades\Hash;
>>> User::create([
...   'name' => 'New User',
...   'email' => 'newuser@example.com',
...   'password' => Hash::make('Password@123'),
...   'email_verified_at' => now(),
... ]);
```

### Via Seeder (Custom)
Tạo file `database/seeders/CustomUserSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomUserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Your Name',
            'email' => 'your@email.com',
            'password' => Hash::make('YourPassword@123'),
            'email_verified_at' => now(),
        ]);
    }
}
```

Chạy:
```bash
php artisan db:seed --class=CustomUserSeeder
```

## Password Requirements

Khi đăng ký hoặc reset password, password phải đáp ứng:

- ✅ Tối thiểu 8 ký tự
- ✅ Ít nhất 1 chữ hoa (A-Z)
- ✅ Ít nhất 1 chữ thường (a-z)
- ✅ Ít nhất 1 số (0-9)
- ✅ Ít nhất 1 ký tự đặc biệt (!@#$%^&*)

### Ví dụ passwords hợp lệ:
- `Password@123`
- `Admin@123`
- `Demo@123`
- `MyP@ssw0rd`
- `Secure#2024`

### Ví dụ passwords không hợp lệ:
- `password` (thiếu chữ hoa, số, ký tự đặc biệt)
- `Password123` (thiếu ký tự đặc biệt)
- `Pass@1` (quá ngắn, < 8 ký tự)
- `PASSWORD@123` (thiếu chữ thường)

## User Factory

File: `database/factories/UserFactory.php`

Factory tạo random users với:
- Random name (Faker)
- Random email (unique)
- Password: `password` (hashed)
- Email verified at: current timestamp

### Sử dụng Factory

```php
// Tạo 1 user
User::factory()->create();

// Tạo 10 users
User::factory(10)->create();

// Tạo user với custom data
User::factory()->create([
    'name' => 'Custom Name',
    'email' => 'custom@example.com',
]);

// Tạo unverified user
User::factory()->unverified()->create();
```

## Quản lý Users

### Xem tất cả users
```bash
php artisan tinker
>>> User::all();
>>> User::count();
```

### Tìm user theo email
```bash
>>> User::where('email', 'admin@stockdashboard.com')->first();
```

### Xóa user
```bash
>>> User::where('email', 'test@example.com')->delete();
```

### Update password
```bash
>>> $user = User::find(1);
>>> $user->password = Hash::make('NewPassword@123');
>>> $user->save();
```

### Verify email
```bash
>>> $user = User::find(1);
>>> $user->email_verified_at = now();
>>> $user->save();
```

## Testing Login

### Test với seeded users:

1. **Admin Login**
   ```
   Email: admin@stockdashboard.com
   Password: Admin@123
   ```

2. **Demo Login**
   ```
   Email: demo@stockdashboard.com
   Password: Demo@123
   ```

3. **Regular User Login**
   ```
   Email: john@example.com
   Password: Password@123
   ```

### Test Registration Flow:

1. Truy cập `/register`
2. Điền form với password mạnh
3. Submit
4. Kiểm tra redirect về dashboard
5. Verify user trong database:
   ```bash
   php artisan tinker
   >>> User::latest()->first();
   ```

## Troubleshooting

### Issue: "Email already exists"
**Solution**: Email phải unique, sử dụng email khác hoặc xóa user cũ

### Issue: "Password too weak"
**Solution**: Đảm bảo password đáp ứng tất cả requirements

### Issue: Không thể login sau khi register
**Solution**: 
1. Check database có user không
2. Verify password đã được hash
3. Clear cache: `php artisan config:clear`

### Issue: Seeder fails
**Solution**:
```bash
# Reset database
php artisan migrate:fresh

# Run seeder again
php artisan db:seed
```

## Security Notes

⚠️ **QUAN TRỌNG**: 

1. **Đổi passwords trong production**
   - Không sử dụng passwords mặc định
   - Sử dụng passwords mạnh và unique

2. **Email verification**
   - Enable email verification trong production
   - Uncomment `MustVerifyEmail` trong User model

3. **Rate limiting**
   - Laravel có built-in rate limiting
   - Giới hạn login attempts

4. **Two-factor authentication**
   - Cân nhắc implement 2FA cho admin users
   - Sử dụng packages như `laravel/fortify`

## Next Steps

1. **Role-based Access Control (RBAC)**
   - Install Spatie Permission package
   - Define roles: admin, user, viewer
   - Protect routes based on roles

2. **User Profile Management**
   - Edit profile page
   - Change password
   - Avatar upload

3. **Activity Logging**
   - Track user actions
   - Login history
   - Audit trail

4. **Email Verification**
   - Send verification email
   - Verify email before access
   - Resend verification link
