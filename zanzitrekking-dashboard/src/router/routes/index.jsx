import React, { Suspense } from "react";
import Loader from "../../layout/Loader";
import MainLayout from "../../layout/MainLayout";
import adminRoutes from "./adminRoute";

import ProtectRoute from "./ProtectRoute";

export const getRoutes = () => ({
  path: "/",
  element: <MainLayout />,
  children: adminRoutes.map((route) => ({
    ...route,
    element: (
      <Suspense fallback={<Loader />}>
        <ProtectRoute>{route.element}</ProtectRoute>
      </Suspense>
    ),
  })),
});
