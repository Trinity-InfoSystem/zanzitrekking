const TripCardSkeleton = ({ styles }) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white ${
        styles === "grid" ? "flex flex-col" : "flex flex-col md:flex-row"
      }`}
    >
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 ${
          styles === "grid"
            ? "h-[280px] w-full"
            : "h-[260px] md:h-full md:w-[42%]"
        }`}
      >
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="absolute right-4 top-4 flex flex-col gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-white/40 backdrop-blur-sm" />
          <div className="h-10 w-10 rounded-xl bg-white/40 backdrop-blur-sm" />
          <div className="h-10 w-10 rounded-xl bg-white/40 backdrop-blur-sm" />
        </div>
      </div>

      <div
        className={`flex flex-1 flex-col p-6 ${styles === "list" ? "md:p-8" : ""}`}
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-neutral-100" />
          <div className="h-4 w-36 rounded-md bg-neutral-100" />
        </div>

        <div className="mb-3 space-y-2.5">
          <div className="h-6 w-4/5 rounded-lg bg-neutral-100" />
          <div className="h-6 w-3/5 rounded-lg bg-neutral-100" />
        </div>

        <div className="mb-5 space-y-2">
          <div className="h-4 w-full rounded-md bg-neutral-100" />
          <div className="h-4 w-11/12 rounded-md bg-neutral-100" />
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          <div className="h-9 w-24 rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200" />
          <div className="h-9 w-32 rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200" />
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-neutral-100 pt-5">
          <div className="space-y-2">
            <div className="h-3 w-24 rounded-md bg-neutral-100" />
            <div className="h-8 w-32 rounded-lg bg-neutral-100" />
            <div className="h-3 w-20 rounded-md bg-neutral-100" />
          </div>
          <div className="h-12 w-40 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200" />
        </div>
      </div>
    </div>
  );
};

const TripListSkeleton = ({ styles, count = 6 }) => {
  return (
    <>
      <div
        className={`grid gap-6 ${
          styles === "grid"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3"
            : "grid-cols-1"
        }`}
      >
        {[...Array(count)].map((_, index) => (
          <TripCardSkeleton key={index} styles={styles} />
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite ease-in-out;
        }
      `}</style>
    </>
  );
};

export default TripListSkeleton;
