const Loader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-solid border-teal-400 border-t-transparent"></div>
      </div>
    </div>
  );
};

export default Loader;
