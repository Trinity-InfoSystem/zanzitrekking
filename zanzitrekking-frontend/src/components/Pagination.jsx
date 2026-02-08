"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const Pagination = ({
  pageNumber,
  setPageNumber,
  totalItem,
  parPage,
  showItem,
}) => {
  const totalPage = Math.ceil(totalItem / parPage);
  let startPage = pageNumber;

  const dif = totalPage - pageNumber;
  if (dif <= showItem) {
    startPage = totalPage - showItem;
  }
  let endPage = startPage < 0 ? showItem : showItem + startPage;

  if (startPage <= 0) {
    startPage = 1;
  }

  if (endPage === totalPage - 1) {
    endPage = totalPage;
  }

  if (endPage >= totalPage) {
    endPage = totalPage + 1;
  }

  const createButton = () => {
    const buttons = [];
    for (let i = startPage; i < endPage; i++) {
      buttons.push(
        <li key={i}>
          <button
            onClick={() => setPageNumber(i)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 ${
              pageNumber === i
                ? "bg-emerald-600 text-white shadow-md"
                : "border border-neutral-300 bg-white text-neutral-700 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-600"
            }`}
          >
            {i}
          </button>
        </li>,
      );
    }
    return buttons;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Page info */}
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <span className="font-semibold text-neutral-900">
          Page {pageNumber} of {totalPage}
        </span>
        <span>•</span>
        <span>
          {totalItem} {totalItem === 1 ? "trip" : "trips"} total
        </span>
      </div>

      {/* Pagination controls */}
      <div className="flex justify-center">
        <ul className="flex items-center gap-2">
          {pageNumber > 1 && (
            <li>
              <button
                onClick={() => setPageNumber((pre) => pre - 1)}
                className="group flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition-all duration-200 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-600"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
              </button>
            </li>
          )}

          {startPage > 1 && (
            <>
              <li>
                <button
                  onClick={() => setPageNumber(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition-all duration-200 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  1
                </button>
              </li>
              {startPage > 2 && (
                <li>
                  <div className="flex h-10 w-10 items-center justify-center">
                    <MoreHorizontal className="h-5 w-5 text-neutral-400" />
                  </div>
                </li>
              )}
            </>
          )}

          {createButton()}

          {endPage < totalPage && (
            <>
              {endPage < totalPage - 1 && (
                <li>
                  <div className="flex h-10 w-10 items-center justify-center">
                    <MoreHorizontal className="h-5 w-5 text-neutral-400" />
                  </div>
                </li>
              )}
              <li>
                <button
                  onClick={() => setPageNumber(totalPage)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition-all duration-200 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  {totalPage}
                </button>
              </li>
            </>
          )}

          {pageNumber < totalPage && (
            <li>
              <button
                onClick={() => setPageNumber((pre) => pre + 1)}
                className="group flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition-all duration-200 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-600"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Pagination;
