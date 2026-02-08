import { useEffect, useState } from "react";
import { Clock, Star } from "lucide-react";

const ReviewTimer = ({
  tripStartDate,
  tripDuration,
  orderId,
  tripId,
  tripTitle,
  tripImage,
  onOpenReviewModal,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(null);

  const handleReviewClick = () => {
    onOpenReviewModal(orderId, tripId._id, tripTitle, tripImage);
  };

  useEffect(() => {
    if (!tripStartDate || !tripDuration) {return;}

    const calculateTimeRemaining = () => {
      const startDate = new Date(tripStartDate);
      const tripEndDate = new Date(startDate);
      tripEndDate.setDate(tripEndDate.getDate() + (tripDuration - 1));

      const now = new Date();
      const timeDiff = tripEndDate.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setTimeRemaining(null);
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [tripStartDate, tripDuration]);

  // If trip has ended (no time remaining), show review button
  if (!timeRemaining) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-success-100 px-2.5 py-1 text-xs font-semibold text-success-700">
          <Star className="h-3 w-3 fill-success-700" />
          <span>Can Review</span>
        </div>
        <button
          onClick={handleReviewClick}
          className="rounded-md px-2 py-1 text-xs font-semibold text-success-600 transition-colors hover:bg-success-50 hover:text-success-700"
        >
          Write Review
        </button>
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeRemaining;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-info-100 px-2.5 py-1 text-xs font-semibold text-info-700">
        <Clock className="h-3 w-3" />
        <span>Review in:</span>
      </div>
      <div className="flex items-center gap-1 text-xs font-medium text-text">
        {days > 0 && <span className="text-primary-700">{days}d</span>}
        {hours > 0 && <span className="text-primary-700">{hours}h</span>}
        <span className="text-primary-700">{minutes}m</span>
        <span className="text-primary-700">{seconds}s</span>
      </div>
    </div>
  );
};

export default ReviewTimer;
