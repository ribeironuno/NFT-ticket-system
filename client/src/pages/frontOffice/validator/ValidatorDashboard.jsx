import React, { useState, useRef, useEffect } from "react";
import DividerLine from "../../../components/generic/DividerLine";
import SearchBar from "../../../components/generic/SearchBar";
import { toMonthName, getActualDate_DayMonthYearHifenFomart } from "../../../helper/functionsGeneral";
import constants from "../../../configs/constants";
import { Toaster, toast, ToastBar } from "react-hot-toast";
import { HiX } from "react-icons/hi";
import Toast, { ToastType } from "../../../components/generic/Toast";
import ReactLoading from "react-loading";
import moment from "moment/moment";
import { useNavigate } from "react-router-dom";

export const DisplayType = {
  ALL: 1,
  TODAY: 2,
};

const ValidatorDashboard = () => {
  //search bar input
  const [searchTodaysInput, setSearchTodaysInput] = useState("");
  const [searchUpcomingInput, setSearchUpcomingInput] = useState("");

  const dataFetchedRef = useRef(false);
  const navigate = useNavigate();

  //what to display
  const [displayMode, setDisplayMode] = useState(DisplayType.TODAY);

  const [todaysEvents, setTodaysEvent] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  function isBetweenDates(date1, date2) {
    let currentDate = moment().unix();
    let start = moment(date1, "DD/MM/YYYY").unix();
    let end = moment(date2, "DD/MM/YYYY").unix();

    return start <= currentDate <= end;
  }

  //GET EVENTS THE ORGANIZER HAVE TO VALIDATE
  const fetchData = () => {
    fetch(constants.URL_VALIDATORS + "events-to-validate", {
      method: "GET",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((event) => {
        let tmpUpComing = [];
        let tmpTodayEvents = []; //const event of data
        for (let i = 0; i < event.length; i++) {
          if (event[i].datesInfo.duration === "one_day") {
            if (event[i].datesInfo.startDate.dayMonthYear === getActualDate_DayMonthYearHifenFomart()) {
              tmpTodayEvents.push(event[i]);
            } else {
              tmpUpComing.push(event[i]);
            }
          } else {
            //if atual date is between a multi day event
            if (isBetweenDates(event[i].datesInfo.startDate.dayMonthYear, event[i].datesInfo.endDate.dayMonthYear)) {
              tmpTodayEvents.push(event[i]);
            } else {
              tmpUpComing.push(event[i]);
            }
          }
        }
        setTodaysEvent(tmpTodayEvents);
        /*
        const upcomingEventsTmp = tmpUpComing.filter((event) => compareDates(event.date, getActualDate_DayMonthYearHifenFomart()) === -1).slice();
        upcomingEventsTmp.sort(function (a, b) {
          return compareDates(b.date, a.date);
        });
        */
        setUpcoming(tmpUpComing);
        setIsLoading(false);
      })
      .catch((err) => {
        Toast("Error getting your data", "Try again later", ToastType.DANGER);
      });
  };

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex flex-wrap justify-center md:justify-between">
        <span className="mb-4 self-start text-2xl font-extrabold tracking-tight dark:text-white lg:text-3xl xl:text-4xl">My events to validate</span>
      </div>

      {/* ############################ PRINCIPAL VIEW  ############################*/}

      {/* FILTERS */}
      <div className="mt-6 flex justify-center md:mt-0 md:justify-end">
        <div className="w-fit">
          <label className="mr-6 w-full text-center text-black dark:text-white">
            <input
              type="radio"
              className="mr-4"
              value="sectionImages"
              checked={displayMode === DisplayType.TODAY}
              onChange={(e) => {
                setDisplayMode(DisplayType.TODAY);
              }}
            />
            Only today
          </label>

          <label className="mr-6 w-full text-black dark:text-white">
            <input
              type="radio"
              className="mr-4"
              value="eventImage"
              checked={displayMode === DisplayType.ALL}
              onChange={(e) => {
                setDisplayMode(DisplayType.ALL);
              }}
            />
            All
          </label>
        </div>
      </div>

      <DividerLine />
      {isLoading && (
        <div className="flex flex-wrap items-center justify-center pt-24 ">
          <ReactLoading type={"bubbles"} height={100} width={120} color={"#5b2bab"} />
          <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">Loading</span>
        </div>
      )}

      {!isLoading && (
        <>
          {/* TODAY EVENT */}
          <div className="w-full">
            <div className="mb-8 flex w-full justify-center md:justify-start">
              <span
                className="center-text mb-4 self-start font-extrabold tracking-tight 
                dark:text-white xxs:text-lg lg:text-xl xl:text-2xl "
              >
                Today's events
              </span>
            </div>

            {/* TODAYS EVENT LISTING */}
            {todaysEvents.length > 0 ? (
              <>
                <div className="flex w-full justify-end">
                  <div className="flex w-full flex-wrap justify-end md:w-2/6">
                    <SearchBar placeholder={"Today's event names"} stateValue={searchTodaysInput} onChangeFunction={setSearchTodaysInput} />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {todaysEvents.map((event, key) => (
                    <React.Fragment key={key}>
                      {event.eventName.toLowerCase().includes(searchTodaysInput.toLowerCase()) && (
                        <div
                          key={"div" + event.id}
                          id="ticketBanner"
                          className={`flex min-h-fit w-full animate-fade-in-down flex-col
                                rounded-md bg-cover bg-center p-0 text-left text-white duration-300 ease-in-out hover:scale-[1.01] hover:cursor-pointer sm:p-2 lg:flex-row lg:p-5`}
                          style={{ backgroundImage: `url(${constants.SERVER_URL + "/" + event.banner.replace(/\\/g, "/")})` }}
                          onClick={() => {
                            navigate(`/app/validator/validate-tickets?eventId=${event.eventId}`)
                          }}
                        >
                          <div className="lg:w-5/3 m-0 flex h-full flex-row space-x-10 rounded-md bg-black bg-opacity-70 p-5 align-middle sm:m-1 md:w-full">
                            <div
                              className="b-0 grid min-h-fit w-1/3 content-center rounded-md bg-gray-500 bg-opacity-80 p-0 text-center 
                                                             font-bold xxs:p-2 md:w-1/5"
                            >
                              <p className="text-xl text-black sm:text-2xl">{event.datesInfo.startDate.dayMonthYear.split("-")[2]}</p>
                              <p className="text-xl text-black sm:text-2xl">{toMonthName(event.datesInfo.startDate.dayMonthYear.split("-")[1])}</p>
                              <p className="text-3xl text-black sm:text-4xl">{event.datesInfo.startDate.dayMonthYear.split("-")[0]}</p>
                            </div>

                            <div className="h-full w-3/4 space-y-5 p-1 font-bold sm:p-5 md:w-4/5">
                              <p className="text-center text-xl text-white sm:text-left sm:text-4xl">{event.eventName}</p>
                              <p className="text-center text-lg text-white sm:text-left">{event.location}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-wrap justify-center">
                <div className="flex w-full justify-center">
                  <span
                    className="mb-4 w-full text-center font-medium tracking-tight 
                dark:text-white xxs:text-lg lg:text-xl xl:text-xl "
                  >
                    It seems that there is no work to do today!
                  </span>
                </div>
                <img className="mt-8 w-full xxs:h-52 xxs:w-52 sm:h-52 sm:w-52" src={require("../../../assets/images/couch.png")} alt="couch" />
              </div>
            )}
          </div>

          {/* UPCOMING LIST*/}
          {displayMode === DisplayType.ALL && (
            <>
              <DividerLine />
              <div className="mt-8 w-full">
                <div className="mb-8 flex w-full justify-center md:justify-start">
                  <span
                    className="center-text mb-4 self-start font-extrabold tracking-tight 
                dark:text-white xxs:text-lg lg:text-xl xl:text-2xl "
                  >
                    Upcoming events
                  </span>
                </div>

                {/* TODAYS EVENT LISTING */}
                {upcoming.length > 0 ? (
                  <>
                    <div className="flex w-full justify-end">
                      <div className="flex w-full flex-wrap justify-end md:w-2/6">
                        <SearchBar placeholder={"Upcoming's event names"} stateValue={searchUpcomingInput} onChangeFunction={setSearchUpcomingInput} />
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {upcoming.map((event, key) => (
                        <React.Fragment key={key}>
                          {event.eventName.toLowerCase().includes(searchUpcomingInput.toLowerCase()) && (
                            <div
                              key={"div" + event.eventId}
                              id="ticketBanner"
                              className={`flex min-h-fit w-full animate-fade-in-down 
                                                                 flex-col rounded-md bg-cover bg-center p-0 text-left text-white duration-300 ease-in-out sm:p-2 lg:flex-row lg:p-5`}
                              style={{
                                backgroundImage: `url(${constants.SERVER_URL + "/" + event.banner.replace(/\\/g, "/")})`,
                              }}
                            >
                              <div className="lg:w-5/3 m-0 flex h-full flex-row space-x-10 rounded-md bg-black bg-opacity-70 p-5 align-middle sm:m-1 md:w-full">
                                <div
                                  className="b-0 grid min-h-fit w-1/3 content-center rounded-md bg-gray-500 bg-opacity-80 p-0 text-center 
                                                                            font-bold xxs:p-2 md:w-1/5"
                                >
                                  <p className="text-xl text-black sm:text-2xl">{event.datesInfo.startDate.dayMonthYear.split("-")[2]}</p>
                                  <p className="text-xl text-black sm:text-2xl">{toMonthName(event.datesInfo.startDate.dayMonthYear.split("-")[1])}</p>
                                  <p className="text-3xl text-black sm:text-4xl">{event.datesInfo.startDate.dayMonthYear.split("-")[0]}</p>
                                </div>

                                <div className="h-full w-3/4 space-y-5 p-1 font-bold sm:p-5 md:w-4/5">
                                  <p className="text-center text-xl text-white sm:text-left sm:text-4xl">{event.eventName}</p>
                                  <p className="text-center text-lg text-white sm:text-left">{event.location}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap justify-center">
                    <div className="flex w-full justify-center">
                      <span
                        className="mb-4 w-full text-center font-medium tracking-tight 
                                                    dark:text-white xxs:text-lg lg:text-xl xl:text-xl "
                      >
                        There seems to be no work to do in the next few days!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ValidatorDashboard;
