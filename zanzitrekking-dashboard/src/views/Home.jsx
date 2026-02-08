import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "../layout/Loader";

const Home = () => {
  const { userInfo, loader, isInitialized } = useSelector((state) => state.auth);

  // Show loader while checking authentication or before initialization
  // This prevents premature redirects before the API call completes
  if (loader || !isInitialized) {
    return <Loader />;
  }

  // Only redirect after we've initialized and know the auth state
  if (userInfo) {
    return <Navigate to="/admin/dashboard" replace />;
  } else {
    return <Navigate to="/admin/login" replace />;
  }
};

export default Home;
