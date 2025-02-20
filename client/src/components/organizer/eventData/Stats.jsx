import { useEffect } from "react";
import { useState } from "react";
import BarChart from "./BarChart";
import { Icon } from '@iconify/react';

// Import utilities
//import { tailwindConfig } from '../../utils/Utils';
import { tailwindConfig } from "../../dashboard/utils/Utils";
//"../../../pages/backOffice/admin/utils/Utils

const Stats = ({ data, structure }) => {
  const [chartData, setChartData] = useState();

  useEffect(() => {
    const calculateStatistics = async () => {
      let sectionsNames = [];
      let availableBySection = [];
      let selledBySection = [];
      for (let i = 0; i < structure.nonSeatedSections.length; i++) {
        sectionsNames.push(structure.nonSeatedSections[i].name);
        availableBySection.push(structure.nonSeatedSections[i].availableTickets);
        selledBySection.push(structure.nonSeatedSections[i].numTickets - structure.nonSeatedSections[i].availableTickets);
      }
      for (let i = 0; i < structure.seatedSections.length; i++) {
        sectionsNames.push(structure.seatedSections[i].name);
        availableBySection.push(structure.seatedSections[i].totalAvailableTickets);
        selledBySection.push(structure.seatedSections[i].totalNumTickets - structure.seatedSections[i].totalAvailableTickets);
      }
      makeGraph(sectionsNames, availableBySection, selledBySection);
    };

    calculateStatistics();
  }, []);

  const makeGraph = async (sectionsNames, availableBySection, selledBySection) => {
    let data = {
      labels: sectionsNames,
      datasets: [
        // Light blue bars
        {
          label: "Available",
          data: availableBySection,
          backgroundColor: tailwindConfig().theme.colors.blue[400],
          hoverBackgroundColor: tailwindConfig().theme.colors.blue[500],
          barPercentage: 0.66,
          categoryPercentage: 0.66,
        },
        // Blue bars
        {
          label: "Selled",
          data: selledBySection,
          backgroundColor: tailwindConfig().theme.colors.indigo[500],
          hoverBackgroundColor: tailwindConfig().theme.colors.indigo[600],
          barPercentage: 0.66,
          categoryPercentage: 0.66,
        },
      ],
    };
    setChartData(data);
  };

  return (
    <div className="sm:p-3">
      <div className="flex flex-col">
        <h3 className="mb-2 mt-4 text-lg font-medium leading-6 text-gray-900 dark:text-white">Last 30 days</h3>
        <dl className="mt-1 grid grid-cols-1 xxs:grid-cols-2 xxs:gap-3 sm:grid-cols-4 sm:gap-2">
          <div className="overflow-hidden rounded-lg bg-white p-1 px-2 py-3 shadow sm:p-4">
            <dt className="truncate text-sm font-medium text-gray-500 ">Available tickets</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900 ">{data.totalAvailableTickets}</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white p-1 px-2 py-3 shadow sm:p-4">
            <dt className="truncate text-sm font-medium text-gray-500">Total profit</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">{data.totalProfit}$</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white p-1 px-2 py-3 shadow sm:p-4">
            <dt className="truncate text-sm font-medium text-gray-500 ">Tickets sold</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">{data.totalAvailableTickets - data.totalNumTickets}</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white p-1 px-2 py-3 shadow sm:p-4">
            <dt className="truncate text-sm font-medium text-gray-500 ">Refund requests</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {/*TODO: UPDATE THIS*/}
              0%
            </dd>
          </div>
        </dl>
      </div>

      <div className=" mb-6 mt-2 flex w-full min-w-0 flex-col break-words rounded bg-white text-black shadow-lg">
        <div className="mb-0 rounded-t bg-transparent px-4 py-3">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full max-w-full flex-1 flex-grow">
              <h6 className="text-blueGray-400 mb-1 text-xs font-semibold uppercase text-black">Tickets selled</h6>
              <h2 className="text-blueGray-700 text-xl font-semibold text-black">By section</h2>
            </div>
          </div>
        </div>
        {chartData && (
          <div className="flex-auto p-4">
            {/* Chart */}
            <div className="h-350-px relative dark:text-gray-300">
              <BarChart data={chartData} width={595} height={248} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
