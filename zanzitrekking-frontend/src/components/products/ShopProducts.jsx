import { FaEye, FaRegHeart } from "react-icons/fa6";
import { RiShoppingCartLine } from "react-icons/ri";
import Rating from "./Rating";

const ShopProducts = ({ styles, products }) => {
  return (
    <div
      className={`grid w-full ${styles === "grid" ? "grid-cols-3 md:grid-cols-2 md-lg:grid-cols-2" : "grid-cols-1 md:grid-cols-2 md-lg:grid-cols-2"} gap-6`}
    >
      {products.map((p, i) => (
        <div
          key={i}
          className={`flex transition-all duration-300 hover:shadow-lg border border-emerald-100 bg-white rounded-2xl p-4 ${styles === "grid" ? "flex-col items-start" : "items-center md-lg:flex-col md-lg:items-start"}`}
        >
          <div
            className={
              styles === "grid"
                ? "group relative h-[210px] w-full overflow-hidden md:h-[220px] xs:h-[140px]"
                : "group relative h-[210px] overflow-hidden md:h-[220px] md-lg:w-full"
            }
          >
            <img
              className="h-[180px] w-full rounded-xl object-cover md:h-[220px] xs:h-[140px] border border-emerald-50"
              src={`${p.images[0]}`}
              alt=""
            />
            <ul className="absolute bottom-3 left-1/2 -translate-x-1/2 flex w-auto items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <li className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700">
                <FaRegHeart size={16} />
              </li>
              <li className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700">
                <FaEye size={16} />
              </li>
              <li className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700">
                <RiShoppingCartLine size={16} />
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start justify-start gap-2 mt-4 w-full">
            <h2 className="font-semibold text-base text-gray-900 truncate w-full">{p.name}</h2>
            <div className="flex items-center gap-2 w-full">
              <span className="text-emerald-700 font-bold text-lg">${p.price}</span>
              <div className="flex items-center ml-auto"><Rating ratings={p.rating} /></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShopProducts;
