import React from 'react';

const TestTailwind: React.FC = () => {
  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold mb-4">✅ Tailwind CSS 작동 확인</h1>
        <p className="text-gray-100 mb-4">
          Tailwind CSS가 정상적으로 작동하고 있습니다!
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100 transition-colors">
            버튼 1
          </button>
          <button className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700 transition-colors">
            버튼 2
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-red-100 text-red-800 p-4 rounded">Red</div>
        <div className="bg-green-100 text-green-800 p-4 rounded">Green</div>
        <div className="bg-blue-100 text-blue-800 p-4 rounded">Blue</div>
      </div>
    </div>
  );
};

export default TestTailwind;