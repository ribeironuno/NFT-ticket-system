import { Line } from "react-chartjs-2";
import { useState, useEffect } from "react";
import ReactLoading from "react-loading";
import constants from "../../../configs/constants";
import {
  ArrowUpIcon,
  CashIcon,
  StarIcon,
  EyeIcon,
  PresentationChartLineIcon,
  EmojiHappyIcon,
} from "@heroicons/react/outline";
import Chart from "chart.js/auto";

const generateLineChartData = (datasets) => {
  var result = {};

  result.labels = ["05", "10", "15", "20", "25", "30"];
  var resultDatasets = [];

  datasets.forEach((dataset) => {
    resultDatasets.push({
      label: dataset.label,
      fill: false,
      lineTension: 0.1,
      backgroundColor: dataset.backgroundColor,
      borderColor: dataset.borderColor,
      borderCapStyle: "butt",
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: "miter",
      pointBorderColor: dataset.pointBorderColor,
      pointBackgroundColor: "#fff",
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: dataset.pointHoverBackgroundColor,
      pointHoverBorderColor: "rgba(220,220,220,1)",
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: dataset.values,
    });
  });
  result.datasets = resultDatasets;
  return result;
};

const options = {
  responsive: true,
  scales: {
    x: {
      border: {
        color: "#cacaca",
      },
      grid: {
        display: false,
      },
    },
    y: {
      border: {
        color: "#cacaca",
      },
      grid: {
        display: false,
      },
    },
  },
};

const Dashboard = () => {
  const [monthProfitChart, setMonthProfitChart] = useState([]);
  const [profitDisplay, setProfitDisplay] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [profit, setProfit] = useState({});
  const [totalTickets, setTotalTickets] = useState();
  const [bestPerformEvent, setBestPerformEvent] = useState({});
  const [eventStatusOverview, setEventStatusOverview] = useState([]);
  const [totalEvents, setTotalEvents] = useState();
  const [maticPrice, setMaticPrice] = useState(null);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const url = constants.URL_ORGANIZERS;

  useEffect(() => {
    setIsLoading(true);
    fetch(url + `getOrganizerStatistics`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        setIsLoading(false);
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        setMonthProfitChart(data.month_profit);
        setProfit(data.profit);
        setTotalTickets(data.total_tickets);
        setBestPerformEvent(data.best_event_position);
        setEventStatusOverview(data.events_status);
        setTotalEvents(data.number_events_all);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err.message);
      });
  }, []);

  useEffect(() => {
    fetch(
      "https://min-api.cryptocompare.com/data/price?fsym=MATIC&tsyms=EUR&api_key=75f02885dbeb28e0b3246d853c034710651551458928107c735e28b37afbe814"
    )
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        setMaticPrice(data.EUR);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <div className="flex h-fit flex-col items-center justify-between rounded-md border p-3 shadow-lg dark:bg-gray-800">
        <div className="mb-8 flex flex-row space-x-2 self-start">
          <PresentationChartLineIcon className="w-6 dark:text-white" />
          <span className=" text-xl font-bold dark:text-white">
            {months[new Date().getMonth()]} MATIC profit
          </span>
        </div>
        {isLoading === true ? (
          <div className="flex h-44 flex-wrap items-center justify-center">
            <ReactLoading
              type={"bubbles"}
              height={100}
              width={120}
              color={"#5b2bab"}
            />
            <span className="mb-4 w-full self-start text-center text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">
              Loading
            </span>
          </div>
        ) : monthProfitChart.length !== 0 ? (
          <Line
            options={options}
            responsive="true"
            data={generateLineChartData([
              {
                label: monthProfitChart[0].label,
                values: monthProfitChart[0].values,
                pointBorderColor: "#4495e2",
                pointHoverBackgroundColor: "#4495e2",
                borderColor: "#4495e2",
                backgroundColor: "#4495e2",
              },
              {
                label: monthProfitChart[1].label,
                values: monthProfitChart[1].values,
                pointBorderColor: "#8044e2",
                pointHoverBackgroundColor: "#8044e2",
                borderColor: "#8044e2",
                backgroundColor: "#8044e2",
              },
            ])}
          />
        ) : (
          <div className="flex h-44 w-full items-center justify-center">
            <span>Unable to fetch data...</span>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center justify-between rounded-md border p-3 shadow-lg dark:bg-gray-800">
        <div className="flex flex-row space-x-2 self-start">
          <CashIcon className="w-6 dark:text-white" />
          <span className=" text-xl font-bold dark:text-white">Profit</span>
        </div>
        {isLoading === true ? (
          <div className="flex flex-wrap items-center justify-center">
            <ReactLoading
              type={"bubbles"}
              height={100}
              width={120}
              color={"#5b2bab"}
            />
            <span className="mb-4 w-full self-start text-center text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">
              Loading
            </span>
          </div>
        ) : profit.year === undefined || profit.all === undefined ? (
          <span>Unable to fetch data...</span>
        ) : (
          <div className="my-14 flex flex-col items-center justify-center space-y-3 md:m-0">
            <div className="flex flex-row items-center justify-center">
              <span className="text-4xl text-gray-800 dark:text-gray-100 lg:text-6xl">
                {profitDisplay === "year"
                  ? profit.year.substring(0, 12)
                  : profit.all.substring(0, 12)}
              </span>
              <img
                className="mt-3 w-8 lg:w-12"
                src={require("../../../assets/images/polygon.png")}
                alt=""></img>
            </div>
            <span className="text-base text-gray-800 dark:text-gray-100 lg:text-xl">
              (
              {maticPrice != null && profitDisplay === "year"
                ? (parseFloat(profit.year) * maticPrice)
                    .toFixed(2)
                    .toString()
                    .substring(0, 12) + " €"
                : maticPrice != null
                ? (parseFloat(profit.all) * maticPrice)
                    .toFixed(2)
                    .toString()
                    .substring(0, 12) + " €"
                : null}
              )
            </span>
          </div>
        )}
        <div className="flex w-32 flex-row">
          <button
            onClick={() => setProfitDisplay("year")}
            className={
              profitDisplay === "year"
                ? "w-16 border-collapse rounded-lg bg-indigo-500 text-white"
                : "w-16 border-collapse rounded-lg text-black dark:text-gray-400"
            }>
            Year
          </button>
          <button
            onClick={() => setProfitDisplay("all")}
            className={
              profitDisplay === "all"
                ? "w-16 border-collapse rounded-lg bg-indigo-500 text-white"
                : "w-16 border-collapse rounded-lg text-black dark:text-gray-400"
            }>
            All
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center rounded-md border p-3 shadow-lg dark:bg-gray-800">
        <div className="flex flex-row space-x-2 self-start">
          <ArrowUpIcon className="w-6 dark:text-white" />
          <span className=" text-xl font-bold dark:text-white">
            Total tickets sold
          </span>
        </div>
        {isLoading === true ? (
          <div className="flex flex-wrap items-center justify-center">
            <ReactLoading
              type={"bubbles"}
              height={100}
              width={120}
              color={"#5b2bab"}
            />
            <span className="mb-4 w-full self-start text-center text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">
              Loading
            </span>
          </div>
        ) : totalTickets === undefined ? (
          <div className="flex h-full w-full items-center justify-center dark:text-gray-300">
            <span>Unable to fetch data...</span>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center ">
            <span className="my-14 text-4xl text-gray-800 dark:text-gray-100 md:m-0 lg:text-6xl">
              {totalTickets}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center rounded-md border p-3 shadow-lg dark:bg-gray-800">
        <div className="flex flex-row space-x-2 self-start">
          <StarIcon className="w-6 dark:text-white" />
          <span className=" text-xl font-bold dark:text-white">
            Your best performing event
          </span>
        </div>
        {isLoading === true ? (
          <div className="flex flex-wrap items-center justify-center">
            <ReactLoading
              type={"bubbles"}
              height={100}
              width={120}
              color={"#5b2bab"}
            />
            <span className="mb-4 w-full self-start text-center text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">
              Loading
            </span>
          </div>
        ) : bestPerformEvent.event_name === undefined ||
          bestPerformEvent.sold_tickets === undefined ||
          bestPerformEvent.position === undefined ? (
          <div className="flex h-full w-full items-center justify-center dark:text-gray-300">
            <span>Unable to fetch data...</span>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center space-y-3">
            <span className="text-2xl text-gray-800 dark:text-gray-100 md:m-0 lg:text-5xl">
              {bestPerformEvent.event_name}
            </span>
            <span className="text-2xl text-gray-800 dark:text-gray-100 md:m-0 lg:text-3xl">
              Rank #{bestPerformEvent.position}
            </span>
            <span className="text-2xl text-gray-800 dark:text-gray-100 md:m-0 lg:text-2xl">
              {bestPerformEvent.sold_tickets} tickets sold
            </span>
          </div>
        )}
      </div>
      <div className="flex h-80 flex-col items-center rounded-md border p-3 shadow-lg dark:bg-gray-800">
        <div className="mb-4 flex flex-row space-x-2 self-start">
          <EyeIcon className="w-6 dark:text-white" />
          <span className="text-xl font-bold dark:text-white">
            Events status overview
          </span>
        </div>
        {isLoading === true ? (
          <div className="flex flex-wrap items-center justify-center">
            <ReactLoading
              type={"bubbles"}
              height={100}
              width={120}
              color={"#5b2bab"}
            />
            <span className="mb-4 w-full self-start text-center text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">
              Loading
            </span>
          </div>
        ) : eventStatusOverview.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center dark:text-gray-300">
            <span>Unable to fetch data...</span>
          </div>
        ) : (
          <table className="w-full table-auto ">
            <thead>
              <tr className="text-center">
                <th className="px-4 py-2 dark:text-gray-100">Status</th>
                <th className="px-4 py-2 dark:text-gray-100">Nº of events</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b text-center">
                <td className="px-4 py-2 dark:text-gray-200">Not minted</td>
                <td className="px-4 py-2 dark:text-gray-200">
                  {eventStatusOverview[0]}
                </td>
              </tr>
              <tr className="border-b text-center">
                <td className="px-4 py-2 dark:text-gray-200">Minted</td>
                <td className="px-4 py-2 dark:text-gray-200">
                  {eventStatusOverview[1]}
                </td>
              </tr>
              <tr className="border-b text-center">
                <td className="px-4 py-2 dark:text-gray-200">Half minted</td>
                <td className="px-4 py-2 dark:text-gray-200">
                  {eventStatusOverview[2]}
                </td>
              </tr>
              <tr className="border-b text-center">
                <td className="px-4 py-2 dark:text-gray-200">Canceled</td>
                <td className="px-4 py-2 dark:text-gray-200">
                  {eventStatusOverview[3]}
                </td>
              </tr>
              <tr className="border-b text-center">
                <td className="px-4 py-2 dark:text-gray-200">Critical</td>
                <td className="px-4 py-2 dark:text-gray-200">
                  {eventStatusOverview[4]}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
      <div className="flex flex-col items-center rounded-md border p-3 shadow-lg dark:bg-gray-800">
        <div className="flex flex-row space-x-2 self-start">
          <EmojiHappyIcon className="w-6 dark:text-white" />
          <span className=" text-xl font-bold dark:text-white">
            Total events
          </span>
        </div>
        {isLoading === true ? (
          <div className="flex flex-wrap items-center justify-center">
            <ReactLoading
              type={"bubbles"}
              height={100}
              width={120}
              color={"#5b2bab"}
            />
            <span className="mb-4 w-full self-start text-center text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">
              Loading
            </span>
          </div>
        ) : totalEvents === undefined ? (
          <div className="flex h-full w-full items-center justify-center dark:text-gray-300">
            <span>Unable to fetch data...</span>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center ">
            <span className="my-14 text-4xl text-gray-800 dark:text-gray-100 md:m-0 lg:text-6xl">
              {totalEvents}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
