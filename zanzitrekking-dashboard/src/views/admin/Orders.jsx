import { useState } from "react";
import { LuArrowDownSquare } from "react-icons/lu";
import { Link } from "react-router-dom";
import Pagination from "../Pagination";

const Orders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [parPage, setParPage] = useState(5);
  const [show, setShow] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 px-2 pt-5 lg:px-7">
      <div className="w-full rounded-2xl bg-white p-6 shadow-nature-medium ring-1 ring-primary-100">
        {/* Search and select inputs */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <select
            onChange={(e) => setParPage(+e.target.value)}
            className="rounded-xl border-2 border-primary-200 bg-white px-4 py-2.5 text-text-dark outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-200"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
          <input
            className="rounded-xl border-2 border-primary-200 bg-white px-4 py-2.5 text-text-dark outline-none placeholder:text-text-light focus:border-secondary focus:ring-2 focus:ring-secondary-200"
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        {/* Table header */}
        <div className="relative mt-5 overflow-x-auto">
          <div className="w-full text-left text-xs sm:text-sm">
            <div className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 uppercase">
              <div className="flex items-center justify-between">
                <div className="w-[25%] py-3 font-bold text-primary-700">
                  Order Id
                </div>
                <div className="w-[13%] py-3 font-bold text-primary-700">
                  Price
                </div>
                <div className="w-[18%] py-3 font-bold text-primary-700">
                  Payment Status
                </div>
                <div className="w-[18%] py-3 font-bold text-primary-700">
                  Order Status
                </div>
                <div className="w-[18%] py-3 font-bold text-primary-700">
                  Action
                </div>
                <div className="w-[8%] py-3 font-bold text-primary-700">
                  <LuArrowDownSquare />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table body */}
        <div className="">
          <div className="flex flex-wrap items-start justify-between border-b border-primary-100 text-xs transition-colors hover:bg-primary-50/50 sm:text-sm">
            <div className="w-[25%] whitespace-nowrap py-3 font-medium text-text-dark">
              #34343
            </div>
            <div className="w-[13%] py-3 font-medium text-text-dark">$654</div>
            <div className="w-[18%] py-3 font-medium">
              <span className="rounded-full bg-sunshine-100 px-3 py-1 text-xs font-semibold text-sunshine-700">
                Pending
              </span>
            </div>
            <div className="w-[18%] py-3 font-medium">
              <span className="rounded-full bg-info-100 px-3 py-1 text-xs font-semibold text-info-700">
                Pending
              </span>
            </div>
            <div className="w-[18%] py-3 font-medium">
              <Link
                to="/admin/dashboard/order/details/1"
                className="shadow-coral-soft rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:scale-105"
              >
                View
              </Link>
            </div>
            <div
              onClick={() => setShow((pre) => !pre)}
              className="w-[8%] cursor-pointer py-3 font-medium text-primary-700 transition-colors hover:text-secondary"
            >
              <LuArrowDownSquare />
            </div>
          </div>

          {/* Expandable content */}
          {show && (
            <div className="block border-b border-primary-100 bg-primary-50/30">
              <div className="flex items-start justify-start border-b border-primary-100">
                <div className="w-[25%] whitespace-nowrap py-3 pl-3 font-medium text-text-dark">
                  #4378
                </div>
                <div className="w-[13%] py-3 font-medium text-text-dark">
                  $290
                </div>
                <div className="w-[18%] py-3 font-medium">
                  <span className="rounded-full bg-sunshine-100 px-3 py-1 text-xs font-semibold text-sunshine-700">
                    Pending
                  </span>
                </div>
                <div className="w-[18%] py-3 font-medium">
                  <span className="rounded-full bg-info-100 px-3 py-1 text-xs font-semibold text-info-700">
                    Pending
                  </span>
                </div>
              </div>
              <div className="flex items-start justify-start border-b border-primary-100">
                <div className="w-[25%] whitespace-nowrap py-3 pl-3 font-medium text-text-dark">
                  #4378
                </div>
                <div className="w-[13%] py-3 font-medium text-text-dark">
                  $290
                </div>
                <div className="w-[18%] py-3 font-medium">
                  <span className="rounded-full bg-sunshine-100 px-3 py-1 text-xs font-semibold text-sunshine-700">
                    Pending
                  </span>
                </div>
                <div className="w-[18%] py-3 font-medium">
                  <span className="rounded-full bg-info-100 px-3 py-1 text-xs font-semibold text-info-700">
                    Pending
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex w-full justify-end pr-4">
          <Pagination
            pageNumber={currentPage}
            setPageNumber={setCurrentPage}
            totalItem={50}
            parPage={parPage}
            showItem={3}
          />
        </div>
      </div>
    </div>
  );
};

export default Orders;
