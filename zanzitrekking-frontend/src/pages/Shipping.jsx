import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { IoIosArrowForward } from "react-icons/io";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { place_order } from "../store/reducers/orderReducer";

const Shipping = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [res, setResponse] = useState(false);
  const {
    state: { products, price, items },
  } = location;
  const [state, setState] = useState({
    name: "",
    address: "",
    phone: "",
    post: "",
    province: "",
    city: "",
    area: "",
  });
  const inputHandle = (e) => {
    const { name, value } = e.target;
    setState((pre) => ({
      ...pre,
      [name]: value,
    }));
  };
  const submit = (e) => {
    e.preventDefault();
  };
  const placeOrder = () => {
    // dispatch(
    //   place_order({
    //     products,
    //     price,
    //     items,
    //     userId: userInfo.id,
    //     navigate,
    //   }),
    // );
  };
  return (
    <div>
      <Header />

      <section className='relative mt-6 h-[220px] bg-[url("/images/banner/shop.png")] bg-cover bg-left bg-no-repeat'>
        <div className="absolute left-0 top-0 h-full w-full bg-[#2422228a]">
          <div className="mx-auto h-full w-[85%] sm:w-[90%] md:w-[80%] lg:w-[90%]">
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-white">
              <h2 className="text-3xl font-bold">Shipping Page </h2>
              <div className="flex w-full items-center justify-center gap-2 text-2xl">
                <Link to="/">Home</Link>
                <span className="pt-1">
                  <IoIosArrowForward />
                </span>
                <span>Shipping </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#eeeeee]">
        <div className="mx-auto w-[85%] py-16 lg:w-[90%]">
          <div className="flex w-full flex-wrap">
            <div className="w-[67%] md-lg:w-full">
              <div className="flex flex-col gap-3">
                <div className="rounded-md bg-white p-6 shadow-sm">
                  <h2 className="pb-3 font-bold text-slate-600">
                    Shipping Information
                  </h2>
                  {!res && (
                    <>
                      <form onSubmit={submit}>
                        <div className="flex w-full gap-5 text-slate-600 md:flex-col md:gap-2">
                          <div className="mb-2 flex w-full flex-col gap-1">
                            <label htmlFor="name">Name</label>
                            <input
                              onChange={inputHandle}
                              value={state.name}
                              className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-green-500"
                              type="text"
                              name="name"
                              id="name"
                              placeholder="Name"
                            />
                          </div>
                          <div className="mb-2 flex w-full flex-col gap-1">
                            <label htmlFor="address">Address</label>
                            <input
                              onChange={inputHandle}
                              value={state.address}
                              className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-green-500"
                              type="text"
                              name="address"
                              id="address"
                              placeholder="Address"
                            />
                          </div>
                        </div>
                        <div className="flex w-full gap-5 text-slate-600 md:flex-col md:gap-2">
                          <div className="mb-2 flex w-full flex-col gap-1">
                            <label htmlFor="phone">Phone</label>
                            <input
                              onChange={inputHandle}
                              value={state.phone}
                              className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-green-500"
                              type="text"
                              name="phone"
                              id="phone"
                              placeholder="Phone"
                            />
                          </div>
                          <div className="mb-2 flex w-full flex-col gap-1">
                            <label htmlFor="post">Post</label>
                            <input
                              onChange={inputHandle}
                              value={state.post}
                              className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-green-500"
                              type="text"
                              name="post"
                              id="post"
                              placeholder="Post"
                            />
                          </div>
                        </div>
                        <div className="flex w-full gap-5 text-slate-600 md:flex-col md:gap-2">
                          <div className="mb-2 flex w-full flex-col gap-1">
                            <label htmlFor="province">Province</label>
                            <input
                              onChange={inputHandle}
                              value={state.province}
                              className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-green-500"
                              type="text"
                              name="province"
                              id="province"
                              placeholder="Province"
                            />
                          </div>
                          <div className="mb-2 flex w-full flex-col gap-1">
                            <label htmlFor="city">City</label>
                            <input
                              onChange={inputHandle}
                              value={state.city}
                              className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-green-500"
                              type="text"
                              name="city"
                              id="city"
                              placeholder="City"
                            />
                          </div>
                        </div>
                        <div className="flex w-full gap-5 text-slate-600 md:flex-col md:gap-2">
                          <div className="mb-2 flex w-full flex-col gap-1">
                            <label htmlFor="area">Area</label>
                            <input
                              onChange={inputHandle}
                              value={state.area}
                              className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-green-500"
                              type="text"
                              name="area"
                              id="area"
                              placeholder="Area"
                            />
                          </div>
                          <div className="mt-8 flex w-full flex-col gap-1">
                            <button className="rounded-sm bg-green-500 px-3 py-[6px] text-white hover:shadow-lg hover:shadow-green-500/50">
                              Save Change
                            </button>
                          </div>
                        </div>
                      </form>
                    </>
                  )}

                  {res && (
                    <div className="flex flex-col gap-1">
                      <h2 className="pb-2 font-semibold text-slate-600">
                        Deliver To {state.name}
                      </h2>
                      <p>
                        <span className="mr-2 rounded bg-blue-200 px-2 py-1 text-sm font-medium text-blue-800">
                          Home
                        </span>
                        <span>
                          {state.phone}, {state.address} ,{state.province} ,
                          {state.city}.{" "}
                        </span>
                        <span
                          onClick={() => setResponse(false)}
                          className="cursor-pointer text-indigo-500"
                        >
                          Change
                        </span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Email To ali@gmail.com
                      </p>
                    </div>
                  )}
                </div>
                {products.map((ele, i) => (
                  <div className="flex flex-col gap-2 bg-white p-4" key={i}>
                    <div className="flex items-center justify-start">
                      <h2 className="text-md font-bold text-slate-600">
                        {ele.shopName}
                      </h2>
                    </div>
                    {ele.products.map((pr, i) => (
                      <div className="flex w-full flex-wrap" key={i}>
                        <div className="flex w-7/12 gap-2 sm:w-full">
                          <div className="flex items-center justify-start gap-2">
                            <img
                              className="h-[80px] w-[80px]"
                              src={pr.productInfo.images[0]}
                              alt=""
                            />
                            <div className="pr-4 text-slate-600">
                              <h2 className="text-md font-semibold">
                                {pr.productInfo.name}
                              </h2>
                              <span className="text-sm">
                                Brand: {pr.productInfo.brand}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex w-5/12 justify-between sm:mt-3 sm:w-full">
                          <div className="pl-4 sm:pl-0">
                            <h2 className="text-lg text-orange-500">
                              $
                              {pr.productInfo.price -
                                Math.floor(
                                  ((pr.productInfo.price *
                                    pr.productInfo.discount) /
                                    100) *
                                    pr.quantity,
                                )}
                            </h2>
                            <p className="line-through">
                              ${pr.productInfo.price}
                            </p>
                            <p>-{pr.productInfo.discount}%</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex h-[30px] items-center justify-center bg-slate-200 text-xl">
                              <div className="cursor-pointer px-3">-</div>
                              <div className="px-3">2</div>
                              <div className="cursor-pointer px-3">+</div>
                            </div>
                            <button className="bg-red-500 px-5 py-[3px] text-white">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-[33%] md-lg:w-full">
              <div className="pl-3 md-lg:mt-5 md-lg:pl-0">
                <div className="flex flex-col gap-3 bg-white p-3 text-slate-600">
                  <h2 className="text-xl font-bold">Order Summary</h2>

                  <div className="flex items-center justify-between">
                    <span>Items Total ({items})</span>
                    <span>${price}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="w-full rounded-sm border border-slate-200 px-3 py-2 outline-0 focus:border-green-500"
                      type="text"
                      name=""
                      id=""
                      placeholder="Input Vauchar Coupon"
                    />
                    <button className="rounded-sm bg-[#059473] px-5 py-[1px] text-sm uppercase text-white">
                      Apply
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Payment</span>
                    <span>$450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    <span className="text-lg text-[#059473]">
                      ${price}
                    </span>
                  </div>
                  <button
                    onClick={placeOrder}
                    disabled={!res}
                    className={`rounded-sm ${res ? "bg-red-500" : "bg-red-300"} px-5 py-[6px] text-sm text-white hover:shadow-lg hover:shadow-red-500/50`}
                  >
                    Place Order
                  </button>
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

export default Shipping;
