# DASH-1 Update: Profile Page

## Mô tả
Thêm trang Profile để user có thể xem và chỉnh sửa thông tin cá nhân.

## Các file đã tạo/sửa

### Backend

#### 1. ProfileController (`app/Http/Controllers/ProfileController.php`)
Controller xử lý profile page.

**Methods:**
- `index()`: Hiển thị trang profile
- `update()`: Cập nhật thông tin profile (TODO)

**Features:**
- Sử dụng `SharesFakeUserData` trait
- Return Inertia view với user data

### Frontend

#### 2. Profile Page (`resources/js/pages/Profile/index.tsx`)
Trang hiển thị và chỉnh sửa profile.

**Current State:**
- MainLayout wrapper
- Page title và description
- TODO placeholders cho các features

**Planned Features:**
- Profile form (name, email, etc.)
- Avatar upload
- Change password
- Account settings

### Routes

#### 3. Web Routes (`routes/web.php`)
Thêm profile routes.

**Routes:**
- `GET /profile` → ProfileController@index
- `PATCH /profile` → ProfileController@update

### Components

#### 4. UserMenu (`resources/js/Components/UserMenu.tsx`)
Update logout handler.

**Changes:**
- Logout: Tạm thời show alert (TODO: implement later)
- Profile link: Đã hoạt động, chuyển đến `/profile`

## Cách sử dụng

### Truy cập Profile
1. Click vào avatar/user menu ở góc phải trên
2. Click "Profile"
3. Sẽ chuyển đến trang `/profile`

### Navigation
- Profile page có cùng layout với các trang khác
- Sidebar và header vẫn hiển thị
- Active state không highlight (vì Profile không có trong sidebar menu)

## Testing

### Manual Testing
1. Mở http://127.0.0.1:8000/dashboard
2. Click vào user menu (avatar)
3. Click "Profile"
4. Verify trang profile load thành công
5. Verify layout giống các trang khác

### Route Testing
```bash
php artisan route:list --name=profile
```

Expected output:
```
GET|HEAD    profile ......... profile › ProfileController@index
PATCH       profile . profile.update › ProfileController@update
```

## TODO

### Profile Features
- [ ] Profile information form
  - [ ] Name input
  - [ ] Email input (readonly or with verification)
  - [ ] Phone number
  - [ ] Bio/Description
- [ ] Avatar upload
  - [ ] Image preview
  - [ ] Crop functionality
  - [ ] Upload to storage
- [ ] Change password form
  - [ ] Current password
  - [ ] New password
  - [ ] Confirm password
- [ ] Account settings
  - [ ] Email notifications
  - [ ] Theme preference
  - [ ] Language preference

### Logout Feature
- [ ] Implement logout functionality
- [ ] Clear session
- [ ] Redirect to login page
- [ ] Show success message

## Notes

- Profile page hiện tại chỉ là skeleton
- Logout tạm thời show alert, sẽ implement sau
- Cần tích hợp với authentication system khi có
- Avatar hiện tại dùng initials, có thể upload ảnh sau
