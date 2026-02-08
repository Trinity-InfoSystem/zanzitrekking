const FormTextarea = ({ label, placeholder, value, name, onChange }) => {
  return (
    <div className="mb-12">
      <label className="mb-4 block text-base text-body-color dark:text-dark-6">
        {label} <span className="text-red">*</span>
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows="7"
        placeholder={placeholder}
        className="w-full resize-none rounded border border-stroke bg-white px-[14px] py-3 text-body-color outline-none focus:border-primary dark:border-dark-3 dark:bg-dark dark:text-dark-6"
      ></textarea>
    </div>
  );
};
export default FormTextarea;
