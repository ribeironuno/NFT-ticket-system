import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import classNames from "classnames";
import { Fragment, useState, useRef, useEffect } from "react";
import { ItemList } from "../../../components";
import constants from "../../../configs/constants";
import ReactLoading from "react-loading";

const Events = () => {
  //obj demo
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const dataFetchedRef = useRef(false);

  const url = constants.URL_EVENTS;

  //GET information account of organizer
  const fetchData = () => {
    fetch(url + `getOrganizerEvents`, {
      method: "GET",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        setIsLoading(false);
        console.log(res);
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        setEvents(data);
        console.log(data);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err.message);
      });
  };

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetchData();
  }, []);

  console.log(events);

  const [menu, setMenu] = useState("all");

  return (
    <div id="mainDiv" className="min-h-screen w-full flex-col space-y-5 sm:space-y-10">
      <span className="float-left font-extrabold tracking-tight dark:text-white xxs:text-lg lg:text-3xl xl:text-4xl">My events</span>
      <div className="flex w-full animate-fade-in-down flex-row justify-end space-x-5">
        <div className="w-30 float-right">
          <a href="/app/organizer/create-event" id="createEventButton" rel="create new event" className="relative inline-block text-left duration-300 ease-in-out hover:scale-[1.05]">
            <button
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 
            text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 
            focus:ring-offset-2 hover:bg-indigo-700"
            >
              Create new event
            </button>
          </a>
        </div>
        <div className="w-30 float-right">
          {events.length !== 0 && (
            <Menu as="div" className="relative inline-block text-left duration-300 ease-in-out hover:scale-[1.05]">
              <div>
                <Menu.Button
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 
            text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 
            focus:ring-offset-2 hover:bg-indigo-700"
                >
                  Status
                  <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-40 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hover:cursor-pointer dark:border-gray-700 dark:bg-gray-600 dark:text-white">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          className={classNames(active ? "bg-gray-100 text-gray-900" : "text-white", "block px-4 py-2 text-sm text-gray-900 dark:text-white dark:hover:bg-gray-700")}
                          onClick={() => {
                            setMenu("all");
                          }}
                        >
                          All
                        </a>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <a
                          className={classNames(active ? "bg-gray-100 text-gray-900" : "text-white", "block px-4 py-2 text-sm text-gray-900 dark:text-white dark:hover:bg-gray-700")}
                          onClick={() => {
                            setMenu("minted");
                          }}
                        >
                          Minted
                        </a>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <a
                          className={classNames(active ? "bg-gray-100 text-gray-900" : "text-white", "block px-4 py-2 text-sm text-gray-900 dark:text-white dark:hover:bg-gray-700")}
                          onClick={() => {
                            setMenu("notMinted");
                          }}
                        >
                          Not Minted
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          className={classNames(active ? "bg-gray-100 text-gray-900" : "text-white", "block px-4 py-2 text-sm text-gray-900 dark:text-white dark:hover:bg-gray-700")}
                          onClick={() => {
                            setMenu("closed");
                          }}
                        >
                          Closed
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </div>
      </div>
      {!events && (
        <div className="flex flex-wrap items-center justify-center pt-24 ">
          <ReactLoading type={"bubbles"} height={100} width={120} color={"#5b2bab"} />
          <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">Loading</span>
        </div>
      )}
      {events.length !== 0 && (
        <div className="space-y-10">
          <ItemList values={events} status={menu} />
        </div>
      )}
      {events.length === 0 && (
        <div className="flex flex-wrap items-center justify-center pt-24 ">
          <h3 className="float-left font-extrabold tracking-tight dark:text-white xxs:text-lg lg:text-xl xl:text-2xl">No events associated</h3>
        </div>
      )}
    </div>
  );
};
export default Events;
