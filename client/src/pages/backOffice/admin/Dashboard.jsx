import { Line, Pie } from "react-chartjs-2";
import { useState, useEffect } from "react";
import constants from "../../../configs/constants";
import ReactLoading from "react-loading";
import {
  CubeTransparentIcon,
  CashIcon,
  FireIcon,
  UserGroupIcon,
  PresentationChartLineIcon,
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

const key = "NGUDFNSZ5Z9UN8G9DJSED5FRJJ52499FX4";
const contractAddress = constants.CONTRACT_ADDRESS;

const generatePieChartData = (dataset) => {
  return {
    labels: ["Music", "Sports", "Comedy", "Theatre", "Cinema", "Others"],
    datasets: [
      {
        data: dataset,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#72ea3e",
          "#cc0000",
          "#073763",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#72ea3e",
          "#cc0000",
          "#073763",
        ],
      },
    ],
  };
};

const Dashboard = () => {
  const [profitDisplay, setProfitDisplay] = useState("all");
  const [organizersDisplay, setOrganizersDisplay] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);
  const [monthProfitChart, setMonthProfitChart] = useState([]);
  const [eventsCategoryChart, setEventsCategoryChart] = useState([]);
  const [profit, setProfit] = useState({});
  const [organizers, setOrganizers] = useState({});
  const [transactions, setTransactions] = useState(null);
  const [topEvents, setTopEvents] = useState([]);
  const [maticPrice, setMaticPrice] = useState(null);
  const url = constants.URL_BACKOFFICE;
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

  useEffect(() => {
    setIsLoading(true);
    fetch(url + `getAdminStatistics`, {
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
        setOrganizers(data.organizers);
        setEventsCategoryChart(data.events_category);
        setTopEvents(data.top_events);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err.message);
      });
  }, []);

  useEffect(() => {
    setIsLoadingExternal(true);
    fetch(
      `https://api-testnet.polygonscan.com/api?module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=${key}`
    )
      .then((res) => {
        setIsLoadingExternal(false);
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        setTransactions(data.result);
      })
      .catch((err) => {
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
            {months[new Date().getMonth()]} MATIC volume
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
            <span className="dark:text-gray-300">Unable to fetch data...</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-between rounded-md border p-3 shadow-lg dark:bg-gray-800">
        <div className="flex flex-row space-x-2 self-start">
          <CashIcon className="w-6 dark:text-white" />
          <span className=" text-xl font-bold dark:text-white">
            MATIC volume
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
        ) : profit.year === undefined || profit.all === undefined ? (
          <span className="dark:text-gray-300">Unable to fetch data...</span>
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

      <div className="flex flex-col items-center justify-between rounded-md border p-3 shadow-lg dark:bg-gray-800">
        <div className="flex flex-row space-x-2 self-start">
          <UserGroupIcon className="w-6 dark:text-white" />
          <span className=" text-xl font-bold dark:text-white">Organizers</span>
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
        ) : organizers.year === undefined ||
          organizers.all === undefined ||
          organizers.month === undefined ? (
          <span className="dark:text-gray-300">Unable to fetch data...</span>
        ) : (
          <span className="my-14 text-4xl text-gray-800 dark:text-gray-100 md:m-0 lg:text-6xl">
            {organizersDisplay === "year"
              ? organizers.year
              : organizersDisplay === "month"
              ? organizers.month
              : organizers.all}
          </span>
        )}

        <div className="flex w-48 flex-row">
          <button
            onClick={() => setOrganizersDisplay("month")}
            className={
              organizersDisplay === "month"
                ? "w-16 border-collapse rounded-lg bg-indigo-500 text-white"
                : "w-16 border-collapse rounded-lg text-black dark:text-gray-400"
            }>
            Month
          </button>
          <button
            onClick={() => setOrganizersDisplay("year")}
            className={
              organizersDisplay === "year"
                ? "w-16 border-collapse rounded-lg bg-indigo-500 text-white"
                : "w-16 border-collapse rounded-lg text-black dark:text-gray-400"
            }>
            Year
          </button>
          <button
            onClick={() => setOrganizersDisplay("all")}
            className={
              organizersDisplay === "all"
                ? "w-16 border-collapse rounded-lg bg-indigo-500 text-white"
                : "w-16 border-collapse rounded-lg text-black dark:text-gray-400"
            }>
            All
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center rounded-md border p-3 shadow-lg dark:bg-gray-800">
        <div className="mb-8 flex flex-row space-x-2 self-start">
          <PresentationChartLineIcon className="w-6 dark:text-white" />
          <span className=" text-xl font-bold dark:text-white">
            Events p/category
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
        ) : eventsCategoryChart.length !== 0 ? (
          <div className="h-60">
            <Pie data={generatePieChartData(eventsCategoryChart)} />
          </div>
        ) : (
          <div className="flex h-44 w-full items-center justify-center">
            <span className="dark:text-gray-300">Unable to fetch data...</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-5 rounded-md border p-3 shadow-lg dark:bg-gray-800">
        <div className="flex flex-row space-x-2 self-start">
          <CubeTransparentIcon className="w-6 dark:text-white" />
          <span className=" text-xl font-bold dark:text-white">
            Smart Contract
          </span>
        </div>
        {isLoadingExternal === true ? (
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
        ) : transactions == null ? (
          <div className="flex h-44 w-full items-center justify-center">
            <span className="dark:text-gray-300">Unable to fetch data...</span>
          </div>
        ) : transactions.length !== 0 ? (
          <table className="w-full table-auto ">
            <thead>
              <tr className="text-center">
                <th className="px-4 py-2 dark:text-gray-100">Date</th>
                <th className="px-4 py-2 dark:text-gray-100">Hash</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr className="border-b text-center">
                  <td className="px-4 py-2 dark:text-gray-200">
                    {new Date(transaction.timeStamp * 1000).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <a
                      className="text-blue-400 underline"
                      href={"https://mumbai.polygonscan.com/tx/" + transaction.hash}
                      target="_blank"
                      rel="noreferrer">
                      {transaction.hash.substring(0, 20) + "..."}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex h-44 w-full items-center justify-center">
            <span className="dark:text-gray-300">
              Smart contract has 0 transactions
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center space-y-5 rounded-md border p-3 shadow-lg dark:bg-gray-800">
        <div className="flex flex-row space-x-2 self-start">
          <FireIcon className="w-6 dark:text-white" />
          <span className=" text-xl font-bold dark:text-white">
            Top selling events
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
        ) : topEvents.length !== 0 ? (
          <table className="w-full table-auto ">
            <thead>
              <tr className="text-center dark:text-gray-100">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Tickets sold</th>
              </tr>
            </thead>
            <tbody>
              {topEvents.map((event, index) => (
                <tr className="border-b text-center">
                  <td className="px-4 py-2 dark:text-gray-200">{index + 1}</td>
                  <td className="px-4 py-2 dark:text-gray-200">
                    {event.event_name}
                  </td>
                  <td className="px-4 py-2 dark:text-gray-200">
                    {event.number_tickets}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex h-44 w-full items-center justify-center">
            <span className="dark:text-gray-300">Unable to fetch data...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
