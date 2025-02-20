import React, { useState, useRef, useEffect } from "react";
import DividerLine from "../../../components/generic/DividerLine";
import GenericButton from "../../../components/generic/GenericButton";
import { isMobile } from "react-device-detect";
import QrCodeScan from "../../../components/validator/QrCodeScan";
import RangeSlider from "react-bootstrap-range-slider";
import { useNavigate } from "react-router-dom";
import { toMonthName, getActualDate_DayMonthYear, compareDates, getActualDate_DayMonthYearHifenFomart } from "../../../helper/functionsGeneral";
import constants from "../../../configs/constants";
import ReactLoading from "react-loading";
import jwt_decode from "jwt-decode";
import moment from "moment/moment";
import { ExclamationCircleIcon } from "@heroicons/react/solid";

export const PageToShow = {
  PRINCIPAL: 1,
  DOOR: 2,
  QR_CODE: 3,
};

const ValidateTickets = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState();
  const [structure, setStructure] = useState();
  const id = queryParams.get("eventId");
  const dataFetchedRef = useRef(false);
  const [doorsOfStructure, setDoorsOfStructure] = useState([]);

  const [validationStructure, setValidationStructure] = useState({});
  const [doorChosen, setDoorChosen] = useState("");
  const [canBeValidated, setCanBeValidated] = useState(false);

  //get logintype (login account or hash)
  var decodedJwt = jwt_decode(localStorage.getItem("token"));
  var loginType = decodedJwt[constants.ROLE_DECODE];

  //qr code area
  const [refreshRate, setRefreshRate] = useState(1);
  const [isToShowCamera, setIsToShowCamera] = useState(true);
  const [isToShowBackCamera, setIsToShowBackCamera] = useState(true);
  const [constraints, setConstraints] = useState({
    audio: false,
    video: {
      facingMode: "environment",
    },
  });

  /**
   * Set the doors array
   */
  function openDoorSection(event) {
    const doors = {};
    const eventStructure = event.structure;

    if (eventStructure.nonSeatedSections) {
      eventStructure.nonSeatedSections.forEach((section) => {
        doors[section.door] = true;
      });
    }

    if (eventStructure.seatedSections) {
      eventStructure.seatedSections.forEach((section) => {
        doors[section.door] = true;
      });
    }

    const doorsArr = Object.keys(doors);
    setDoorsOfStructure(doorsArr);
  }

  const chooseDoor = (door) => {
    //makes the json validation structure
    var tmp = {
      event: event,
      door: door,
    };
    setDoorChosen(door);
    setValidationStructure(tmp);
    setPageToShow(PageToShow.QR_CODE);
  };

  const checkCanBeValidated = (start, end) => {
    const currentDate = moment();
    const formattedDate = currentDate.format("DD-MM-YYYY HH:mm:ss");
    var current = moment(formattedDate, "DD-MM-YYYY HH:mm:ss");
    var startDate = moment(start, "DD-MM-YYYY HH:mm:ss");
    var endDate = moment(end, "DD-MM-YYYY HH:mm:ss");

    let inferiorDeadline = moment(startDate, "DD-MM-YYYY HH:mm:ss").subtract(8, "hours");
    //check if the event start 8 hours before the current time or event already ended
    if (current.isBefore(inferiorDeadline) || current.isAfter(endDate)) {
      setTimeout(() => {
        navigate("/app/validator/login");
      }, 2500);
      setCanBeValidated(false);
    } else {
      setCanBeValidated(true);
    }
  };

  const fetchData = () => {
    fetch(constants.URL_EVENTS + `getEvent?eventId=${id}`, {
      method: "GET",
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        setEvent(data.message);
        setStructure(data.message.structure);
        openDoorSection(data.message);
        setIsLoading(false);
        let startDateTime = data.message.datesInfo.startDate.dayMonthYear + " " + data.message.datesInfo.startDate.startTime.replace("h", ":") + ":00";
        //event only occur one day
        if (data.message.datesInfo.duration === "one_day") {
          let endDateTime = data.message.datesInfo.startDate.dayMonthYear + " " + data.message.datesInfo.startDate.endTime.replace("h", ":") + ":00";
          checkCanBeValidated(startDateTime, endDateTime);
        } else {
          let endDateTime = data.message.datesInfo.endDate.dayMonthYear + " " + data.message.datesInfo.endDate.endTime.replace("h", ":") + ":00";
          checkCanBeValidated(startDateTime, endDateTime);
        }
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  const refreshCamera = () => {
    setIsToShowCamera(false);
    setTimeout(function () {
      setIsToShowCamera(true);
    }, 1500);
  };

  function toggleCamera() {
    //if the actual is to show back, update to front
    if (isToShowBackCamera) {
      setConstraints({
        audio: false,
        video: {
          facingMode: "user",
        },
      });
    } else {
      setConstraints({
        audio: false,
        video: {
          facingMode: "environment",
        },
      });
    }
    refreshCamera();
    setIsToShowBackCamera(!isToShowBackCamera);
  }

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetchData();
  }, []);

  const navigate = useNavigate();
  const [pageToShow, setPageToShow] = useState(PageToShow.DOOR);
  return (
    <>
      {/* ############################ DOORS  ############################*/}
      {isLoading && (
        <div className="flex flex-wrap items-center justify-center pt-24 ">
          <ReactLoading type={"bubbles"} height={100} width={120} color={"#5b2bab"} />
          <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">Loading</span>
        </div>
      )}
      {!isLoading && canBeValidated && (
        <>
          {pageToShow === PageToShow.DOOR && (
            <>
              <div className="flex flex-wrap justify-center md:justify-between">
                <span className="mb-4 self-start text-2xl font-extrabold tracking-tight dark:text-white lg:text-3xl xl:text-4xl">My events to validate</span>
              </div>
              {loginType === "Validator" && (
                <div className="mt-6 flex w-full justify-end">
                  <GenericButton
                    name={"Go back"}
                    onClick={() => {
                      navigate("/app/validator/");
                    }}
                    color={"red"}
                  />
                </div>
              )}
              <DividerLine />
              <div className="mb-8 flex w-full flex-wrap justify-start">
                <div
                  id="ticketBanner"
                  className={`flex min-h-fit w-full animate-fade-in-down
                                flex-col rounded-md bg-cover bg-center p-0 text-left text-white duration-300 ease-in-out sm:p-2 lg:flex-row lg:p-5`}
                  style={{ backgroundImage: `url(${constants.SERVER_URL + "/" + event.banner.replace(/\\/g, "/")})` }}
                >
                  <div className="lg:w-5/3 m-0 flex h-full flex-row space-x-10 rounded-md bg-black bg-opacity-70 p-5 align-middle sm:m-1 md:w-full">
                    <div
                      className="b-0 grid min-h-fit w-1/4 content-center rounded-md bg-gray-500 bg-opacity-80 p-2 
                            text-center font-bold md:w-1/5"
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
              </div>

              <div className="mb-6 flex w-full justify-center md:justify-start">
                <span
                  className="xxs:text-md mb-4 w-full self-start text-center 
                font-medium tracking-tight dark:text-white md:text-xl"
                >
                  Choose the door that you are going to validate
                </span>
              </div>
              <div className="flex justify-between">
                {/* DISPLAYS THE DOORS */}
                <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {doorsOfStructure.map((door, key) => (
                    <div
                      key={key}
                      className="flex flex-wrap justify-center rounded-lg 
                                     bg-gray-800 p-6 hover:cursor-pointer dark:bg-gray-600"
                      onClick={() => {
                        chooseDoor(door);
                      }}
                    >
                      <div className="mb-6 flex w-full justify-center">
                        <p className="text-md  text-white ">{door}</p>
                      </div>
                      <button
                        className="inline-flex justify-center rounded-md border border-transparent 
                                                                 bg-green-600 py-2 px-6 text-sm font-medium text-white shadow-sm 
                                                                 focus:outline-none hover:bg-green-700"
                        onClick={() => {
                          chooseDoor(door);
                        }}
                      >
                        Choose
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ############################ QR CODE VIEW  ############################*/}
          {/* camera control */}

          {pageToShow === PageToShow.QR_CODE && (
            <>
              <div className="mt-6 flex w-full justify-center md:justify-end">
                <GenericButton
                  name={"Exit Scan Mode"}
                  onClick={() => {
                    setPageToShow(PageToShow.DOOR);
                  }}
                  color={"red"}
                />
              </div>
              <DividerLine />
              <div className="mb-8 flex w-full flex-wrap justify-start">
                <div
                  id="ticketBanner"
                  className={`flex min-h-fit w-full animate-fade-in-down
                        flex-col rounded-md  bg-cover bg-center p-0 text-left text-white duration-300 ease-in-out 
                        sm:p-2 lg:flex-row lg:p-5`}
                  style={{ backgroundImage: `url(${constants.SERVER_URL + "/" + event.banner.replace(/\\/g, "/")})` }}
                >
                  <div className="lg:w-5/3 m-0 flex h-full flex-row space-x-10 rounded-md bg-black bg-opacity-70 p-5 align-middle sm:m-1 md:w-full">
                    <div
                      className="b-0 grid min-h-fit w-1/4 content-center rounded-md bg-gray-500 bg-opacity-80 p-2 
                    text-center font-bold md:w-1/5"
                    >
                      <p className="text-xl text-black sm:text-2xl">{event.datesInfo.startDate.dayMonthYear.split("-")[2]}</p>
                      <p className="text-xl text-black sm:text-2xl">{toMonthName(event.datesInfo.startDate.dayMonthYear.split("-")[1])}</p>
                      <p className="text-3xl text-black sm:text-4xl">{event.datesInfo.startDate.dayMonthYear.split("-")[0]}</p>
                    </div>

                    <div className="h-full w-3/4 space-y-5 p-1 font-bold sm:p-5 md:w-4/5">
                      <p className="text-center text-xl text-white sm:text-left sm:text-4xl">{event.eventName}</p>
                      <p className="text-center text-lg text-white sm:text-left">{event.location}</p>
                      <p className="text-center text-lg font-extrabold text-indigo-400 sm:text-left">{doorChosen}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8 flex w-full flex-wrap justify-center sm:flex-nowrap">
                <GenericButton
                  name={"Refresh camera"}
                  onClick={() => {
                    refreshCamera();
                  }}
                  color={"indigo"}
                />
                <div className="mt-8 flex w-full flex-wrap justify-between sm:mt-0 sm:w-fit">
                  <div className="flex w-full justify-center">
                    <RangeSlider
                      value={refreshRate}
                      min={1}
                      max={10}
                      tooltip={"off"}
                      step={1}
                      onChange={(changeEvent) => {
                        setRefreshRate(changeEvent.target.value);
                        refreshCamera();
                      }}
                    ></RangeSlider>
                  </div>

                  <span className="text-md flex w-full w-full justify-center font-medium tracking-tight dark:text-white">Refresh rate: {refreshRate} second</span>
                </div>

                {isMobile && (
                  <div>
                    <button
                      className={`mt-6 inline-flex justify-center rounded-md border 
                                 border-transparent bg-sky-600 py-1 px-3 text-sm font-medium text-white 
                                shadow-sm focus:outline-none hover:bg-sky-700`}
                      onClick={() => {
                        toggleCamera();
                      }}
                    >
                      <img className="h-8 w-8" src={require("../../../assets/images/camera_flip.png")} alt="" />
                    </button>
                  </div>
                )}
              </div>
              {isToShowCamera ? <QrCodeScan validationStructure={validationStructure} refreshRate={refreshRate} constraints={constraints} /> : <div className="h-[400px]"></div>}
            </>
          )}
        </>
      )}
      {!isLoading && !canBeValidated && (
        <>
          <div className="flex flex-wrap items-center justify-center pt-12 ">
            <ExclamationCircleIcon
              size={20}
              className={`} h-20
                w-20 text-red-700 text-red-600`}
            />
            <h4 className="text-center text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-400 sm:text-4xl">Not authorized!</h4>
          </div>
        </>
      )}
    </>
  );
};

export default ValidateTickets;
