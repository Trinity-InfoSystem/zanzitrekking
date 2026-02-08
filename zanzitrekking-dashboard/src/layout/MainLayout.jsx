"use client";

import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useState } from "react";

const MainLayout = () => {
  const [showSideBar, setShowSidebar] = useState(false);

  return (
    <div className="min-h-screen w-full">
      <Header showSideBar={showSideBar} setShowSidebar={setShowSidebar} />
      <Sidebar showSideBar={showSideBar} setShowSidebar={setShowSidebar} />
      <div className="ml-0 pt-20 transition-all duration-500 ease-out lg:ml-56">
        <div className="min-h-[calc(100vh-5rem)]">
          <div className="relative overflow-hidden">
            <div className="relative">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
