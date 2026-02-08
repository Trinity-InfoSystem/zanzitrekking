import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import Loader from "../../layout/Loader";

const ProtectRoute = ({ children }) => {
  const { userInfo, loader, isInitialized } = useSelector((state) => state.auth);
  const location = useLocation();

  // Show loader while checking authentication or before initialization
  if (loader || !isInitialized) {
    return <Loader />;
  }

  // Only redirect to login if we've initialized and there's no userInfo
  // This prevents redirecting before the API call completes
  if (!userInfo) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectRoute;
