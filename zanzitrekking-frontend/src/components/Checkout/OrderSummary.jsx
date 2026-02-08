// components/checkout/OrderSummary.jsx
"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { IMAGES_URL } from "../../utils/constants";

const OrderSummary = ({ cart_trips, subtotal, serviceFee, total }) => {
  const [topOffset, setTopOffset] = useState(72);

  useEffect(() => {
    const calculateTopOffset = () => {
      // Find the header element
      const header = document.querySelector("header");
      if (!header) {
        // Fallback values if header not found
        const isLarge = window.innerWidth >= 1024;
        const isMedium = window.innerWidth >= 768;
        setTopOffset(isLarge ? 80 : isMedium ? 80 : 72);
        return;
      }

      // Get the actual height of the header
      const headerHeight = header.offsetHeight;
      
      // Add spacing (16px)
      const spacing = 16;
      setTopOffset(headerHeight + spacing);
    };

    // Calculate on mount and resize
    calculateTopOffset();
    
    // Recalculate on scroll (in case header height changes)
    const handleScroll = () => {
      calculateTopOffset();
    };
    
    const handleResize = () => {
      calculateTopOffset();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    
    // Use ResizeObserver to watch for header height changes
    const header = document.querySelector("header");
    if (header) {
      const resizeObserver = new ResizeObserver(() => {
        calculateTopOffset();
      });
      resizeObserver.observe(header);
      
      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleResize);
        resizeObserver.disconnect();
      };
    }
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div 
      className="sticky overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-xl transition-all duration-300"
      style={{ top: `${topOffset}px` }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
        <h2 className="text-xl font-bold text-white">
          {cart_trips.length === 1 ? "Your Trip" : "Your Trips"}
        </h2>
        <p className="mt-1 text-sm text-emerald-50">
          {cart_trips.length} {cart_trips.length === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Trip List */}
      <div className="max-h-96 space-y-4 overflow-y-auto p-6">
        {cart_trips.map((trip) => (
          <div key={trip._id} className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg shadow-md">
              <img
                src={
                  trip.mainImage
                    ? IMAGES_URL + trip.mainImage.split("/").pop()
                    : "/placeholder.svg"
                }
                alt={trip.mainTitle}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 leading-tight">
                {trip.mainTitle}
              </h3>
              <p className="mt-1.5 text-xs font-medium text-gray-600">
                {new Date(trip.startingDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-base font-extrabold text-emerald-600">
              ${trip.price?.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Price Summary */}
      <div className="border-t-2 border-gray-100 bg-gray-50 p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Subtotal</span>
            <span className="text-sm font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Service Fee</span>
            <span className="text-sm font-semibold text-gray-900">${serviceFee.toFixed(2)}</span>
          </div>
          <div className="border-t-2 border-dashed border-gray-200 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-emerald-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="border-t border-gray-100 bg-white px-6 py-4">
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-600">
          <Lock className="h-4 w-4 text-emerald-600" />
          <span>Secure SSL encrypted payment</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
