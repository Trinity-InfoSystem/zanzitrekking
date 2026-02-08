import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Range } from "react-range";
import { AiFillStar } from "react-icons/ai";
import { CiStar } from "react-icons/ci";
import { BsFillGridFill } from "react-icons/bs";
import { FaThList } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

import Footer from "../components/Footer";
import Header from "../components/Header";
import BreadCrumb from "../components/common/BreadCrumb";
import ShopProducts from "../components/products/ShopProducts";
import Pagination from "../components/Pagination";
import {
  price_range_products,
  query_products,
} from "../store/reducers/homeReducer";

const CategoryShops = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  const dispatch = useDispatch();
  const {
    categories,
    latest_product,
    products,
    priceRange,
    totalProducts,
    parpage,
  } = useSelector((state) => state.home);

  const [total, setTotal] = useState(totalProducts);
  const [pageNumber, setPageNumber] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [rating, setRating] = useState("");
  const [viewStyle, setViewStyle] = useState("grid");
  const [sort, setSort] = useState("sort-by");
  const [priceValues, setPriceValues] = useState([
    priceRange?.low || 0,
    priceRange?.high || 1000,
  ]);

  useEffect(() => {
    dispatch(price_range_products());
  }, [dispatch]);

  useEffect(() => {
    if (priceRange) {
      setPriceValues([priceRange.low || 0, priceRange.high || 1000]);
    }
  }, [priceRange]);

  useEffect(() => {
    setTotal(totalProducts);
  }, [totalProducts]);

  useEffect(() => {
    dispatch(
      query_products({
        low: priceValues[0] || "",
        high: priceValues[1] || "",
        category,
        rating,
        sort,
        pageNumber,
      }),
    );
  }, [category, rating, sort, pageNumber, priceValues, dispatch]);

  const resetRating = () => {
    setRating("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header categories={categories} />
      <BreadCrumb title="Shop" />

      <section className="flex-grow py-12">
        <div className="px-4 md:px-12">
          {/* Filter Toggle for mobile */}
          <div className="mb-6 md:hidden">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="w-full rounded-md bg-emerald-600 py-3 font-semibold text-white transition"
            >
              {filterOpen ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          <div className="flex flex-wrap gap-8">
            {/* Sidebar filters */}
            <aside
              className={`w-full rounded-md bg-white p-6 shadow-md transition-all duration-300 ease-in-out md:w-1/4 ${
                filterOpen
                  ? "max-h-screen opacity-100"
                  : "max-h-0 overflow-hidden opacity-0 md:max-h-full md:opacity-100"
              }`}
            >
              {/* Price Range */}
              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold text-black">
                  Price Range
                </h2>
                <Range
                  step={50}
                  min={priceRange?.low || 0}
                  max={priceRange?.high || 1000}
                  values={priceValues}
                  onChange={setPriceValues}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      className="relative h-2 w-full cursor-pointer rounded-full bg-gray-300"
                    >
                      {children}
                      <div
                        className="absolute h-2 rounded-full bg-emerald-600"
                        style={{
                          left: `${((priceValues[0] - (priceRange?.low || 0)) / ((priceRange?.high || 1000) - (priceRange?.low || 0))) * 100}%`,
                          width: `${((priceValues[1] - priceValues[0]) / ((priceRange?.high || 1000) - (priceRange?.low || 0))) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                  renderThumb={({ props }, index) => (
                    <div
                      {...props}
                      className="h-5 w-5 rounded-full border-2 border-white bg-emerald-600 shadow-md"
                      key={index}
                    />
                  )}
                />
                <div className="mt-3 text-lg font-semibold text-black">
                  ${Math.floor(priceValues[0])} - ${Math.floor(priceValues[1])}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold text-black">
                  Rating
                </h2>
                <div className="flex cursor-pointer select-none flex-col space-y-3 text-orange-500">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div
                      key={star}
                      onClick={() => setRating(star)}
                      className={`hover:text-embg-emerald-600 flex items-center gap-1 text-xl ${
                        rating === star ? "font-bold" : "font-normal"
                      }`}
                    >
                      {[...Array(5)].map((_, i) =>
                        i < star ? <AiFillStar key={i} /> : <CiStar key={i} />,
                      )}
                      <span className="ml-2 font-medium text-black">
                        {star} & Up
                      </span>
                    </div>
                  ))}
                  <div
                    onClick={resetRating}
                    className="flex items-center gap-1 text-xl font-semibold text-emerald-600"
                  >
                    {[...Array(5)].map((_, i) => (
                      <CiStar key={i} />
                    ))}
                    <span className="ml-2">Clear Rating</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products & Controls */}
            <main className="flex-1">
              <div className="mb-6 flex flex-col items-center justify-between rounded-md bg-white p-4 shadow-sm md:flex-row">
                <p className="text-lg font-semibold text-black">
                  Showing <span className="text-embg-emerald-600">{total}</span>{" "}
                  Products
                </p>

                <div className="mt-4 flex items-center space-x-4 md:mt-0">
                  {/* Sort */}
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

                  {/* View Toggle */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewStyle("grid")}
                      className={`rounded-md p-2 ${
                        viewStyle === "grid"
                          ? "text-emerald-600"
                          : "text-gray-500"
                      }`}
                      aria-label="Grid View"
                    >
                      <BsFillGridFill size={20} />
                    </button>
                    <button
                      onClick={() => setViewStyle("list")}
                      className={`rounded-md p-2 ${
                        viewStyle === "list"
                          ? "text-emerald-600"
                          : "text-gray-500"
                      }`}
                      aria-label="List View"
                    >
                      <FaThList size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <ShopProducts styles={viewStyle} products={products} />

              {/* Pagination */}
              {total > parpage && (
                <div className="mt-5 flex justify-center">
                  <Pagination
                    pageNumber={pageNumber}
                    setPageNumber={setPageNumber}
                    totalItem={totalProducts}
                    parPage={parpage}
                    showItem={Math.ceil(totalProducts / parpage)}
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

export default CategoryShops;
