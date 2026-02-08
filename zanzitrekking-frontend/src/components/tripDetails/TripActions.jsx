import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import BookingModal from "./BookingModal";

const TripActions = ({
  userInfo,
  isInWishlist,
  isInCart,
  handleAddToWishlist,
  handleAddToCart,
  trip,
}) => {
  const navigate = useNavigate();
  const [isWishlistAnimating, setIsWishlistAnimating] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleWishlistClick = () => {
    setIsWishlistAnimating(true);
    handleAddToWishlist();
    setTimeout(() => setIsWishlistAnimating(false), 600);
  };

  const handleCartClick = () => {
    setIsCartAnimating(true);
    handleAddToCart();
    setTimeout(() => setIsCartAnimating(false), 600);
  };

  const handleBookNow = () => {
    if (!userInfo) {
      toast.error("Please login to book this trip");
      return;
    }
    setShowBookingModal(true);
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
  };

  // Calculate price display
  const getDisplayPrice = () => {
    let price = null;

    // Handle new category-specific pricing structure
    if (trip?.regularPrices?.standard?.onePerson) {
      price = trip.regularPrices.standard.onePerson;
    } else if (trip?.regularPrices?.onePerson) {
      // Fallback for old structure
      price = trip.regularPrices.onePerson;
    }

    if (!price) {return null;}

    const discountedPrice = trip.discount
      ? price - (price * trip.discount) / 100
      : price;

    return {
      original: price,
      final: Math.round(discountedPrice),
      savings: Math.round(price - discountedPrice),
    };
  };

  const priceInfo = getDisplayPrice();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .safari-actions {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .action-button {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .action-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .action-button:active {
          transform: translateY(0);
        }
        
        .wishlist-heart {
          transition: all 0.3s ease;
        }
        
        .wishlist-heart.active {
          animation: heartBeat 0.6s ease;
        }
        
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.2); }
          50% { transform: scale(1.05); }
        }
        
        .cart-icon {
          transition: all 0.3s ease;
        }
        
        .cart-icon.active {
          animation: cartShake 0.6s ease;
        }
        
        @keyframes cartShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-2px); }
        }
        
        .book-button {
          background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .book-button:hover {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          box-shadow: 0 6px 20px rgba(30, 41, 59, 0.25);
          transform: translateY(-1px);
        }
        
        .book-button:active {
          transform: translateY(0);
        }
        
        .price-badge {
          animation: fadeIn 0.4s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(3px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Desktop Actions - Horizontal Layout */}
      <div className="safari-actions hidden items-center gap-3 lg:flex">
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`action-button group flex h-11 w-11 items-center justify-center rounded-lg border shadow-sm ${
            isInWishlist
              ? "border-rose-200 bg-rose-50 text-rose-600"
              : "border-neutral-200 bg-white text-neutral-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          }`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`wishlist-heart h-5 w-5 ${
              isInWishlist ? "fill-current" : ""
            } ${isWishlistAnimating ? "active" : ""}`}
          />
        </button>

        {/* Cart Button */}
        <button
          onClick={handleCartClick}
          className={`action-button group relative flex h-11 w-11 items-center justify-center rounded-lg border shadow-sm ${
            isInCart
              ? "border-indigo-200 bg-indigo-50 text-indigo-600"
              : "border-neutral-200 bg-white text-neutral-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          }`}
          aria-label={isInCart ? "Remove from cart" : "Add to cart"}
        >
          <ShoppingCart
            className={`cart-icon h-5 w-5 ${isCartAnimating ? "active" : ""}`}
          />
          {isInCart && (
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 shadow-sm">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          )}
        </button>

        {/* Book Now Button with Price */}
        <button
          onClick={handleBookNow}
          className="book-button group flex items-center gap-4 rounded-lg px-6 py-3 font-semibold text-white shadow-md"
        >
          {/* Price info */}
          {priceInfo && (
            <div className="price-badge flex items-center gap-2.5 border-r border-white/20 pr-4">
              <div className="text-left">
                <div className="flex items-center gap-1 text-xs font-medium opacity-90">
                  <Calendar className="h-3 w-3" />
                  <span>From</span>
                </div>
                <div className="text-lg font-bold">
                  ${priceInfo.final.toLocaleString()}
                </div>
              </div>
              {trip.discount > 0 && (
                <div className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 shadow-sm">
                  <Sparkles className="h-3 w-3 text-white" />
                  <span className="text-xs font-semibold text-white">
                    -{trip.discount}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Book now text */}
          <span className="flex items-center gap-2 text-sm">
            Book Your Adventure
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </button>
      </div>

      {/* Mobile Actions - Single Row Compact Layout */}
      <div className="safari-actions flex w-full items-center gap-2 lg:hidden">
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`action-button flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border shadow-sm ${
            isInWishlist
              ? "border-rose-200 bg-rose-50 text-rose-600"
              : "border-neutral-200 bg-white text-neutral-600"
          }`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`wishlist-heart h-4 w-4 ${isInWishlist ? "fill-current" : ""} ${isWishlistAnimating ? "active" : ""}`}
          />
        </button>

        {/* Cart Button */}
        <button
          onClick={handleCartClick}
          className={`action-button relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border shadow-sm ${
            isInCart
              ? "border-indigo-200 bg-indigo-50 text-indigo-600"
              : "border-neutral-200 bg-white text-neutral-600"
          }`}
          aria-label={isInCart ? "Remove from cart" : "Add to cart"}
        >
          <ShoppingCart
            className={`cart-icon h-4 w-4 ${isCartAnimating ? "active" : ""}`}
          />
          {isInCart && (
            <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 shadow-sm">
              <CheckCircle className="h-2.5 w-2.5 text-white" />
            </div>
          )}
        </button>

        {/* Book Now Button - Takes remaining space */}
        <button
          onClick={handleBookNow}
          className="book-button group flex flex-1 items-center justify-between gap-2 rounded-lg px-4 py-2.5 text-white shadow-md"
        >
          {priceInfo && (
            <div className="price-badge flex items-center gap-2">
              <div className="text-left">
                <div className="flex items-center gap-1 text-[10px] font-medium opacity-90">
                  <Calendar className="h-2.5 w-2.5" />
                  <span>From</span>
                </div>
                <div className="text-base font-bold">
                  ${priceInfo.final.toLocaleString()}
                </div>
              </div>
              {trip.discount > 0 && (
                <div className="flex items-center gap-0.5 rounded-md bg-emerald-600 px-1.5 py-0.5 shadow-sm">
                  <Sparkles className="h-2.5 w-2.5 text-white" />
                  <span className="text-[10px] font-semibold text-white">
                    -{trip.discount}%
                  </span>
                </div>
              )}
            </div>
          )}

          <span className="flex items-center gap-1 text-xs font-semibold">
            Book
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={handleCloseModal}
        trip={trip}
      />
    </>
  );
};

export default TripActions;
