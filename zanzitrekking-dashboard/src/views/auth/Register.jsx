import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import {
  clearMessage,
  seller_register,
} from "../../store/Reducers/authReducer";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loader, errorMessage, successMessage } = useSelector(
    (state) => state.auth,
  );
  const [state, setState] = useState({
    name: "",
    email: "",
    password: "",
    // agreed: false,
  });

  const inputHandle = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();

    dispatch(seller_register(state));
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      navigate("/");
    }
  }, [errorMessage, successMessage]);
  return (
    <div className="flex min-h-screen min-w-full items-center justify-center bg-[#cdcae9]">
      <div className="w-[350px] p-2 text-[#ffffff]">
        <div className="rounded-md bg-[#6f68d1] p-4">
          <h2 className="mb-3 text-2xl font-bold">Welcome to Ecommerce</h2>
          <p className="text-md mb-3 font-medium">
            Please Register to your account
          </p>
          <form onSubmit={submit}>
            <div className="mb-3 flex w-full flex-col gap-1">
              <label htmlFor="name">Name</label>
              <input
                className="rounded-md border border-slate-400 bg-transparent px-3 py-2 outline-none"
                type="text"
                name="name"
                placeholder="Name"
                id="name"
                required
                value={state.name}
                onChange={inputHandle}
              />
            </div>
            <div className="mb-3 flex w-full flex-col gap-1">
              <label htmlFor="email">Email</label>
              <input
                className="rounded-md border border-slate-400 bg-transparent px-3 py-2 outline-none"
                type="text"
                name="email"
                placeholder="Email"
                id="email"
                required
                value={state.email}
                onChange={inputHandle}
              />
            </div>
            <div className="mb-3 flex w-full flex-col gap-1">
              <label htmlFor="password">Password</label>
              <input
                className="rounded-md border border-slate-400 bg-transparent px-3 py-2 outline-none"
                type="password"
                name="password"
                placeholder="Password"
                id="password"
                required
                autoComplete="new-password"
                value={state.password}
                onChange={inputHandle}
              />
            </div>
            <div className="mb-5 flex w-full items-center gap-3">
              <input
                className="h-4 w-4 overflow-hidden rounded border-gray-300 bg-gray-200 text-blue-600 focus:ring-blue-500"
                type="checkbox"
                name="agreed"
                id="checkbox"
                // checked={state.agreed}
                // onChange={inputHandle}
              />
              <label htmlFor="checkbox">
                I agree to privacy policy & terms
              </label>
            </div>

            <button
              disabled={loader}
              className="mb-3 w-full rounded-md bg-slate-800 px-7 py-2 text-white hover:shadow-lg hover:shadow-blue-300/50"
            >
              {loader ? (
                <PropagateLoader cssOverride={overrideStyle} color="#ffffff" />
              ) : (
                "Sign Up"
              )}
            </button>
            <div className="mb-3 flex items-center justify-center gap-2">
              <p>Already have an account?</p>
              <Link className="font-bold" to="/login">
                Sign In
              </Link>
            </div>
            <div className="mb-3 flex w-full items-center justify-center">
              <div className="h-[1px] w-[45%] bg-slate-700"></div>
              <div className="flex w-[10%] items-center justify-center">
                <span className="pb-3">Or</span>
              </div>
              <div className="h-[1px] w-[45%] bg-slate-700"></div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-[35px] w-[135px] cursor-pointer items-center justify-center overflow-hidden rounded-md bg-orange-700 shadow-lg hover:shadow-orange-700/50">
                <span>
                  <FaGoogle />
                </span>
              </div>
              <div className="flex h-[35px] w-[135px] cursor-pointer items-center justify-center overflow-hidden rounded-md bg-blue-700 shadow-lg hover:shadow-blue-700/50">
                <span>
                  <FaFacebook />
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
