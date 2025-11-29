# Test Login Flow

## Bước 1: Kiểm tra servers đang chạy

### Terminal 1: Laravel Server
```bash
php artisan serve
```

Bạn sẽ thấy:
```
INFO  Server running on [http://127.0.0.1:8000].
```

### Terminal 2: Vite Dev Server
```bash
npm run dev
```

Bạn sẽ thấy:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Bước 2: Clear cache

```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

## Bước 3: Test authentication setup

```bash
php test-auth.php
```

Kết quả mong đợi:
```
✅ Admin user exists: admin@stockdashboard.com
✅ Admin password is correct
✅ Demo user exists: demo@stockdashboard.com
✅ Demo password is correct
✅ Sessions table exists
```

## Bước 4: Truy cập ứng dụng

1. Mở browser (Chrome hoặc Firefox)
2. Truy cập: `http://localhost:8000`
3. Bạn sẽ được redirect về `/login`

## Bước 5: Login

### Thử với Admin account:
```
Email: admin@stockdashboard.com
Password: Admin@123
```

### Hoặc Demo account:
```
Email: demo@stockdashboard.com
Password: Demo@123
```

## Bước 6: Kiểm tra kết quả

### Nếu thành công:
- Bạn sẽ thấy Dashboard page
- URL: `http://localhost:8000/`
- Sidebar hiển thị navigation menu
- Market Overview widget hiển thị (có thể empty nếu chưa có stock data)

### Nếu thất bại:

#### Scenario 1: Redirect về login page
**Nguyên nhân**: Session không được lưu

**Giải pháp**:
```bash
# Check session driver
php artisan tinker
>>> config('session.driver')
# Phải là 'database'

# Clear cache
php artisan config:clear

# Restart servers
# Ctrl+C để stop
php artisan serve  # Terminal 1
npm run dev        # Terminal 2
```

#### Scenario 2: Blank page
**Nguyên nhân**: JavaScript error hoặc Vite không chạy

**Giải pháp**:
1. Mở F12 Developer Tools
2. Check Console tab có lỗi không
3. Check Network tab
4. Restart Vite: `npm run dev`

#### Scenario 3: "CSRF token mismatch"
**Nguyên nhân**: Token expired

**Giải pháp**:
1. Clear browser cache (Ctrl+Shift+R)
2. Clear Laravel cache: `php artisan config:clear`
3. Thử lại

#### Scenario 4: "The provided credentials do not match"
**Nguyên nhân**: Sai email hoặc password

**Giải pháp**:
```bash
# Verify user exists
php artisan tinker
>>> User::where('email', 'admin@stockdashboard.com')->first()

# Check password
>>> Hash::check('Admin@123', User::where('email', 'admin@stockdashboard.com')->first()->password)
# Phải return true
```

## Bước 7: Test các tính năng

### 7.1 Navigation
- Click vào các menu items (Chart, Heatmap, News, etc.)
- Kiểm tra active state highlighting
- Test mobile menu (resize browser < 768px)

### 7.2 Dashboard widgets
- Market Overview: Xem 3 indices
- Top Stocks: Switch giữa Gainers/Losers
- Search: Tìm stocks
- Watchlist: Add/remove stocks

### 7.3 Logout
- Click user menu (desktop) hoặc trong sidebar (mobile)
- Click Logout
- Verify redirect về login page

## Debug Tips

### 1. Check browser console (F12)
```javascript
// Xem có lỗi JavaScript không
// Check Network tab
// Xem request/response
```

### 2. Check Laravel logs
```bash
tail -f storage/logs/laravel.log
```

### 3. Check session
```bash
php artisan tinker
>>> DB::table('sessions')->count()
>>> DB::table('sessions')->latest()->first()
```

### 4. Test API endpoints
```bash
# Market overview
curl http://localhost:8000/api/market/overview

# Search
curl "http://localhost:8000/api/search?q=VNM"
```

## Expected Behavior

### Login Flow:
1. User visits `/` → Redirect to `/login` (guest middleware)
2. User enters credentials → POST `/login`
3. If valid → Session created → Redirect to `/` (dashboard)
4. If invalid → Stay on `/login` with error message

### Dashboard Access:
1. User visits `/` → Check auth middleware
2. If authenticated → Show Dashboard
3. If not authenticated → Redirect to `/login`

### Logout Flow:
1. User clicks Logout → POST `/logout`
2. Session destroyed → Redirect to `/login`
3. User cannot access `/` anymore (must login again)

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Redirect loop | Clear cache, restart servers |
| Blank page | Check Vite is running, check console |
| CSRF error | Hard refresh browser (Ctrl+Shift+R) |
| 404 error | Check route:list, clear route cache |
| 500 error | Check Laravel logs |
| Session not persisting | Check SESSION_DRIVER=database |

## Success Criteria

✅ Can access login page
✅ Can login with test accounts
✅ Redirected to dashboard after login
✅ Can see user info in sidebar
✅ Can navigate between pages
✅ Can logout successfully
✅ Cannot access dashboard when logged out

## Next Steps After Successful Login

1. Add stock data: `php artisan db:seed --class=StockSeeder`
2. Test watchlist functionality
3. Test search functionality
4. Test auto-refresh (wait 30s)
5. Test responsive design (resize browser)
6. Test on different browsers (Chrome, Firefox, Edge)

## Need Help?

Xem: [docs/TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
