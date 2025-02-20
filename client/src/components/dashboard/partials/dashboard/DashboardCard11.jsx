import React from "react";
import BarChart from "../../charts/BarChart03";

// Import utilities
import { tailwindConfig } from "../../utils/Utils";

function DashboardCard11(props) {
  let title = props.title;
  let value = props.value;
  let percentage = props.percentage;

  const chartData = {
    labels: ["Reasons"],
    datasets: [
      {
        label: "High rate of contagion of the Covid-19",
        data: [131],
        backgroundColor: tailwindConfig().theme.colors.indigo[500],
        bg: "bg-indigo-500",
        hoverBackgroundColor: tailwindConfig().theme.colors.indigo[600],
        barPercentage: 1,
        categoryPercentage: 1,
      },
      {
        label: "Lower-than-expected ticket sales",
        data: [100],
        backgroundColor: tailwindConfig().theme.colors.indigo[800],
        bg: "bg-indigo-800",
        hoverBackgroundColor: tailwindConfig().theme.colors.indigo[900],
        barPercentage: 1,
        categoryPercentage: 1,
      },
      {
        label: "Problems with main attractions",
        data: [81],
        backgroundColor: tailwindConfig().theme.colors.sky[400],
        bg: "bg-sky-400",
        hoverBackgroundColor: tailwindConfig().theme.colors.sky[500],
        barPercentage: 1,
        categoryPercentage: 1,
      },
      {
        label: "Non-compliance with laws",
        data: [65],
        backgroundColor: tailwindConfig().theme.colors.green[400],
        bg: "bg-green-400",
        hoverBackgroundColor: tailwindConfig().theme.colors.green[500],
        barPercentage: 1,
        categoryPercentage: 1,
      },
      {
        label: "Other",
        data: [72],
        backgroundColor: tailwindConfig().theme.colors.slate[200],
        bg: "bg-slate-200",
        hoverBackgroundColor: tailwindConfig().theme.colors.slate[300],
        barPercentage: 1,
        categoryPercentage: 1,
      },
    ],
  };

  return (
    <div className="col-span-full rounded-sm border border-slate-200 bg-white shadow-lg dark:bg-gray-400 xl:col-span-6">
      <header className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-800">{title}</h2>
      </header>
      <div className="px-5 py-3">
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
        <BarChart data={chartData} width={595} height={48} />
      </div>
    </div>
  );
}

export default DashboardCard11;
