import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/index.js";
import Loader from "./layout/Loader";
const App = lazy(() => import("./App.jsx"));
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <Toaster
      toastOptions={{
        position: "top-right",
        style: {
          backgroundColor: "#283046",
          color: "white",
        },
      }}
    />
    <Provider store={store}>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-black">
            <Loader />
          </div>
        }
      >
        <App />
      </Suspense>
    </Provider>
  </BrowserRouter>,
);
