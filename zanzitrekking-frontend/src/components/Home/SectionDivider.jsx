import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { get_partners } from "../../store/reducers/partnerReducer";
import PartnersSection from "./components/PartnersSection";

const SectionDivider = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(get_partners());
  }, [dispatch]);

  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-20">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `

            `,
            backgroundSize: "120px 120px",
            backgroundPosition: "0 0, 60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 px-4 md:px-12">
        <div className="mx-auto max-w-7xl">
          <PartnersSection />
        </div>
      </div>

      {/* Section divider */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
    </section>
  );
};

export default SectionDivider;
