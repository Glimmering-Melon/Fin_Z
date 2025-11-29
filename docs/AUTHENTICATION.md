# Authentication System

Hệ thống xác thực hoàn chỉnh với Laravel + React + Inertia.js

## Tính năng

### ✅ Đã hoàn thành

1. **Login Form**
   - Input email và password
   - Validation (email format, required fields)
   - Remember me checkbox
   - Link đến forgot password
   - Nút chuyển sang sign up

2. **Register Form**
   - Input name, email, password, confirm password
   - Validation mạnh mẽ:
     - Email format
     - Password tối thiểu 8 ký tự
     - Phải có chữ hoa, chữ thường, số, ký tự đặc biệt
     - Confirm password phải khớp
   - Nút chuyển sang login

3. **Forgot Password**
   - Nhập email để nhận link reset password
   - Gửi email với link reset
   - Link back to login

4. **Reset Password**
   - Form nhập password mới
   - Validation password mạnh
   - Confirm password
   - Token-based reset

5. **Controllers**
   - `AuthController`: login, register, logout
   - `ForgotPasswordController`: gửi reset link
   - `ResetPasswordController`: reset password

6. **Session Management**
   - Laravel Sanctum đã được cài đặt
   - Session-based authentication
   - Logout với session invalidation

7. **Email Template**
   - Template đẹp cho reset password email
   - Responsive design

## Routes

### Guest Routes (chưa đăng nhập)
- `GET /login` - Hiển thị form login
- `POST /login` - Xử lý login
- `GET /register` - Hiển thị form register
- `POST /register` - Xử lý register
- `GET /forgot-password` - Hiển thị form forgot password
- `POST /forgot-password` - Gửi reset link
- `GET /reset-password/{token}` - Hiển thị form reset password
- `POST /reset-password` - Xử lý reset password

### Authenticated Routes (đã đăng nhập)
- `POST /logout` - Logout
- `GET /` - Dashboard (và các routes khác)

## Cấu hình Email

Hiện tại email được cấu hình với `MAIL_MAILER=log` (ghi vào log file).

### Để sử dụng email thật (Gmail):

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

**Lưu ý**: Với Gmail, bạn cần tạo App Password tại: https://myaccount.google.com/apppasswords

### Để test email local (Mailtrap):

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
```

## Sử dụng

### 1. Chạy migrations (đã chạy)
```bash
php artisan migrate
```

### 2. Test authentication

#### Đăng ký user mới:
- Truy cập `/register`
- Điền thông tin (password phải đủ mạnh)
- Submit form

#### Đăng nhập:
- Truy cập `/login`
- Nhập email và password
- Submit form
- Sẽ redirect về dashboard

#### Quên mật khẩu:
- Truy cập `/forgot-password`
- Nhập email
- Check log file hoặc email để lấy reset link
- Click link và nhập password mới

#### Đăng xuất:
- Click nút Logout trong Sidebar

## Components

### React Components
- `LoginForm.tsx` - Form đăng nhập
- `RegisterForm.tsx` - Form đăng ký

### React Pages
- `Auth/Login.tsx` - Trang login
- `Auth/Register.tsx` - Trang register
- `Auth/ForgotPassword.tsx` - Trang forgot password
- `Auth/ResetPassword.tsx` - Trang reset password

### Laravel Controllers
- `AuthController.php` - Xử lý login, register, logout
- `ForgotPasswordController.php` - Xử lý forgot password
- `ResetPasswordController.php` - Xử lý reset password

## Security Features

1. **Password Validation**
   - Tối thiểu 8 ký tự
   - Phải có chữ hoa (A-Z)
   - Phải có chữ thường (a-z)
   - Phải có số (0-9)
   - Phải có ký tự đặc biệt (!@#$%^&*)

2. **Session Security**
   - Session regeneration sau login
   - Session invalidation khi logout
   - CSRF protection (Laravel mặc định)

3. **Email Validation**
   - Format validation
   - Unique email check khi register

4. **Token-based Password Reset**
   - Token hết hạn sau 60 phút
   - One-time use token

## Middleware

- `guest` - Chỉ cho phép user chưa đăng nhập
- `auth` - Chỉ cho phép user đã đăng nhập

## Shared Props

Tất cả pages đều có access đến:
```typescript
auth: {
  user: {
    name: string;
    email: string;
  } | null
}
```

## Testing

### Manual Testing Checklist

- [ ] Register với password yếu (phải fail)
- [ ] Register với password mạnh (phải success)
- [ ] Login với credentials sai (phải fail)
- [ ] Login với credentials đúng (phải success)
- [ ] Remember me checkbox hoạt động
- [ ] Forgot password gửi email
- [ ] Reset password với token hợp lệ
- [ ] Reset password với token hết hạn (phải fail)
- [ ] Logout hoạt động đúng
- [ ] Redirect về login khi chưa đăng nhập
- [ ] Không thể access login/register khi đã đăng nhập

## Next Steps (Tùy chọn)

1. **Email Verification**
   - Verify email sau khi register
   - Resend verification email

2. **Two-Factor Authentication**
   - SMS hoặc authenticator app
   - Backup codes

3. **Social Login**
   - Google OAuth
   - Facebook OAuth
   - GitHub OAuth

4. **Rate Limiting**
   - Giới hạn số lần login thất bại
   - Throttle forgot password requests

5. **Account Management**
   - Change password
   - Update profile
   - Delete account
