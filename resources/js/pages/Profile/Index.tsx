import MainLayout from '@/Layouts/MainLayout';

export default function Profile() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="mt-1 text-sm text-gray-400">Quản lý thông tin cá nhân</p>
        </div>
        {/* TODO: Profile form */}
        {/* TODO: Avatar upload */}
        {/* TODO: Change password */}
        {/* TODO: Account settings */}
      </div>
    </MainLayout>
  );
}
