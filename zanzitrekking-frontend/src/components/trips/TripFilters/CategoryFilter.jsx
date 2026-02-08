import { Tag } from "lucide-react";

const CategoryFilter = ({ categories, category, handleCategoryChange }) => {
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return (
      <div>
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
            <Tag className="h-4 w-4 text-neutral-700" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Categories</h3>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-6">
          <p className="text-center text-sm font-medium text-neutral-500">
            No categories available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
          <Tag className="h-4 w-4 text-emerald-700" />
        </div>
        <h3 className="text-base font-bold text-neutral-900">Destinations</h3>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {categories.map((c) => {
          const categoryId = c._id || c.id;
          if (!categoryId || !c.name) {return null;}
          return (
            <div key={categoryId} className="relative">
              <input
                type="checkbox"
                id={categoryId}
                checked={category === categoryId}
                onChange={(e) => handleCategoryChange(e, categoryId)}
                className="peer absolute h-0 w-0 opacity-0"
              />
              <label
                htmlFor={categoryId}
                className="inline-flex cursor-pointer items-center rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:shadow active:scale-[0.98] peer-checked:border-emerald-600 peer-checked:bg-gradient-to-br peer-checked:from-emerald-600 peer-checked:to-emerald-700 peer-checked:text-white peer-checked:shadow-md peer-checked:shadow-emerald-600/20"
              >
                {c.name}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
