"use client";

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import TopBar from "./Header/TopBar";
import MainHeader from "./Header/MainHeader";
import SearchBar from "./Header/SearchBar";
import MobileSidebar from "./Header/MobileSidebar";

const Header = () => {
  const navigate = useNavigate();
  const { categories } = useSelector((state) => state.home);
  const { userInfo } = useSelector((state) => state.auth);
  const { cart_trip_count, wishlist_count } = useSelector(
    (state) => state.card,
  );

  const { pathname } = useLocation();

  const [showSidebar, setShowSidebar] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [category, setCategory] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const headerRef = useRef(null);
  const [searchTopOffset, setSearchTopOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const threshold = 50; // Show topbar when within 50px from top
      const scrollThreshold = 10; // Minimum scroll distance to trigger show/hide

      // Always show topbar when near the top of the screen
      if (currentScrollY < threshold) {
        setShowTopBar(true);
        setIsScrolled(false);
      } else {
        // Detect scroll direction
        const scrollDifference = currentScrollY - lastScrollY;

        if (Math.abs(scrollDifference) > scrollThreshold) {
          if (scrollDifference > 0) {
            // Scrolling down - hide topbar
            setShowTopBar(false);
            setIsScrolled(true);
            setShowSearchBar(false);
          } else {
            // Scrolling up - show topbar
            setShowTopBar(true);
            setIsScrolled(true);
            setShowSearchBar(false);
          }
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Keep SearchBar glued to the bottom of the header (no gap when scrolled)
  useEffect(() => {
    const update = () => {
      if (!headerRef.current) {return;}
      const rect = headerRef.current.getBoundingClientRect();
      setSearchTopOffset(Math.round(rect.bottom));
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [showTopBar, isScrolled, showSearchBar]);

  const search = () => {
    if (searchValue.trim()) {
      const params = new URLSearchParams();
      if (category) {
        params.set("category", category);
      }
      params.set("search", searchValue.trim());
      navigate(`/trips?${params.toString()}`);
      setShowSearchBar(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      search();
    }
  };

  const redirect_card_page = () => {
    if (userInfo) {
      navigate("/cart");
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSidebar && !event.target.closest(".sidebar-content")) {
        setShowSidebar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSidebar]);

  return (
    <header className="w-full">
      <TopBar userInfo={userInfo} showTopBar={showTopBar} />
      <div className={`mb-[62px] xs:mb-[76px] sm:mb-[77px] md:mb-[84px] tablet:mb-[88px] lg:mb-[100px] ${showSearchBar ? "mb-[140px] xs:mb-[145px] sm:mb-[150px] md:mb-[155px] tablet:mb-[160px] lg:mb-[170px]" : ""}`}>
        <MainHeader
          containerRef={headerRef}
          isScrolled={isScrolled}
          showTopBar={showTopBar}
          pathname={pathname}
          userInfo={userInfo}
          wishlist_count={wishlist_count}
          cart_trip_count={cart_trip_count}
          setShowSidebar={setShowSidebar}
          setShowSearchBar={setShowSearchBar}
          redirect_card_page={redirect_card_page}
        />
      </div>
      <SearchBar
        showSearchBar={showSearchBar}
        setShowSearchBar={setShowSearchBar}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        category={category}
        setCategory={setCategory}
        categories={categories}
        search={search}
        handleKeyDown={handleKeyDown}
        topOffset={searchTopOffset}
      />

      <MobileSidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        userInfo={userInfo}
        pathname={pathname}
        wishlist_count={wishlist_count}
        cart_trip_count={cart_trip_count}
        redirect_card_page={redirect_card_page}
      />
    </header>
  );
};

export default Header;
