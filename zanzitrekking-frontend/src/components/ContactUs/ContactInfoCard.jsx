"use client";

const ContactInfoCard = ({ icon: Icon, title, children }) => {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      {/* Content */}
      <div className="relative z-10">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 transition-colors duration-200 group-hover:bg-slate-200">
          <Icon className="h-6 w-6 text-slate-600" />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-neutral-900">{title}</h3>

        <div className="space-y-1 text-sm text-neutral-600">{children}</div>
      </div>
    </div>
  );
};

export default ContactInfoCard;
