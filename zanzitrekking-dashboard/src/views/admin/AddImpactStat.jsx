"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { impactStatAdd, clearMessage } from "../../store/Reducers/impactStatReducer";
import toast from "react-hot-toast";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import HeaderText from "./HeaderText";

const AddImpactStat = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loader, successMessage, errorMessage } = useSelector(
    (state) => state.impactStat,
  );

  const [formData, setFormData] = useState({
    value: 0,
    label: "",
    sublabel: "",
    prefix: "",
    suffix: "",
    labelStyle: "normal",
    duration: 2000,
    order: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "value" || name === "duration" || name === "order" ? Number(value) : value,
    }));
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      setTimeout(() => {
        dispatch(clearMessage());
        navigate("/admin/dashboard/impact-stats");
      }, 1500);
    }
  }, [successMessage, errorMessage, dispatch, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.label || !formData.sublabel || formData.value === undefined) {
      toast.error("Please fill in all required fields");
      return;
    }

    dispatch(impactStatAdd(formData));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 px-2 py-5 lg:px-7">
      <div className="w-full rounded-2xl bg-white p-6 shadow-nature-medium ring-1 ring-primary-100">
        <HeaderText title="Add Impact Stat" />

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/dashboard/impact-stats")}
            className="rounded-xl bg-neutral-200 px-4 py-2 font-medium text-text-dark transition-colors hover:bg-neutral-300"
          >
            Back to Impact Stats
          </button>
        </div>

        <div className="w-full">
          <form onSubmit={handleSubmit} className="mt-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Value */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Value *
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                  placeholder="e.g., 50000"
                  required
                />
              </div>

              {/* Label */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Label *
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                  placeholder="e.g., Donations"
                  required
                />
              </div>

              {/* Sub Label */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Sub Label *
                </label>
                <input
                  type="text"
                  name="sublabel"
                  value={formData.sublabel}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                  placeholder="e.g., TO COMMUNITIES"
                  required
                />
              </div>

              {/* Prefix */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Prefix
                </label>
                <input
                  type="text"
                  name="prefix"
                  value={formData.prefix}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                  placeholder="e.g., $ "
                />
              </div>

              {/* Suffix */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Suffix
                </label>
                <input
                  type="text"
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                  placeholder="e.g., +"
                />
              </div>

              {/* Label Style */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Label Style
                </label>
                <select
                  name="labelStyle"
                  value={formData.labelStyle}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Animation Duration (ms)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                  placeholder="2000"
                />
              </div>

              {/* Order */}
              <div>
                <label className="mb-2 block text-sm font-bold text-primary-800">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loader}
                className="shadow-coral-medium hover:shadow-coral-large flex min-h-14 min-w-[200px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-3 text-center font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loader ? (
                  <PropagateLoader color="#fff" cssOverride={overrideStyle} />
                ) : (
                  "Add Impact Stat"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddImpactStat;

