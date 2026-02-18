"use client";

import { useState } from "react";
import { Mail, MessageSquare, Phone, Send, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { contactSchema } from "../../utils/validationSchemas";
import api from "../../api/api";

const ContactForm = () => {
  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(contactSchema),
  });

  const onSubmit = async (data) => {
    setStatus({ submitting: true, submitted: false, error: null });

    try {
      await api.post("/home/contact", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || "",
        message: data.message,
        subject: data.subject || "",
      });

      setStatus({ submitting: false, submitted: true, error: null });
      reset();
    } catch (error) {
      setStatus({
        submitting: false,
        submitted: false,
        error: error.response?.data?.error || error.message,
      });
    }
  };

  return (
    <div>
      {status.submitted && (
        <SuccessMessage message="Message sent successfully!" />
      )}

      {status.error && <ErrorMessage message={`Error: ${status.error}`} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormInput
            Icon={User}
            id="firstName"
            register={register("firstName")}
            placeholder="Enter your first name"
            label="First Name"
            type="text"
            error={errors.firstName}
          />

          <FormInput
            Icon={User}
            id="lastName"
            register={register("lastName")}
            placeholder="Enter your last name"
            label="Last Name"
            type="text"
            error={errors.lastName}
          />

          <FormInput
            Icon={Mail}
            id="email"
            register={register("email")}
            placeholder="Enter your email"
            label="Email Address"
            type="email"
            error={errors.email}
          />

          <FormInput
            Icon={Phone}
            id="phone"
            register={register("phone")}
            placeholder="Enter your phone number"
            label="Phone Number"
            type="text"
            error={errors.phone}
          />
        </div>

        <FormTextarea
          Icon={MessageSquare}
          id="message"
          register={register("message")}
          placeholder="Type your message here"
          label="Message"
          error={errors.message}
        />

        <SubmitButton submitting={status.submitting} />
      </form>
    </div>
  );
};

const SuccessMessage = ({ message }) => (
  <div className="mb-6 flex items-center rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
    <div className="mr-3 flex-shrink-0">
      <svg
        className="h-5 w-5 text-emerald-600"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    </div>
    <p className="font-semibold">{message}</p>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="mb-6 flex items-center rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
    <div className="mr-3 flex-shrink-0">
      <svg
        className="h-5 w-5 text-slate-600"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    </div>
    <p className="font-semibold">{message}</p>
  </div>
);

const FormInput = ({
  Icon,
  id,
  register,
  placeholder,
  label,
  type = "text",
  error,
}) => (
  <div>
    <label
      htmlFor={id}
      className="mb-2 block text-sm font-semibold text-neutral-900"
    >
      {label}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type={type}
        id={id}
        {...register}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-white px-4 py-2.5 pl-11 text-neutral-900 shadow-sm transition-all placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 hover:border-red-600 focus:border-red-500 focus:ring-red-500/20"
            : "border-neutral-300 hover:border-slate-400 focus:border-slate-500 focus:ring-slate-500/20"
        }`}
      />
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600">{error.message}</p>
    )}
  </div>
);

const FormTextarea = ({
  Icon,
  id,
  register,
  placeholder,
  label,
  error,
}) => (
  <div>
    <label
      htmlFor={id}
      className="mb-2 block text-sm font-semibold text-neutral-900"
    >
      {label}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute left-3.5 top-3 flex items-start">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <textarea
        id={id}
        rows={6}
        {...register}
        placeholder={placeholder}
        className={`w-full resize-none rounded-lg border bg-white px-4 py-2.5 pl-11 text-neutral-900 shadow-sm transition-all placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 hover:border-red-600 focus:border-red-500 focus:ring-red-500/20"
            : "border-neutral-300 hover:border-slate-400 focus:border-slate-500 focus:ring-slate-500/20"
        }`}
      />
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600">{error.message}</p>
    )}
  </div>
);

const SubmitButton = ({ submitting }) => (
  <div>
    <button
      type="submit"
      disabled={submitting}
      className="group w-full rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:from-slate-800 hover:to-slate-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex items-center justify-center gap-2">
        {submitting ? "Sending..." : "Send Message"}
        {!submitting && (
          <Send className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        )}
      </span>
    </button>
  </div>
);

export default ContactForm;
