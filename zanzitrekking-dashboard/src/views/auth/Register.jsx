import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import {
  clearMessage,
  seller_register,
} from "../../store/Reducers/authReducer";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { adminRegisterSchema } from "../../utils/validationSchemas";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loader, errorMessage, successMessage } = useSelector(
    (state) => state.auth,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(adminRegisterSchema),
  });

  const onSubmit = (data) => {
    dispatch(seller_register({ name: data.name, email: data.email, password: data.password }));
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3 flex w-full flex-col gap-1">
              <label htmlFor="name">Name</label>
              <input
                className={`rounded-md border bg-transparent px-3 py-2 outline-none ${
                  errors.name ? "border-red-500" : "border-slate-400"
                }`}
                type="text"
                name="name"
                placeholder="Name"
                id="name"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="mb-3 flex w-full flex-col gap-1">
              <label htmlFor="email">Email</label>
              <input
                className={`rounded-md border bg-transparent px-3 py-2 outline-none ${
                  errors.email ? "border-red-500" : "border-slate-400"
                }`}
                type="email"
                name="email"
                placeholder="Email"
                id="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="mb-3 flex w-full flex-col gap-1">
              <label htmlFor="password">Password</label>
              <input
                className={`rounded-md border bg-transparent px-3 py-2 outline-none ${
                  errors.password ? "border-red-500" : "border-slate-400"
                }`}
                type="password"
                name="password"
                placeholder="Password"
                id="password"
                autoComplete="new-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
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
