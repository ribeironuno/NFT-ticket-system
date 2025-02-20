import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import React, { useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { toMonthName } from "../../../helper/functionsGeneral";
import { useEffect } from "react";
import constants from "../../../configs/constants";
import ReactLoading from "react-loading";
import { Toaster, toast, ToastBar } from "react-hot-toast";
import { HiX } from "react-icons/hi";
import { ConnectWalletButton } from "../../../components";

/* DORPDOWN FUNCTION */
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const EventsBeingSold = () => {
  const [events, setEvents] = useState([]);
  const [menu, setMenu] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wallet, setWallet] = useState(
    localStorage.getItem("userWalletAddress")
  );
  const navigate = useNavigate();

  // ################## HTTP REQUEST ########################3
  const url = constants.URL_EVENTS;
  const serverUrl = constants.SERVER_URL;

  //SEARCH BAR
  const handleInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  useEffect(() => {
    setIsLoading(true);
    fetch(url + `getAllMinted`)
      .then((res) => {
        setIsLoading(false);
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        setEvents(data.message);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  }, []);

  const TailwindToaster = () => {
    return (
      <div>
        <Toaster
          reverseOrder={false}
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "8px",
              background: "#333",
              color: "#fff",
            },
          }}>
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <>
                  {icon}
                  {message}
                  {t.type !== "loading" && (
                    <button
                      className="ring-primary-400 rounded-full p-1 transition focus:outline-none focus-visible:ring hover:bg-[#444]"
                      onClick={() => toast.dismiss(t.id)}>
                      <HiX />
                    </button>
                  )}
                </>
              )}
            </ToastBar>
          )}
        </Toaster>
      </div>
    );
  };

  return (
    <>
      <TailwindToaster />
      {isLoading && (
        <div className="flex flex-wrap items-center justify-center pt-24 ">
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
      )}

      {!isLoading && (
        <div>
          <div
            id="mainDiv"
            className="min-w-screen flex flex-col space-y-5 bg-gray-50 dark:bg-slate-900 sm:space-y-10">
            <div>
              <span className=" self-start font-extrabold tracking-tight dark:text-white xxs:text-lg lg:text-3xl xl:text-4xl">
                Check out our available Events
              </span>
              <div className="mt-5 mb-5 flex w-full animate-fade-in-down flex-row justify-end space-x-5">
                <label htmlFor="simple-search" className="sr-only">
                  Search
                </label>
                <div className="relative w-60">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <input
                    onChange={handleInputChange}
                    type="text"
                    id="simple-search"
                    className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 pl-10 text-sm text-white  placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="Search"
                  />
                </div>

                <Menu
                  as="div"
                  className="relative inline-block text-left duration-300 ease-in-out hover:scale-[1.05]">
                  <div>
                    <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-gray-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-500">
                      {menu.charAt(0).toUpperCase() + menu.slice(1)}
                      <ChevronDownIcon
                        className="-mr-1 ml-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    </Menu.Button>
                  </div>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95">
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hover:cursor-pointer">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <p
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-white",
                                "block px-4 py-2 text-sm"
                              )}
                              onClick={() => setMenu("All")}>
                              All
                            </p>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <p
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-white",
                                "block px-4 py-2 text-sm"
                              )}
                              onClick={() => setMenu("Music")}>
                              Music
                            </p>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <p
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-white",
                                "block px-4 py-2 text-sm"
                              )}
                              onClick={() => setMenu("Sports")}>
                              Sports
                            </p>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <p
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-white",
                                "block px-4 py-2 text-sm"
                              )}
                              onClick={() => setMenu("Comedy")}>
                              Comedy
                            </p>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <p
                              href=" "
                              type="submit"
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-white",
                                "block w-full px-4 py-2 text-left text-sm"
                              )}
                              onClick={() => setMenu("Theatre")}>
                              Theatre
                            </p>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <p
                              type="submit"
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-white",
                                "block w-full px-4 py-2 text-left text-sm"
                              )}
                              onClick={() => setMenu("Cinema")}>
                              Cinema
                            </p>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <p
                              href=" "
                              type="submit"
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-white",
                                "block w-full px-4 py-2 text-left text-sm"
                              )}
                              onClick={() => setMenu("Others")}>
                              Others
                            </p>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>

              <div className="space-y-10">
                {events.map((event) => (
                  <>
                    {(event.category === menu || menu === "All") &&
                      (event.eventName
                        .toLowerCase()
                        .includes(searchInput.toLocaleLowerCase()) ||
                        searchInput === "") && (
                        <>
                          <div
                            key={event.eventId}
                            className=" animate-fade-in-down space-y-0 rounded-md bg-gray-200 p-1 dark:bg-gray-700 sm:space-y-10 md:p-10">
                            <div
                              id="ticketBanner"
                              onClick={() =>
                                navigate(
                                  `/app/client/event-data?eventId=${event.eventId}`
                                )
                              }
                              className={`flex min-h-fit w-full animate-fade-in-down flex-col 
                                rounded-md bg-cover bg-center p-0 text-left text-white duration-300 ease-in-out hover:scale-[1.01] hover:cursor-pointer sm:p-2 lg:flex-row lg:p-5`}
                              style={{
                                backgroundImage: `url(${serverUrl +
                                  "/" +
                                  event.banner.replace(/\\/g, "/")
                                  })`,
                              }}>
                              <div className="m-0 flex h-full flex-row space-x-10 rounded-md bg-black bg-opacity-70 p-5 align-middle sm:m-1 lg:w-full">
                                <div className="b-0 grid min-h-fit w-1/5 content-center rounded-md bg-gray-500 bg-opacity-80 p-2 font-bold xl:text-center">
                                  <p className="text-xl text-black sm:text-2xl">
                                    {toMonthName(
                                      event.datesInfo.startDate.dayMonthYear.split(
                                        "-"
                                      )[1]
                                    )}
                                  </p>
                                  <p className="text-xl text-black sm:text-2xl lg:text-5xl">
                                    {
                                      event.datesInfo.startDate.dayMonthYear.split(
                                        "-"
                                      )[0]
                                    }
                                  </p>
                                </div>

                                <div className="h-full w-4/5 space-y-5 p-1 font-bold sm:p-5">
                                  <p className="text-center text-xl text-white sm:text-left sm:text-4xl">
                                    {event.eventName}
                                  </p>
                                  <p className="text-center text-lg text-gray-400 sm:text-left">
                                    Location
                                  </p>
                                  <p className="text-center text-lg text-white sm:text-left">
                                    {event.location}
                                  </p>
                                </div>
                              </div>

                              <div className="b-0 m-1 grid w-full content-center space-x-10 p-5 text-center lg:text-right xl:w-1/2">
                                <p className="font-bold md:text-lg lg:text-2xl">
                                  View Collection
                                  <img
                                    className="hidden h-9 content-center lg:float-right lg:block"
                                    src="https://img.icons8.com/ios-filled/50/FFFFFF/chevron-right.png"
                                    alt=""
                                  />
                                </p>
                              </div>
                            </div>

                            <div className="w-full flex-col space-y-5 lg:flex 2xl:flex-row 2xl:space-y-0 2xl:space-x-10">
                              {event.structure.nonSeatedSections[0] && (
                                <div
                                  id="ticket1"
                                  className="hidden min-h-fit w-full animate-fade-in-down flex-col 
            rounded-md bg-cover bg-center p-0 text-left text-white duration-300 ease-in-out hover:scale-[1.01] hover:cursor-pointer sm:block md:flex md:flex-row 2xl:w-1/2"
                                  onClick={() =>
                                    navigate(
                                      `/app/client/event-data?eventId=${event.eventId}`
                                    )
                                  }
                                  style={{
                                    backgroundImage: `url(${serverUrl +
                                      "/" +
                                      event.banner.replace(/\\/g, "/")
                                      })`,
                                  }}>
                                  <div className="m-0 flex h-full w-full flex-row space-x-10 rounded-md bg-black bg-opacity-70 p-2 align-middle xl:p-5">
                                    <div className="b-0 grid min-h-fit w-1/5 content-center rounded-md bg-gray-500 bg-opacity-80 p-2 text-center font-bold xl:text-left">
                                      <p className="text-xl text-black">
                                        {toMonthName(
                                          event.datesInfo.startDate.dayMonthYear.split(
                                            "-"
                                          )[1]
                                        )}
                                      </p>
                                      <p className="text-2xl text-black lg:text-4xl">
                                        {
                                          event.datesInfo.startDate.dayMonthYear.split(
                                            "-"
                                          )[0]
                                        }
                                      </p>
                                    </div>

                                    <div className="h-full w-4/5 space-y-3 p-5 font-bold">
                                      <p className="text-center text-xl text-white sm:text-left sm:text-2xl">
                                        {event.eventName}
                                      </p>
                                      <p className="text-center text-lg text-gray-400 sm:text-left">
                                        {event.location}
                                      </p>
                                      <p className="text-center text-lg italic text-white sm:text-left">
                                        {
                                          event.structure.nonSeatedSections[0]
                                            .name
                                        }{" "}
                                        {" - "}
                                        {"Non seated section\n\n"}
                                      </p>
                                      <div className="flex">
                                        <svg
                                          width="25px"
                                          height="35px"
                                          viewBox="0 0 32 32"
                                          xmlns="http://www.w3.org/2000/svg">
                                          <g fill="none">
                                            <circle
                                              fill="#6F41D8"
                                              cx="16"
                                              cy="16"
                                              r="16"
                                            />
                                            <path
                                              d="M21.092 12.693c-.369-.215-.848-.215-1.254 0l-2.879 1.654-1.955 1.078-2.879 1.653c-.369.216-.848.216-1.254 0l-2.288-1.294c-.369-.215-.627-.61-.627-1.042V12.19c0-.431.221-.826.627-1.042l2.25-1.258c.37-.216.85-.216 1.256 0l2.25 1.258c.37.216.628.611.628 1.042v1.654l1.955-1.115v-1.653a1.16 1.16 0 00-.627-1.042l-4.17-2.372c-.369-.216-.848-.216-1.254 0l-4.244 2.372A1.16 1.16 0 006 11.076v4.78c0 .432.221.827.627 1.043l4.244 2.372c.369.215.849.215 1.254 0l2.879-1.618 1.955-1.114 2.879-1.617c.369-.216.848-.216 1.254 0l2.251 1.258c.37.215.627.61.627 1.042v2.552c0 .431-.22.826-.627 1.042l-2.25 1.294c-.37.216-.85.216-1.255 0l-2.251-1.258c-.37-.216-.628-.611-.628-1.042v-1.654l-1.955 1.115v1.653c0 .431.221.827.627 1.042l4.244 2.372c.369.216.848.216 1.254 0l4.244-2.372c.369-.215.627-.61.627-1.042v-4.78a1.16 1.16 0 00-.627-1.042l-4.28-2.409z"
                                              fill="#FFF"
                                            />
                                          </g>
                                        </svg>
                                        <p className="mt-1 ml-1 text-center text-lg italic text-white sm:text-left">
                                          {
                                            event.structure.nonSeatedSections[0]
                                              .price
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {event.structure.seatedSections[0] && (
                                <div
                                  id="ticket2"
                                  className="hidden min-h-fit w-full animate-fade-in-down flex-col 
            rounded-md bg-cover bg-center p-0 text-left text-white duration-300 ease-in-out hover:scale-[1.01] hover:cursor-pointer sm:block md:flex md:flex-row 2xl:w-1/2"
                                  onClick={() =>
                                    navigate(
                                      `/app/client/event-data?eventId=${event.eventId}`
                                    )
                                  }
                                  style={{
                                    backgroundImage: `url(${serverUrl +
                                      "/" +
                                      event.banner.replace(/\\/g, "/")
                                      })`,
                                  }}>
                                  <div className="m-0 flex h-full w-full flex-row space-x-10 rounded-md bg-black bg-opacity-70 p-2 align-middle xl:p-5">
                                    <div className="b-0 grid min-h-fit w-1/5 content-center rounded-md bg-gray-500 bg-opacity-80 p-2 text-center font-bold xl:text-left">
                                      <p className="text-xl text-black">
                                        {toMonthName(
                                          event.datesInfo.startDate.dayMonthYear.split(
                                            "-"
                                          )[1]
                                        )}
                                      </p>
                                      <p className="text-2xl text-black lg:text-4xl">
                                        {
                                          event.datesInfo.startDate.dayMonthYear.split(
                                            "-"
                                          )[0]
                                        }
                                      </p>
                                    </div>

                                    <div className="h-full w-4/5 space-y-3 p-5 font-bold">
                                      <p className="text-center text-xl text-white sm:text-left sm:text-2xl">
                                        {event.eventName}
                                      </p>
                                      <p className="text-center text-lg text-gray-400 sm:text-left">
                                        {event.location}
                                      </p>
                                      <p className="text-center text-lg italic text-white sm:text-left">
                                        {event.structure.seatedSections[0].name}{" "}
                                        {" - "}
                                        {"Seated section"}
                                      </p>
                                      <div className="flex">
                                        <svg
                                          width="25px"
                                          height="35px"
                                          viewBox="0 0 32 32"
                                          xmlns="http://www.w3.org/2000/svg">
                                          <g fill="none">
                                            <circle
                                              fill="#6F41D8"
                                              cx="16"
                                              cy="16"
                                              r="16"
                                            />
                                            <path
                                              d="M21.092 12.693c-.369-.215-.848-.215-1.254 0l-2.879 1.654-1.955 1.078-2.879 1.653c-.369.216-.848.216-1.254 0l-2.288-1.294c-.369-.215-.627-.61-.627-1.042V12.19c0-.431.221-.826.627-1.042l2.25-1.258c.37-.216.85-.216 1.256 0l2.25 1.258c.37.216.628.611.628 1.042v1.654l1.955-1.115v-1.653a1.16 1.16 0 00-.627-1.042l-4.17-2.372c-.369-.216-.848-.216-1.254 0l-4.244 2.372A1.16 1.16 0 006 11.076v4.78c0 .432.221.827.627 1.043l4.244 2.372c.369.215.849.215 1.254 0l2.879-1.618 1.955-1.114 2.879-1.617c.369-.216.848-.216 1.254 0l2.251 1.258c.37.215.627.61.627 1.042v2.552c0 .431-.22.826-.627 1.042l-2.25 1.294c-.37.216-.85.216-1.255 0l-2.251-1.258c-.37-.216-.628-.611-.628-1.042v-1.654l-1.955 1.115v1.653c0 .431.221.827.627 1.042l4.244 2.372c.369.216.848.216 1.254 0l4.244-2.372c.369-.215.627-.61.627-1.042v-4.78a1.16 1.16 0 00-.627-1.042l-4.28-2.409z"
                                              fill="#FFF"
                                            />
                                          </g>
                                        </svg>
                                        <p className="mt-1 ml-1 text-center text-lg italic text-white sm:text-left">
                                          {
                                            event.structure.nonSeatedSections[0]
                                              .price
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                        </>
                      )}
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventsBeingSold;
