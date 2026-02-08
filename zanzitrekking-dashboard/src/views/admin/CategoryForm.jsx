import { FaImage, FaTimes } from "react-icons/fa";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";

const CategoryForm = ({
  state,
  setState,
  errors,
  loader,
  imageShow,
  handleImage,
  add_category,
  categoryId,
  onClose,
}) => (
  <form onSubmit={add_category} className="flex flex-1 flex-col p-6">
    <div className="mb-6">
      <label className="mb-2 block text-sm font-medium text-primary-800">
        Category Name
      </label>
      <input
        value={state.name}
        onChange={(e) =>
          setState((prev) => ({ ...prev, name: e.target.value }))
        }
        type="text"
        className={`w-full rounded-lg border-2 ${errors.name ? "border-accent" : "border-primary-200"} bg-white px-4 py-2.5 text-text-dark transition-colors focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200`}
        placeholder="Enter category name"
      />
      {errors.name && <p className="mt-1 text-sm text-accent">{errors.name}</p>}
    </div>
    <div className="mb-6 flex-1">
      <label className="mb-2 block text-sm font-medium text-primary-800">
        Category Image
      </label>
      <label
        htmlFor="image"
        className="group relative flex h-64 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/30 transition-all hover:border-secondary hover:bg-secondary-50/30"
      >
        {imageShow ? (
          <>
            <img
              src={imageShow || "/placeholder.svg"}
              alt="Preview"
              className="h-full w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-primary-900/40 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="rounded-lg bg-secondary/90 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
                Change Image
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-primary-100">
              <FaImage className="h-8 w-8 text-text-light" />
            </div>
            <p className="mt-4 text-sm font-medium text-primary-800">
              Click to upload image
            </p>
            <p className="mt-1 text-xs text-text-light">
              SVG, PNG, JPG or GIF (max. 800x400px)
            </p>
          </div>
        )}
      </label>
      <input type="file" id="image" onChange={handleImage} className="hidden" />
      {errors.image && (
        <p className="mt-1 text-sm text-accent">{errors.image}</p>
      )}
    </div>
    <div className="mt-auto">
      <button
        disabled={loader}
        className="shadow-coral-medium hover:shadow-coral-large flex min-h-14 w-full items-center justify-center rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-3 font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
      >
        {loader ? (
          <PropagateLoader cssOverride={overrideStyle} color="#ffffff" />
        ) : categoryId ? (
          "Update Category"
        ) : (
          "Add Category"
        )}
      </button>
    </div>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-text-light transition-all hover:scale-110 hover:bg-accent hover:text-white"
      >
        <FaTimes className="h-4 w-4" />
      </button>
    )}
  </form>
);

export default CategoryForm;
