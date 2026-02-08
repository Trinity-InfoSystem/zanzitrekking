import { IoMdImage } from "react-icons/io";

const ImageUpload = ({ id, preview, onChange, label }) => (
  <div className="mb-4 flex flex-col items-center">
    <label
      htmlFor={id}
      className="mb-2 block text-sm font-bold text-primary-800"
    >
      {label}
    </label>
    <label
      className="group-image relative flex h-64 w-full max-w-md cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-primary-300 bg-primary-50/30 transition-all hover:border-secondary hover:bg-secondary-50/30"
      htmlFor={id}
    >
      {preview ? (
        <div className="flex h-full w-full items-center justify-center">
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-contain transition-transform group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-4">
          <div className="rounded-xl bg-secondary p-3 shadow-sm">
            <IoMdImage className="h-10 w-10 text-white" />
          </div>
          <span className="mt-3 text-center text-sm font-semibold text-text-dark">
            Click to upload image
          </span>
          <span className="mt-1 text-xs text-text-light">
            PNG, JPG up to 10MB
          </span>
        </div>
      )}
    </label>
    <input hidden id={id} type="file" onChange={onChange} accept="image/*" />
  </div>
);

export default ImageUpload;
