import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";

const Pagination = ({
  pageNumber,
  setPageNumber,
  totalItem,
  parPage,
  showItem,
}) => {
  const totalPage = Math.ceil(totalItem / parPage);

  // Don't show pagination if there's only one page
  if (totalPage <= 1) {
    return null;
  }

  let startPage = Math.max(1, pageNumber - Math.floor(showItem / 2));
  let endPage = startPage + showItem - 1;
  if (endPage > totalPage) {
    endPage = totalPage;
    startPage = Math.max(1, endPage - showItem + 1);
  }

  const createButton = () => {
    const buttons = [];
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <li
          onClick={() => setPageNumber(i)}
          className={`${
            pageNumber === i
              ? "scale-110 bg-gradient-to-r from-secondary to-sunshine-400 text-white shadow-lg"
              : "bg-white text-text-dark ring-1 ring-primary-200 hover:scale-105 hover:bg-gradient-to-r hover:from-secondary hover:to-sunshine-400 hover:text-white"
          } flex h-9 w-9 cursor-pointer items-center justify-center rounded-full font-medium transition-all duration-300`}
          key={i}
        >
          <button>{i}</button>
        </li>,
      );
    }
    return buttons;
  };

  return (
    <ul className="flex gap-2">
      {pageNumber > 1 && (
        <li
          onClick={() => setPageNumber(pageNumber - 1)}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-primary-700 ring-1 ring-primary-200 transition-all duration-300 hover:scale-105 hover:bg-primary-700 hover:text-white"
        >
          <MdOutlineKeyboardDoubleArrowLeft />
        </li>
      )}
      {createButton()}
      {pageNumber < totalPage && (
        <li
          onClick={() => setPageNumber(pageNumber + 1)}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-primary-700 ring-1 ring-primary-200 transition-all duration-300 hover:scale-105 hover:bg-primary-700 hover:text-white"
        >
          <MdOutlineKeyboardDoubleArrowRight />
        </li>
      )}
    </ul>
  );
};

export default Pagination;
