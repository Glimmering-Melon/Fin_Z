import MainLayout from '@/Layouts/MainLayout';

export default function News() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">News Feed</h1>
          <p className="mt-1 text-sm text-gray-400">Tin tức và phân tích thị trường</p>
        </div>
        {/* TODO: News list with pagination */}
        {/* TODO: Sentiment badges (positive/negative/neutral) */}
        {/* TODO: Filter by sentiment */}
        {/* TODO: Filter by keyword */}
        {/* TODO: Filter by symbol */}
        {/* TODO: Filter by date */}
      </div>
    </MainLayout>
  );
}
