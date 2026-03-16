import { useEffect } from "react";
import Router from "./router/Router";
import publicRoutes from "./router/routes/publicRoutes";
import { getRoutes } from "./router/routes";
import { useDispatch } from "react-redux";
import { get_user_info, admin_logout } from "./store/Reducers/authReducer";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check authentication on app load
    // This will verify the session and update userInfo if needed
    dispatch(get_user_info());
  }, [dispatch]);

  useEffect(() => {
    // Listen for logout events from other tabs
    const handleStorageChange = (e) => {
      if (e.key === "logoutTimestamp") {
        // Logout was triggered in another tab — ensure backend cookies are cleared
        dispatch(admin_logout());
        // Redirect to login if not already there
        if (
          window.location.pathname !== "/admin/login" &&
          !window.location.pathname.startsWith("/admin/login")
        ) {
          window.location.href = "/admin/login";
        }
      }
    };

    // Listen for storage events (cross-tab communication)
    // Note: storage event only fires in OTHER tabs, not the current tab
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  return <Router allRoutes={[...publicRoutes, getRoutes()]} />;
}

export default App;
