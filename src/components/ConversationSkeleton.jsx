// components/ConversationSkeleton.jsx
const ConversationSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      <div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 border-b border-gray-50 last:border-b-0 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationSkeleton;