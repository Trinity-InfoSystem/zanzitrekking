"use client";

import { useState } from "react";
import { Mail, MessageSquare, Phone, Send, User } from "lucide-react";
import api from "../../api/api";

const ContactForm = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    number: "",
    message: "",
  });

  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, submitted: false, error: null });

    try {
      await api.post("/home/contact", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.number,
        message: form.message,
      });

      setStatus({ submitting: false, submitted: true, error: null });
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        number: "",
        message: "",
      });
    } catch (error) {
      setStatus({ submitting: false, submitted: false, error: error.message });
    }
  };

  return (
    <div>
      {status.submitted && (
        <SuccessMessage message="Message sent successfully!" />
      )}

      {status.error && <ErrorMessage message={`Error: ${status.error}`} />}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormInput
            Icon={User}
            id="firstName"
            name="firstName"
            value={form.firstName}
            onChange={handleInputChange}
            placeholder="Enter your first name"
            label="First Name"
            type="text"
            required
          />

          <FormInput
            Icon={User}
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={handleInputChange}
            placeholder="Enter your last name"
            label="Last Name"
            type="text"
            required
          />

          <FormInput
            Icon={Mail}
            id="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            label="Email Address"
            type="email"
            required
          />

          <FormInput
            Icon={Phone}
            id="number"
            name="number"
            value={form.number}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
            label="Phone Number"
            type="text"
          />
        </div>

        <FormTextarea
          Icon={MessageSquare}
          id="message"
          name="message"
          value={form.message}
          onChange={handleInputChange}
          placeholder="Type your message here"
          label="Message"
          required
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
  name,
  value,
  onChange,
  placeholder,
  label,
  type = "text",
  required = false,
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
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 pl-11 text-neutral-900 shadow-sm transition-all placeholder:text-neutral-400 hover:border-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
        required={required}
      />
    </div>
  </div>
);

const FormTextarea = ({
  Icon,
  id,
  name,
  value,
  onChange,
  placeholder,
  label,
  required = false,
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
        name={name}
        rows={6}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-4 py-2.5 pl-11 text-neutral-900 shadow-sm transition-all placeholder:text-neutral-400 hover:border-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
        required={required}
      />
    </div>
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
