import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import { useDispatch, useSelector } from "react-redux";
import { clearMessage, seller_login } from "../../store/Reducers/authReducer";
const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loader, errorMessage, successMessage } = useSelector(
    (state) => state.auth,
  );
  const [state, setState] = useState({
    email: "",
    password: "",
  });

  function inputHandle(e) {
    setState((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  }
  function submit(e) {
    e.preventDefault();
    dispatch(seller_login(state));
  }
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessage());

      navigate("/");
    }
  }, [errorMessage, successMessage]);
  return (
    <div className="flex min-h-screen min-w-full items-center justify-center bg-[#cdcae9]">
      <div className="w-[350px] p-2 text-[#ffffff]">
        <div className="rounded-md bg-[#6f68d1] p-4">
          <h2 className="mb-3 text-2xl font-bold">Welcome to Ecommerce</h2>
          <p className="text-md mb-3 font-medium">Pls Log In your account</p>
          <form onSubmit={submit}>
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

            <button
              disabled={loader}
              className="mb-3 w-full rounded-md bg-slate-800 px-7 py-2 text-white hover:shadow-lg hover:shadow-blue-300/50"
            >
              {loader ? (
                <PropagateLoader cssOverride={overrideStyle} color="#ffffff" />
              ) : (
                "Sign In"
              )}
            </button>
            <div className="mb-3 flex items-center justify-center gap-2">
              <p>Don&apos;t have an account ?</p>
              <Link className="font-bold" to="/register">
                Sign Up
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

export default Login;
