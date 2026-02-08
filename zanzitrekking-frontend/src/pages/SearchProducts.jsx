import { useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { Range } from "react-range";
import { AiFillStar } from "react-icons/ai";
import { CiStar } from "react-icons/ci";
// import Products from "../components/products/Products";
import { BsFillGridFill } from "react-icons/bs";
import { FaThList } from "react-icons/fa";
import ShopProducts from "../components/products/ShopProducts";
import Pagination from "../components/Pagination";
import { useDispatch, useSelector } from "react-redux";
import {
  price_range_products,
  query_products,
} from "../store/reducers/homeReducer";
import BreadCrumb from "../components/common/BreadCrumb";

const SearchProducts = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const searchValue = searchParams.get("searchValue");

  const dispatch = useDispatch();
  const {
    categories,
    products,
    priceRange,
    totalProducts,
    parpage,
  } = useSelector((state) => state.home);
  const [total, setTotal] = useState(totalProducts);
  const [parPage, setParPage] = useState(parpage);
  const [pageNumber, setPageNumber] = useState(1);
  const [filter, setFilter] = useState(true);
  const [rating, setRating] = useState("");
  const [styles, setStyles] = useState("grid");

  const [sort, setSort] = useState("sort-by");
  useEffect(() => {
    dispatch(price_range_products());
  }, [dispatch]);

  useEffect(() => {
    if (priceRange) {
      setPriceValues([priceRange?.low || 0, priceRange?.high || 1000]);
    }
  }, [priceRange]);
  const [priceValues, setPriceValues] = useState([
    priceRange?.low || 0,
    priceRange?.high || 1000,
  ]);
  useEffect(() => {
    setTotal(totalProducts);
    setParPage(parpage);
  }, [totalProducts, parpage]);

  useEffect(() => {
    dispatch(
      query_products({
        low: priceValues[0] || "",
        high: priceValues[1] || "",
        category,
        rating,
        sort,
        pageNumber,
        searchValue,
      }),
    );
  }, [category, rating, sort, pageNumber, priceValues, searchValue, dispatch]);

  const resetRating = () => {
    setRating("");
    dispatch(
      query_products({
        low: priceValues[0],
        high: priceValues[1],
        category,
        rating: "",
        sort,
        pageNumber,
      }),
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header categories={categories} />
      <BreadCrumb title={"Shop"} />

      <section className="flex-grow py-12">
        <div className="px-4 md:px-12">
          <div className="mb-6 md:hidden">
            <button
              onClick={() => setFilter(!filter)}
              className="w-full rounded-md bg-emerald-600 py-3 font-semibold text-white transition"
            >
              {filter ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
          <div className="flex flex-wrap gap-8">
            <aside
              className={`w-full md:w-1/4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-300 ease-in-out ${
                filter
                  ? "max-h-screen opacity-100"
                  : "max-h-0 overflow-hidden opacity-0 md:max-h-full md:opacity-100"
              }`}
            >
              <div className="mb-10">
                <h2 className="mb-4 text-lg font-bold text-gray-800">Price</h2>
                <Range
                  step={50}
                  min={priceRange?.low || 0}
                  max={priceRange?.high || 1000}
                  values={priceValues}
                  onChange={(values) => setPriceValues(values)}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      className="relative h-2 w-full cursor-pointer rounded-full bg-emerald-100"
                    >
                      {children}
                      <div
                        className="absolute h-2 rounded-full bg-emerald-500"
                        style={{
                          left: `${((priceValues[0] - (priceRange?.low || 0)) / ((priceRange?.high || 1000) - (priceRange?.low || 0))) * 100}%`,
                          width: `${((priceValues[1] - priceValues[0]) / ((priceRange?.high || 1000) - (priceRange?.low || 0))) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                  renderThumb={({ props }, index) => (
                    <div
                      className="h-5 w-5 rounded-full border-2 border-emerald-500 bg-white shadow"
                      {...props}
                      key={index}
                    />
                  )}
                />
                <div className="mt-3 text-base font-medium text-gray-700">
                  ${Math.floor(priceValues[0])} - ${Math.floor(priceValues[1])}
                </div>
              </div>
              <div>
                <h2 className="mb-4 text-lg font-bold text-gray-800">Rating</h2>
                <div className="flex flex-col space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div
                      key={star}
                      onClick={() => setRating(star)}
                      className={`flex items-center gap-1 text-base cursor-pointer select-none transition-colors ${
                        rating === star ? "text-emerald-600 font-bold" : "text-gray-500 font-normal"
                      }`}
                    >
                      {[...Array(5)].map((_, i) =>
                        i < star ? <AiFillStar key={i} className="text-emerald-400" /> : <CiStar key={i} className="text-emerald-100" />,
                      )}
                      <span className="ml-2 text-gray-700">{star} & Up</span>
                    </div>
                  ))}
                  <div
                    onClick={resetRating}
                    className="flex items-center gap-1 text-base font-medium text-emerald-500 cursor-pointer"
                  >
                    {[...Array(5)].map((_, i) => (
                      <CiStar key={i} />
                    ))}
                    <span className="ml-2">Clear Rating</span>
                  </div>
                </div>
              </div>
            </aside>

            <main className="flex-1">
              <div className="mb-6 flex flex-col items-center justify-between rounded-md bg-white p-4 shadow-sm md:flex-row">
                <p className="text-lg font-semibold text-black">
                  Showing <span className="text-embg-emerald-600">{total}</span>{" "}
                  Products
                </p>
                <div className="mt-4 flex items-center space-x-4 md:mt-0">
                  <select
                    className="rounded-md border border-gray-300 px-3 py-1 text-black focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="sort-by" disabled>
                      Sort By
                    </option>
                    <option value="low-to-high">Price: Low to High</option>
                    <option value="high-to-low">Price: High to Low</option>
                  </select>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setStyles("grid")}
                      className={`rounded-md p-2 ${
                        styles === "grid" ? "text-emerald-600" : "text-gray-500"
                      }`}
                      aria-label="Grid View"
                    >
                      <BsFillGridFill size={20} />
                    </button>
                    <button
                      onClick={() => setStyles("list")}
                      className={`rounded-md p-2 ${
                        styles === "list" ? "text-emerald-600" : "text-gray-500"
                      }`}
                      aria-label="List View"
                    >
                      <FaThList size={20} />
                    </button>
                  </div>
                </div>
              </div>
              <ShopProducts styles={styles} products={products} />
              {total > parPage && (
                <div className="mt-5 flex justify-center">
                  <Pagination
                    pageNumber={pageNumber}
                    setPageNumber={setPageNumber}
                    totalItem={totalProducts}
                    parPage={parPage}
                    showItem={Math.floor(totalProducts / parPage)}
                  />
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default SearchProducts;
