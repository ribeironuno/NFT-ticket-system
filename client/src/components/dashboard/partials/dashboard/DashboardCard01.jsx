import React from "react";
import LineChart from "../../charts/LineChart01";
import Icon from "../../images/icon-01.svg";

// Import utilities
import { tailwindConfig, hexToRGB } from "../../utils/Utils";

function DashboardCard01(props) {
  let title = props.title;
  let value = props.value;
  let percentage = props.percentage;

  const chartData = {
    labels: [
      "01-01-2023",
      "05-01-2023",
      "10-01-2023",
      "15-01-2023",
      "20-01-2023",
      "25-01-2023",
      "31-01-2023",
    ],
    datasets: [
      // Indigo line
      {
        data: [
          732, 610, 610, 504, 504, 504, 700
        ],
        fill: true,
        backgroundColor: `rgba(${hexToRGB(
          tailwindConfig().theme.colors.blue[500]
        )}, 0.08)`,
        borderColor: tailwindConfig().theme.colors.indigo[500],
        borderWidth: 2,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: tailwindConfig().theme.colors.indigo[500],
        clip: 20,
      }
    ],
  };

  return (
    <div className="col-span-full flex flex-col rounded-sm border border-slate-200 bg-white shadow-lg dark:bg-gray-400 sm:col-span-6 xl:col-span-4">
      <div className="px-5 pt-5">
        <header className="mb-2 flex items-start justify-between">
          {/* Icon */}
          <img src={Icon} width="32" height="32" alt="Icon 01" />
        </header>
        <h2 className="mb-2 text-lg font-semibold text-slate-800">{title}</h2>
        <div className="mb-1 text-xs font-semibold uppercase text-slate-400"></div>
        <div className="flex items-start">
          <div className="mr-2 text-3xl font-bold text-slate-800">{value}</div>
          <div className="rounded-full bg-green-500 px-1.5 text-sm font-semibold text-white">
            {percentage}
          </div>
        </div>
      </div>
      {/* Chart built with Chart.js 3 */}
      <div className="grow">
        {/* Change the height attribute to adjust the chart height */}
        <LineChart data={chartData} width={389} height={128} />
      </div>
    </div>
  );
}

export default DashboardCard01;
