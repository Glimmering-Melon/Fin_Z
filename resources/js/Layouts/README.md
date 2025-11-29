# Dashboard Layout & Sidebar

## Components đã tạo

### 1. MainLayout (`resources/js/Layouts/MainLayout.tsx`)
Layout chính của ứng dụng với sidebar và header.

**Features:**
- Responsive design (mobile, tablet, desktop)
- Sidebar toggle cho mobile
- Header với user menu
- Tự động đóng sidebar khi click outside (mobile)

**Cách sử dụng:**
```tsx
import MainLayout from '@/Layouts/MainLayout';

export default function YourPage() {
  return (
    <MainLayout>
      <div>Your content here</div>
    </MainLayout>
  );
}
```

### 2. Sidebar (`resources/js/Components/Sidebar.tsx`)
Navigation menu với các trang chính.

**Features:**
- 6 menu items: Dashboard, Chart, Heatmap, News, Simulator, Settings
- Active state highlighting
- Responsive (slide-in trên mobile)
- Icons cho mỗi menu item
- Backdrop overlay cho mobile

**Navigation items:**
- Dashboard (`/dashboard`) - Tổng quan thị trường
- Chart (`/chart`) - Biểu đồ chi tiết
- Heatmap (`/heatmap`) - Bản đồ nhiệt
- News (`/news`) - Tin tức
- Simulator (`/simulator`) - Mô phỏng giao dịch
- Settings (`/settings`) - Cài đặt

### 3. UserMenu (`resources/js/Components/UserMenu.tsx`)
Dropdown menu cho user.

**Features:**
- Avatar với initials hoặc ảnh
- User info (name, email)
- Profile link
- Settings link
- Logout button
- Click outside để đóng
- Responsive design

## Responsive Breakpoints

- **Mobile**: < 1024px - Sidebar ẩn, hiện menu button
- **Desktop**: >= 1024px - Sidebar luôn hiển thị

## Styling

Sử dụng Tailwind CSS với:
- Color scheme: Blue (primary), Gray (neutral)
- Shadows và borders cho depth
- Smooth transitions
- Hover states

## Ví dụ

Xem `resources/js/pages/Dashboard/index.tsx` để biết cách sử dụng MainLayout.
