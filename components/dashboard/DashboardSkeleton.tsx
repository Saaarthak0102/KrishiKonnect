export default function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Farm Overview Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 w-48 rounded"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1 */}
            <div className="space-y-4">
              <div>
                <div className="h-4 bg-gray-200 w-32 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 w-40 rounded"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 w-28 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 w-52 rounded"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 w-24 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 w-36 rounded"></div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div>
                <div className="h-4 bg-gray-200 w-40 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 w-44 rounded"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 w-32 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 w-28 rounded"></div>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="h-4 bg-gray-200 w-36 rounded mb-3"></div>
                <div className="h-10 bg-gray-200 w-32 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-7 bg-gray-200 w-40 rounded"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="h-4 bg-gray-200 w-24 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 w-20 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 w-24 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 w-16 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 w-20 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 w-16 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 w-16 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 w-24 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Activity Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-7 bg-gray-200 w-44 rounded"></div>
            
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 w-36 rounded"></div>
                    <div className="h-4 bg-gray-200 w-40 rounded"></div>
                    <div className="h-4 bg-gray-200 w-44 rounded"></div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 w-40 rounded"></div>
                    <div className="h-4 bg-gray-200 w-48 rounded"></div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 w-32 rounded"></div>
                    <div className="h-4 bg-gray-200 w-52 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Starred Crops Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-7 bg-gray-200 w-40 rounded"></div>
            
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-6 bg-gray-200 w-24 rounded"></div>
                  <div className="h-5 bg-gray-200 w-16 rounded"></div>
                </div>
                <div className="h-7 bg-gray-200 w-36 rounded"></div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-6 bg-gray-200 w-24 rounded"></div>
                  <div className="h-5 bg-gray-200 w-16 rounded"></div>
                </div>
                <div className="h-7 bg-gray-200 w-36 rounded"></div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-6 bg-gray-200 w-24 rounded"></div>
                  <div className="h-5 bg-gray-200 w-16 rounded"></div>
                </div>
                <div className="h-7 bg-gray-200 w-36 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
