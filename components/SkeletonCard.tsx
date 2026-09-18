export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
        <div className="space-y-1.5">
          <div className="h-2.5 w-20 bg-gray-100 rounded-full" />
          <div className="h-2 w-16 bg-gray-100 rounded-full" />
        </div>
      </div>
      <div className="h-4 w-3/4 bg-gray-100 rounded-full mb-2" />
      <div className="h-3 w-full bg-gray-100 rounded-full mb-1" />
      <div className="h-3 w-2/3 bg-gray-100 rounded-full mb-5" />
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="h-4 w-16 bg-gray-100 rounded-full" />
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}
