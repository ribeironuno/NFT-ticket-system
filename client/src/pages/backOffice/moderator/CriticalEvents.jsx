import { SearchIcon } from "@heroicons/react/outline";
import { Pagination } from "../../../components";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import constants from "../../../configs/constants";
import ReactLoading from "react-loading";

const Event = ({ bannerURL, date, name, location, eventId }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() =>
        navigate(`/app/back-office/moderator/criticalEvent?eventId=${eventId}`)
      }
      className={`flex min-h-fit w-full flex-col items-center justify-center rounded-md bg-cover bg-center p-0 text-left text-white duration-300 ease-in-out hover:scale-[1.01] hover:cursor-pointer sm:p-2 lg:flex-row lg:p-5`}
      style={{ backgroundImage: `url(${bannerURL})` }}>
      <div className="my-2 flex h-fit w-full flex-row items-center justify-between align-middle lg:mx-10">
        <div className="flex w-2/3 flex-col space-y-1 rounded-md bg-black bg-opacity-90 p-3 md:w-1/3 lg:p-2">
          <div className="flex flex-row items-center space-x-1">
            <span className="text-xs font-bold text-gray-300 md:text-sm">
              Event:
            </span>
            <span className="text-xs font-normal text-gray-300 md:text-base">
              {name}
            </span>
          </div>
          <div className="flex flex-row items-center space-x-1">
            <span className="text-xs font-bold text-gray-300 md:text-sm">
              Date:
            </span>
            <span className="text-xs font-normal text-gray-300 md:text-base">
              {date}
            </span>
          </div>
          <div className="flex flex-row items-center space-x-1">
            <span className="text-xs font-bold text-gray-300 md:text-sm">
              Location:
            </span>
            <span className="text-xs font-normal text-gray-300 md:text-base">
              {location}
            </span>
          </div>
        </div>
        {/* VIEW DETAILS */}
        <div className="flex w-fit flex-row items-center justify-center space-x-2 align-middle">
          <span className="whitespace-nowrap text-base lg:text-2xl">
            View details
          </span>
          <SearchIcon className="w-5 lg:w-7" />
        </div>
      </div>
    </div>
  );
};

const CriticalEvents = () => {
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const eventsURL = constants.URL_EVENTS;

  useEffect(() => {
    setIsLoading(true);
    fetch(eventsURL + `getOrganizerCriticalEvents`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        console.log(data);
        setIsLoading(false);
        setEvents(data);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  }, []);

  const handleItemsPerPage = (event) => {
    setItemsPerPage(event.target.value);
  };

  const handleFilter = (event) => {
    setFilter(event.target.value);
  };

  return (
    <div className="flex min-h-[calc(100vh-425px)] flex-col space-y-7 dark:bg-gray-900 sm:min-h-[calc(100vh-377px)] md:min-h-[calc(100vh-286px)]">
      <span className="font-extrabold tracking-tight dark:text-white xxs:text-lg lg:text-3xl xl:text-4xl">
        Critical Events
      </span>
      <div className="flex w-full flex-row justify-center space-x-2 md:justify-end">
        <input
          placeholder="Type to filter..."
          type="text"
          className="h-full w-48 rounded-lg border border-gray-300 p-1 text-sm font-light text-gray-600 transition duration-300 focus:ring-indigo-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-600 dark:text-white dark:placeholder:text-gray-400 dark:hover:bg-gray-800"
          onClick={(event) => {
            event.stopPropagation();
          }}
          onChange={handleFilter}
        />
        <select
          onChange={handleItemsPerPage}
          onClick={(event) => {
            event.stopPropagation();
          }}
          className="w-12 rounded-lg border border-gray-300 bg-white p-1 text-sm text-gray-900 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-600 dark:text-white dark:focus:border-indigo-500">
          <option value={3}>3</option>
          <option value={5}>5</option>
          <option value={7}>7</option>
        </select>
      </div>
      {isLoading ? (
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
      ) : events.length === 0 ? (
        <div className="mt-10 flex w-full text-lg font-medium dark:text-white justify-center">
          No events to display
        </div>
      ) : (
        <Pagination
          items={events.map((event) => (
            <Event
              bannerURL={
                constants.SERVER_URL + "/" + event.banner.replace(/\\/g, "/")
              }
              date={event.datesInfo.startDate.dayMonthYear}
              location={event.location + ", " + event.country}
              name={event.eventName}
              eventId={event.eventId}
            />
          ))}
          itemsPerPage={itemsPerPage}
          filter={filter}
        />
      )}
    </div>
  );
};

export default CriticalEvents;
