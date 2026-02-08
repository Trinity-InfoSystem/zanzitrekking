import { lazy } from "react";
const ForgotPassword = lazy(() => import("../../views/auth/ForgotPassword"));
const VerifyOtp = lazy(() => import("../../views/auth/VerifyOtp"));
const ResetPassword = lazy(() => import("../../views/auth/ResetPassword"));
const Home = lazy(() => import("../../views/Home"));
const AdminLogin = lazy(() => import("../../views/auth/AdminLogin"));

const publicRoutes = [
  {
    path: "/",
    element: <Home />,
    ability: ["admin"],
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/verify-otp",
    element: <VerifyOtp />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
];

export default publicRoutes;
