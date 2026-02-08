"use client";

import { ShoppingCartIcon } from "lucide-react";
import { Link } from "react-router-dom";

export const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center p-16">
      <div className="mb-6 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-lg">
        <ShoppingCartIcon className="h-16 w-16 text-emerald-500" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900">
        Your cart is empty
      </h3>
      <p className="mt-3 text-center text-gray-600 max-w-md">
        Looks like you haven't added any trips to your cart yet. Start exploring our amazing adventures!
      </p>
      <Link
        to="/trips"
        className="mt-8 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl"
      >
        Browse Trips
      </Link>
    </div>
  );
};