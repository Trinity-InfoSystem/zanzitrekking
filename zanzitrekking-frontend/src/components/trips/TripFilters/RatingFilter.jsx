import { Star, X } from "lucide-react";
import { useState } from "react";

const RatingFilter = ({ rating, setRating }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
          <Star className="h-4 w-4 text-amber-700" />
        </div>
        <h3 className="text-base font-bold text-neutral-900">Minimum Rating</h3>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="transition-all hover:scale-110 active:scale-95"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            >
              <Star
                className={`h-6 w-6 transition-all ${
                  star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                    : "fill-neutral-200 text-neutral-200"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="mt-3 text-center">
          <span className="text-sm font-bold text-neutral-900">
            {hoverRating > 0 ? hoverRating : rating || 0} of 5 stars
          </span>
        </div>

        {rating > 0 && (
          <button
            type="button"
            onClick={() => setRating(0)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:shadow active:scale-[0.98]"
          >
            <X className="h-4 w-4" />
            Clear Rating
          </button>
        )}
      </div>
    </div>
  );
};

export default RatingFilter;
