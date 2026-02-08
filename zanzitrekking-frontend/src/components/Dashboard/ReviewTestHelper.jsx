import { useState } from "react";
import { CheckCircle, Clock, Star } from "lucide-react";

const ReviewTestHelper = () => {
  const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0]);
  const [testDuration, setTestDuration] = useState(3);

  const calculateTripEndDate = (startDate, duration) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + (duration - 1));
    return end;
  };

  const tripEndDate = calculateTripEndDate(testDate, testDuration);
  const now = new Date();
  const timeDiff = tripEndDate.getTime() - now.getTime();
  const canReview = timeDiff <= 0;

  const formatTimeRemaining = () => {
    if (canReview) {return "Can review now!";}
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
        <Star className="h-5 w-5" />
        Review System Test Helper
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">
            Trip Start Date
          </label>
          <input
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            className="w-full border border-blue-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">
            Trip Duration (days)
          </label>
          <select
            value={testDuration}
            onChange={(e) => setTestDuration(parseInt(e.target.value))}
            className="w-full border border-blue-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>1 day</option>
            <option value={2}>2 days</option>
            <option value={3}>3 days</option>
            <option value={5}>5 days</option>
            <option value={7}>7 days</option>
            <option value={10}>10 days</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">
            Trip End Date
          </label>
          <div className="px-3 py-2 text-sm bg-white border border-blue-300 rounded">
            {tripEndDate.toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {canReview ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-700 font-medium">Review Available</span>
            </>
          ) : (
            <>
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-blue-700 font-medium">Review in: {formatTimeRemaining()}</span>
            </>
          )}
        </div>
        
        <div className="text-xs text-blue-600">
          Current time: {now.toLocaleString()}
        </div>
      </div>
      
      <div className="mt-3 text-xs text-blue-600">
        <p><strong>For Testing:</strong> Set a past date to enable reviews immediately, or set a future date to see the countdown timer.</p>
      </div>
    </div>
  );
};

export default ReviewTestHelper;
