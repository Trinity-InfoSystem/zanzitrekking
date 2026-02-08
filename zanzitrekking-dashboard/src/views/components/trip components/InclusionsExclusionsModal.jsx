import { useState } from "react";
import CategoryInclusionsExclusions from "./CategoryInclusionsExclusions";

const InclusionsExclusionsModal = ({
  isOpen,
  onClose,
  inclusions,
  exclusions,
  selectedInclusions,
  selectedExclusions,
  onInclusionChange,
  onExclusionChange,
  onAddInclusion,
  onAddExclusion,
}) => {
  const [activeTab, setActiveTab] = useState("inclusions");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/20 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-primary-100">
        {/* Header */}
        <div className="rounded-t-2xl bg-gradient-to-r from-primary via-primary-600 to-primary-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Inclusions & Exclusions
              </h2>
              <p className="text-white/90">
                Manage what's included and excluded for each pricing category
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-primary-200">
          <nav className="flex space-x-8 px-8">
            <button
              onClick={() => setActiveTab("inclusions")}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === "inclusions"
                  ? "border-secondary text-secondary"
                  : "border-transparent text-text-light hover:border-primary-300 hover:text-text-dark"
              }`}
            >
              Inclusions
            </button>
            <button
              onClick={() => setActiveTab("exclusions")}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === "exclusions"
                  ? "border-secondary text-secondary"
                  : "border-transparent text-text-light hover:border-primary-300 hover:text-text-dark"
              }`}
            >
              Exclusions
            </button>
          </nav>
        </div>

        {/* Info Banner */}
        <div className="mx-8 mt-4 rounded-lg border border-info-200 bg-info-50 p-3">
          <div className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-info-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1 text-sm text-info-700">
              <span className="font-semibold">Auto-Population:</span> Items
              added to Budget will automatically be included in Mid-Range and
              Luxury packages. You can customize by adding or removing items for
              each tier.
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === "inclusions" && (
            <CategoryInclusionsExclusions
              title="Inclusions"
              type="inclusions"
              categories={["standard", "midRange", "luxury"]}
              options={inclusions}
              selectedValues={selectedInclusions}
              onSelectionChange={onInclusionChange}
              onAddNew={onAddInclusion}
            />
          )}

          {activeTab === "exclusions" && (
            <CategoryInclusionsExclusions
              title="Exclusions"
              type="exclusions"
              categories={["standard", "midRange", "luxury"]}
              options={exclusions}
              selectedValues={selectedExclusions}
              onSelectionChange={onExclusionChange}
              onAddNew={onAddExclusion}
            />
          )}
        </div>

        {/* Footer */}
        <div className="rounded-b-2xl border-t border-primary-200 bg-neutral-50 px-8 py-4">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="rounded-xl bg-neutral-200 px-6 py-2 font-medium text-text-dark transition-colors hover:bg-neutral-300"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="shadow-coral-medium hover:shadow-coral-large rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-2 font-semibold text-white transition-all hover:scale-105"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InclusionsExclusionsModal;
