import React, { useState } from "react";
import ErrorModel from "../../generic/ErrorModal";

import { type } from "../../../pages/frontOffice/organizer/StructureIndex";
import { Navigate } from "react-router";

const Structure = ({
  setShowType,
  struct,
  setStructToDetail,
  deleteStruct,
  setIsCreating
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  function toggleDeleteModal() {
    setIsDeleteModalOpen(!isDeleteModalOpen);
  }

  return (
    <div
      className="my-4 w-full overflow-hidden bg-gray-100 shadow-lg hover:shadow-lg hover:shadow-gray-900/50 
        hover:shadow-gray-400/50 dark:bg-gray-600 sm:rounded-lg lg:w-5/12">
      {isDeleteModalOpen && (
        <ErrorModel
          tittle={"Delete all structure information"}
          message={
            "Do you want to delete all information about the structure? \n Once deleted there is no changes to recover "
          }
          onClick={() => {
            deleteStruct(struct);
          }}
          cancelBtnName={"Cancel"}
          submitBtnName={"Delete"}
          toggleModal={setIsDeleteModalOpen}
        />
      )}

      <div className="flex flex-wrap justify-between p-4 align-middle">
        <h3
          className="my-auto w-full text-center align-middle text-lg font-bold text-gray-900 dark:text-gray-300 sm:pr-14 sm:text-start 
                xl:w-fit">
          {struct.name}
        </h3>

        <div className="mt-4 flex w-full justify-center sm:justify-end lg:mt-0 xl:w-fit">
          <button
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 
                            text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-indigo-500 
                            focus:ring-offset-2 hover:bg-indigo-700"
            onClick={() => {
              window.location.href = `/app/organizer/structures/${struct.name}`;
            }}>
            Details
          </button>

          <div className="w-2"></div>

          <button
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-6 
                            text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-red-500 
                            focus:ring-offset-2 hover:bg-red-700"
            onClick={toggleDeleteModal}>
            Delete
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="wrap flex grid grid-cols-2 justify-between gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
              Total events
            </dt>
            <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-300">
              {struct.stats.totalEvents}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
              Creation date
            </dt>
            <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-300">
              {struct.stats.creationDate}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
              Total seats
            </dt>
            <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-300">
              {struct.stats.totalSeats}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
              Total sections
            </dt>
            <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-300">
              {struct.stats.totalSections}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default Structure;
