import { useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useState } from "react";
import Stripe from "../components/Stripe";

const Payment = () => {
  const {
    state: { price, items, orderId },
  } = useLocation();
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  return (
    <div>
      <Header />
      <section className="bg-[#eeeeee]">
        <div className="mx-auto mt-4 w-[85%] py-16 sm:w-[90%] md:w-[90%] lg:w-[90%]">
          <div className="flex flex-wrap md:flex-col-reverse">
            <div className="w-7/12 md:w-full">
              <div className="pr-2 md:pr-0">
                <div className="flex flex-wrap">
                  <div
                    onClick={() => setPaymentMethod("stripe")}
                    className={`w-[20%] cursor-pointer border-r px-12 py-8 ${paymentMethod === "stripe" ? "bg-white" : "bg-slate-200"}`}
                  >
                    <div className="flex flex-col items-center justify-center gap-[3px]">
                      <img src="/images/payment/stripe.png" alt="" />
                    </div>
                    <span className="text-slate-600">Stripe</span>
                  </div>
                  <div
                    onClick={() => setPaymentMethod("cod")}
                    className={`w-[20%] cursor-pointer border-r px-12 py-8 ${paymentMethod === "cod" ? "bg-white" : "bg-slate-100"}`}
                  >
                    <div className="flex flex-col items-center justify-center gap-[3px]">
                      <img src="/images/payment/cod.jpg" alt="" />
                    </div>
                    <span className="text-slate-600">COD</span>
                  </div>
                </div>
                {paymentMethod === "stripe" && (
                  <div>
                    <Stripe />
                  </div>
                )}
                {paymentMethod === "cod" && (
                  <div className="w-full bg-white px-4 py-8 shadow-sm">
                    <button className="rounded-sm bg-[#059473] px-10 py-[6px] text-white hover:shadow-md hover:shadow-green-500/20">
                      Pay Now
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="w-5/12 md:w-full">
              <div className="pl-2 md:mb-0 md:pl-0">
                <div className="flex flex-col gap-3 bg-white p-5 text-slate-600 shadow">
                  <h2 className="text-lg font-bold">Order Summary </h2>
                  <div className="flex items-center justify-between">
                    <span>{items} Items and Shipping Fee Included </span>
                    <span>${price} </span>
                  </div>
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total Amount </span>
                    <span className="text-lg text-green-600">${price}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Payment;
