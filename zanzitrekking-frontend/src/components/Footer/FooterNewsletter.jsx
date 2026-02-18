import { useEffect } from "react";
import { CheckCircle2, Send, Sparkles } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearNewsletterMessage,
  subscribe_newsletter,
} from "../../store/reducers/newsletterReducer";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const newsletterSchema = yup.object({
  email: yup
    .string()
    .email("Please provide a valid email address")
    .required("Email is required"),
});

const FooterNewsletter = () => {
  const dispatch = useDispatch();
  const { successMessage, errorMessage } = useSelector(
    (state) => state.newsletter,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(newsletterSchema),
  });

  const onSubmit = (data) => {
    dispatch(subscribe_newsletter({ email: data.email }));
    reset();
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearNewsletterMessage());
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearNewsletterMessage());
    }
  }, [successMessage, errorMessage, dispatch]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-700 px-4 py-20 md:px-12">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-accent-300" />
            <span className="text-sm font-medium text-white">Stay Updated</span>
          </div>

          {/* Heading */}
          <h2 className="mb-4 text-4xl font-bold text-white lg:text-5xl">
            Join Our Community
          </h2>
          <p className="mb-8 text-lg text-primary-100">
            Get exclusive safari tips, travel guides, and special offers
            delivered to your inbox.
          </p>

          {/* Newsletter form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-md">
            <div className="relative">
              <input
                type="email"
                {...register("email")}
                placeholder="Enter your email address"
                className={`w-full rounded-xl border-2 bg-white/10 px-6 py-4 pr-14 text-base text-white placeholder-primary-200 backdrop-blur-lg transition-all duration-300 focus:bg-white/15 focus:outline-none focus:ring-4 ${
                  errors.email
                    ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                    : "border-white/20 focus:border-accent-400 focus:ring-accent-400/20"
                }`}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-accent-500 text-primary-800 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-accent-400 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-accent-400/30"
                aria-label="Subscribe to newsletter"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-200">{errors.email.message}</p>
            )}
            <p className="mt-4 text-xs text-primary-200">
              By subscribing, you agree to receive updates. Unsubscribe anytime.
            </p>
          </form>

          {/* Features */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent-400" />
              <span>Weekly Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent-400" />
              <span>Exclusive Deals</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent-400" />
              <span>No Spam</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          className="w-full text-white"
          preserveAspectRatio="none"
        >
          <path
            d="M0,100L120,94C240,88,480,74,720,86C960,98,1200,124,1320,112L1440,100V120H0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
};

export default FooterNewsletter;
