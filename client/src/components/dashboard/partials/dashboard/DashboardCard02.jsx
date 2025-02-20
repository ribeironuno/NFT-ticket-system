import React from "react";
import LineChart from "../../charts/LineChart01";
import Icon from "../../images/icon-02.svg";

// Import utilities
import { tailwindConfig, hexToRGB } from "../../utils/Utils";

function DashboardCard02(props) {
  let title = props.title;
  let value = props.value;
  let percentage = props.percentage;

  const chartData = {
    labels: [
      "12-01-2020",
      "01-01-2021",
      "02-01-2021",
      "03-01-2021",
      "04-01-2021",
      "05-01-2021",
      "06-01-2021",
      "07-01-2021",
      "08-01-2021",
      "09-01-2021",
      "10-01-2021",
      "11-01-2021",
      "12-01-2021",
      "01-01-2022",
      "02-01-2022",
      "03-01-2022",
      "04-01-2022",
      "05-01-2022",
      "06-01-2022",
      "07-01-2022",
      "08-01-2022",
      "09-01-2022",
      "10-01-2022",
      "11-01-2022",
      "12-01-2022",
      "01-01-2023",
    ],
    datasets: [
      // Indigo line
      {
        data: [
          622, 622, 426, 471, 365, 365, 238, 324, 288, 206, 324, 324, 500, 409,
          409, 273, 232, 273, 500, 570, 767, 808, 685, 767, 685, 685,
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
      },
      // Gray line
      {
        data: [
          732, 610, 610, 504, 504, 504, 349, 349, 504, 342, 504, 610, 391, 192,
          154, 273, 191, 191, 126, 263, 349, 252, 423, 622, 470, 532,
        ],
        borderColor: tailwindConfig().theme.colors.slate[300],
        borderWidth: 2,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: tailwindConfig().theme.colors.slate[300],
        clip: 20,
      },
    ],
  };

  return (
    <div className="col-span-full flex flex-col rounded-sm border border-slate-200 bg-white shadow-lg dark:bg-gray-400 sm:col-span-6 xl:col-span-4">
      <div className="px-5 pt-5">
        <header className="mb-2 flex items-start justify-between">
          {/* Icon */}
          <img src={Icon} width="32" height="32" alt="Icon 02" />
        </header>
        <h2 className="mb-2 text-lg font-semibold text-slate-800">{title}</h2>
        <div className="mb-1 text-xs font-semibold uppercase text-slate-400"></div>
        <div className="flex items-start">
          <div className="mr-2 text-3xl font-bold text-slate-800">{value}</div>
          <div className="rounded-full bg-yellow-500 px-1.5 text-sm font-semibold text-white">
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

export default DashboardCard02;
