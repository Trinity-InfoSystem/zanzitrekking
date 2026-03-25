import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

/**
 * Must wait for hydrateAuth (/customer/me) to finish before deciding auth.
 * Otherwise on full page refresh userInfo is still null and we redirect to login.
 */
const ProtectUser = () => {
  const { userInfo, isInitialized } = useSelector((state) => state.auth);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="text-base font-medium text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (userInfo) {
    return <Outlet />;
  }
  return <Navigate to="/login" replace={true} />;
};

export default ProtectUser;
