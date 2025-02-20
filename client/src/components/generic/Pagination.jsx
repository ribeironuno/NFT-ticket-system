import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";

const Pagination = ({ items, itemsPerPage, filter }) => {
  const [currentPage, setCurrentPage] = useState(1);

  items = items.filter((item) => {
    if (item.props.name.toLowerCase().includes(filter.toLowerCase())) {
      return item;
    }
    return null;
  });

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = items.slice(firstItemIndex, lastItemIndex);
  const maxPage = Math.ceil(items.length / itemsPerPage);

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="flex w-full flex-col items-center justify-center space-y-10">
        {currentItems.length === 0 ? (
          <span className="dark:text-white">No items to display</span>
        ) : null}
        {currentItems.map((item) => item)}
      </div>
      <div className="flex flex-row items-center justify-center space-x-4 align-middle  ">
        <button
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
            setCurrentPage(currentPage - 1);
          }}
          disabled={currentPage === 1}
          className=" disabled:text-gray-400 enabled:hover:scale-110 dark:text-white dark:disabled:disabled:text-gray-600">
          <ChevronLeftIcon className="w-5" />
        </button>

        <span className="dark:text-white">
          {currentItems.length === 0 ? "0" : currentPage} of {maxPage}
        </span>

        <button
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
            setCurrentPage(currentPage + 1);
          }}
          disabled={currentItems.length === 0 ? true : currentPage === maxPage}
          className="disabled:text-gray-400 enabled:hover:scale-110 dark:text-white dark:disabled:disabled:text-gray-600">
          <ChevronRightIcon className="w-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
