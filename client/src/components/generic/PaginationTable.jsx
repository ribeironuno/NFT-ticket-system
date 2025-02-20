import { useState } from "react";
import {
  ArrowCircleLeftIcon,
  ArrowCircleRightIcon,
  TrashIcon,
} from "@heroicons/react/outline";

/**
 * Table with pagination component
 *
 * @param {List<string>} headerValues the table header values ex:["name", "age"]
 * @param {List<T>} items the objects to be shown ex:[{name: "simao", age: "20"}]
 * @param {int} itemsPerPage number of items to be displayed ex:5
 * @param {string} filter string to filter data
 * @param {boolean} editMode if table is on editMode a trash icon button on each row will appear
 * @param {string} primaryKey the table primary key wich is the attribute where the filter will occur
 * @param {Function} handleDataUpdate function to be passed when the row is deleted
 */
const PaginationTable = ({
  headerValues,
  items,
  itemsPerPage,
  filter,
  editMode,
  primaryKey,
  handleDataUpdate,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  items = items.filter((item) => {
    const value = Object.keys(item).map((key) => {
      return item[key].includes(filter);
    });

    if (value.includes(true)) {
      return item;
    }
    return null;
  });

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = items.slice(firstItemIndex, lastItemIndex);
  const maxPage = Math.ceil(items.length / itemsPerPage);

  return (
    <div className="flex h-fit w-full flex-col items-center justify-center space-y-5 py-2 dark:bg-gray-700">
      <table className=" mx-auto h-fit w-full table-auto rounded-lg text-center dark:bg-gray-700">
        <thead className="text-xs font-bold uppercase text-gray-900 dark:text-white">
          <tr className="">
            {headerValues.map((value) => (
              <th scope="col" className="py-3 px-6">
                {value}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-xs font-medium text-gray-900">
          {currentItems.map((item) => {
            return (
              <tr className="bg-gray-50 even:bg-white dark:bg-gray-600 even:dark:bg-gray-700">
                {Object.keys(item).map((key) => (
                  <td className="break-all py-2 px-4 dark:text-white">
                    {item[key]}
                  </td>
                ))}
                {editMode ? (
                  <td className="w-1/5 px-0 md:w-fit md:px-6">
                    <button
                      className="hover rounded-md border bg-red-600 p-px text-white hover:bg-red-800 dark:border-gray-700"
                      onClick={() =>
                        handleDataUpdate("delete", item[primaryKey])
                      }
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>

      {currentItems.length === 0 ? (
        <span className="w-full text-center dark:text-white">
          No items to display
        </span>
      ) : null}

      <div className="flex flex-row items-center justify-center space-x-3 align-middle">
        <button
          disabled={currentPage === 1}
          className="rounded-lg text-black disabled:text-gray-200 enabled:hover:bg-gray-200 dark:text-white dark:disabled:text-gray-600 dark:enabled:hover:bg-gray-500"
          onClick={() => {
            setCurrentPage(currentPage - 1);
          }}
        >
          <ArrowCircleLeftIcon className="h-5 w-5" />
        </button>

        <span className="dark:text-white">
          {currentItems.length === 0 ? "0" : currentPage} of {maxPage}
        </span>
        <button
          disabled={currentItems.length === 0 ? true : currentPage === maxPage}
          className="rounded-lg text-black disabled:text-gray-200 enabled:hover:bg-gray-200 dark:text-white dark:disabled:text-gray-600 dark:enabled:hover:bg-gray-500"
          onClick={() => {
            setCurrentPage(currentPage + 1);
            /* NOT WORKING
              var el = document.getElementById("accordion-body");
              el.scrollTop = el.scrollHeight;
              */
          }}
        >
          <ArrowCircleRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default PaginationTable;
