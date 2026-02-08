import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./store/index.js";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";

// ✅ Add a proper loading component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-white">
    <div className="text-center">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
      <p className="text-base font-medium text-neutral-600">Loading...</p>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <Toaster
          toastOptions={{
            position: "top-right",
            style: {
              backgroundColor: "#283046",
              color: "white",
            },
            duration: 1200,
          }}
        />
        <Provider store={store}>
          <Suspense fallback={<PageLoader />}>
            <App />
          </Suspense>
        </Provider>
      </GoogleOAuthProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
