"use client";

import { FaList, FaSearch } from "react-icons/fa";
import { useSelector } from "react-redux";
import { IMAGES_URL } from "../utils/constants";

const Header = ({ setShowSidebar }) => {
  const { userInfo } = useSelector((state) => state.auth);

  let imageName = userInfo?.image
    ? userInfo?.image.startsWith("https://ui-avatars.com")
      ? userInfo?.image
      : IMAGES_URL + userInfo?.image.split("/").pop()
    : "/images/admin.png";

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-primary-900/20 bg-gradient-to-r from-primary via-primary-600 to-primary-700 shadow-lg backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between px-6 md:px-5 lg:ml-56">
        {/* Menu Button */}
        <button
          onClick={() => setShowSidebar((prev) => !prev)}
          className="group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-secondary-50 hover:text-secondary focus:outline-none lg:hidden"
        >
          <FaList className="h-5 w-5 transition-transform group-hover:scale-110" />
        </button>

        {/* Mobile Logo */}
        <div className="lg:hidden">
          <div className="relative">
            <img
              src="/images/newZanzi.jpg"
              alt="Zanzi Logo"
              className="h-12 w-12 rounded-xl object-cover shadow-lg ring-2 ring-white/50"
            />
          </div>
        </div>

        {/* Desktop Content */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between lg:space-x-8">
          {/* Company Name */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <h1 className="bg-gradient-to-r from-white to-sunshine-100 bg-clip-text text-2xl font-bold text-transparent">
                Zanzi Trekking And Safaris
              </h1>
              <div className="absolute -bottom-1 left-0 h-1 w-24 rounded-full bg-gradient-to-r from-secondary to-sunshine-400 shadow-lg" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl flex-1 px-8">
            <div className="group relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <FaSearch className="h-4 w-4 text-secondary transition-colors group-focus-within:text-sunshine-400" />
              </div>
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full rounded-xl border-2 border-transparent bg-white py-3 pl-12 pr-4 text-sm text-gray-800 transition-all placeholder:text-gray-400 focus:border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-200"
              />
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-4">
          {/* User Info Desktop */}
          <div className="hidden text-right lg:block">
            <div className="text-sm font-bold text-white">{userInfo?.name}</div>
            <div className="text-xs font-medium text-sunshine-100">
              {userInfo?.role}
            </div>
          </div>

          {/* Profile Image */}
          <div className="group relative">
            <div className="relative">
              {userInfo?.image ? (
                <img
                  className="h-12 w-12 rounded-xl object-cover shadow-lg ring-2 ring-white/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:ring-white/50"
                  src={imageName}
                  alt="User profile"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-lg font-bold text-primary-700 shadow-lg ring-2 ring-white/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:ring-white/50">
                  {userInfo?.name?.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Online Status */}
              <div className="shadow-sunshine-medium absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-primary-700 bg-sunshine-400">
                <div className="h-full w-full animate-pulse rounded-full bg-sunshine-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
