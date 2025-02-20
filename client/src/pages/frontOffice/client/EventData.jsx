import { useState, useEffect, useRef } from "react";
import constants from "../../../configs/constants";
import ReactLoading from "react-loading";
import { FaLink, FaExclamationTriangle, FaBitcoin, FaPhoneAlt, FaMailBulk } from "react-icons/fa";
import { Icon } from '@iconify/react';

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation } from "swiper";

/* GET ABBREVIATION FROM EVENT DATA */
function toMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1);

  return date.toLocaleString("en-US", {
    month: "short",
  });
}

const EventData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState();

  //Get id from url
  const queryParams = new URLSearchParams(window.location.search);
  const id = queryParams.get("eventId");

  const dataFetchedRef = useRef(false);
  //Fetch event
  const url = constants.URL_CLIENTS;

  const fetchData = () => {
    fetch(url + `event?eventId=${id}`, {
      method: "GET",
    })
      .then((res) => {
        setIsLoading(false);
        if (!res.ok) throw new Error(res.json());
        else return res.json();
      })
      .then((data) => {
        setEvent(data);
        console.log(data);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetchData();
  }, []);

  console.log(event);

  function getLowestSeatedPrice(sectionName) {
    let min = 100000000000;
    event.structure.seatedSections.forEach(section => {
      if (section.name === sectionName) {
        section.subSections.forEach(subSection => {
          if (subSection.price < min) {
            min = subSection.price;
          }
        })
      }
    })
    return min;
  }

  return (
    <>
      {!event ? (
        <div className="flex flex-wrap items-center justify-center pt-24 ">
          <ReactLoading type={"bubbles"} height={100} width={120} color={"#5b2bab"} />
          <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">Loading</span>
        </div>
      ) : (
        <div className="">
          <div
            id="ticketBanner"
            className={`flex min-h-fit w-full animate-fade-in-down flex-col 
                                 bg-cover bg-center p-0 text-left text-white duration-300 ease-in-out sm:p-2 md:flex-row lg:p-5`}
            style={{ backgroundImage: `url(${constants.SERVER_URL + "/" + event.banner.replace(/\\/g, "/")})` }}
          >
            <div className="m-0 flex h-full flex-row space-x-10 rounded-md bg-black bg-opacity-70 p-5 align-middle sm:m-1 md:w-full lg:w-1/2">
              <div className="b-0 grid content-center rounded-md bg-gray-500 bg-opacity-80 p-2 font-bold xxxs:w-2/5 xxs:w-1/5 xl:text-center">
                <p className="xxxs:text-md text-black xxs:text-xl">{toMonthName(event.datesInfo.startDate.dayMonthYear.split("-")[1])}</p>
                <p className="xxxs:text-md text-black xxs:text-3xl lg:text-5xl">{event.datesInfo.startDate.dayMonthYear.split("-")[0]}</p>
                <p className="xxs::text-md text-sm text-gray-400 xxxs:text-xs">AT</p>

                <p className="xxxs:text-md text-black xxs:text-xl">{event.datesInfo.startDate.startTime}</p>
                {event.datesInfo.startDate.endTime != null && (
                  <>
                    <p className="xxs:text-md text-sm text-gray-400 xxxs:text-xs">TILL</p>
                    <p className="xxxs:text-md text-black xxs:text-xl">{event.datesInfo.startDate.endTime}</p>
                  </>
                )}
              </div>

              <div className="xxxs:3/5 h-full space-y-2 p-2 font-bold xxs:w-4/5">
                <p className="text-center text-2xl text-white xxxs:text-lg sm:text-left sm:text-4xl">{event.eventName}</p>
                <p className="text-center text-xl text-gray-400  xxxs:text-lg sm:text-left">Location</p>
                <p className="text-center text-xl text-white xxxs:text-lg sm:text-left">{event.location}</p>
              </div>
            </div>
          </div>

          <div className="grid overflow-visible lg:grid-cols-5 lg:grid-rows-2">
            <div className="mb-1 lg:col-span-5 lg:row-span-2">
              <p className="pr-3 pb-3 pt-2 text-lg font-extralight text-black opacity-70 dark:text-white sm:mt-5">{event.description}</p>
              <div className="flex items-center justify-center pl-4 pr-4">
                <a
                  href={event.webSite}
                  target="_new"
                  className="inline-flex items-center justify-center rounded-lg bg-gray-50 p-4 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  rel="noreferrer"
                >
                  <FaLink size={20} />
                  <span className="w-full pl-3">Check the official website of {event.eventName}</span>
                  <svg aria-hidden="true" className="ml-3 h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
              </div>
            </div>
            <div className="grid overflow-auto  lg:col-span-5 lg:row-span-2 lg:mt-7">
              <p className="mb-3 pl-2 pt-2 text-lg font-extralight text-black opacity-70 dark:text-white">
                The {event.eventName} event will take place on {event.datesInfo.startDate.dayMonthYear} between the{" "}
                <span className="inline-block font-bold">{event.datesInfo.startDate.startTime}</span> and <span className="inline-block font-bold">{event.datesInfo.startDate.endTime}</span>. For any
                additional questions please contact the organizer using the next contacts.
              </p>

              <div className="grid sm:grid-cols-2 sm:grid-rows-2 md:grid-cols-3 md:grid-rows-1 lg:grid-cols-4 lg:grid-rows-2 xl:grid-cols-6 xl:grid-rows-1">
                <div className="mb-2 shrink-0 grow-0 basis-auto p-2 lg:col-span-2 lg:row-span-2 xl:col-span-2 xl:row-span-1">
                  <div className="flex items-start">
                    <div className="shrink-0">
                      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-blue-600 p-4 text-white shadow-md">
                        <FaPhoneAlt size={40} />
                      </div>
                    </div>
                    <div className="ml-6 grow">
                      <p className="mb-1 font-bold text-gray-700 dark:text-gray-400">My contacts</p>
                      {event.contacts.map((contact, key) => (
                        <p className="text-gray-500" key={key}>
                          {contact}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mb-2 w-full shrink-0 grow-0 basis-auto p-2 lg:col-span-2 lg:row-span-2 xl:col-span-2 xl:row-span-1">
                  <div className="flex items-start">
                    <div className="shrink-0">
                      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-blue-600 p-4 text-white shadow-md">
                        <FaMailBulk size={40} />
                      </div>
                    </div>
                    <div className="ml-6 grow">
                      <p className="mb-1 font-bold text-gray-700 dark:text-gray-400">My emails</p>
                      {event.emails.map((email, key) => (
                        <p className="text-gray-500" key={key}>
                          {email}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mb-5 w-full shrink-0 grow-0 basis-auto p-2 lg:col-span-2 lg:row-span-2 xl:col-span-2 xl:row-span-1">
                  <div className="align-start flex">
                    <div className="shrink-0">
                      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-blue-600 p-4 text-white shadow-md ">
                        <FaExclamationTriangle size={40} />
                      </div>
                    </div>
                    <div className="ml-6 grow">
                      <p className="mb-1 font-bold text-gray-700 dark:text-gray-400">Minimum age</p>
                      <p className="text-gray-500">{event.ageRestriction != null ? "+" + event.ageRestriction.split("plus_")[1] : "Not applicable"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Swiper
            navigation={true}
            modules={[Navigation]}
            className="mySwiper"
            spaceBetween={10}
            breakpoints={{
              280: {
                slidesPerGroup: 1,
                slidesPerView: 1,
              },
              375: {
                slidesPerGroup: 2,
                slidesPerView: 2,
                spaceBetween: 10,
              },
              640: {
                slidesPerGroup: 2,
                slidesPerView: 2,
              },
              768: {
                slidesPerGroup: 3,
                slidesPerView: 3,
              },
              1024: {
                slidesPerGroup: 3,
                slidesPerView: 3,
              },
              1280: {
                slidesPerGroup: 4,
                slidesPerView: 4,
              },
              1536: {
                slidesPerGroup: 5,
                slidesPerView: 5,
              },
            }}
          >
            {event.structure.nonSeatedSections.map((section, key) => (
              <SwiperSlide key={key}>
                <div className="px-3 sm:mx-5 md:mx-8">
                  {event.eventNFT ? (
                    <div id="nftImage" className="w-148 h-60 rounded-t-lg bg-center bg-cover" style={{ backgroundImage: `url(${constants.SERVER_URL + "/" + event.eventNFT.replace(/\\/g, "/")})` }} />
                  ) : (
                    <div id="nftImage" className="w-148 h-60 rounded-t-lg bg-center bg-cover" style={{ backgroundImage: `url(${constants.SERVER_URL + "/" + section.sectionNFT.replace(/\\/g, "/")})` }} />
                  )}
                  <div className="px-3 pb-3">
                    <h5 className="mt-3 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">{section.name}</h5>
                    <h6 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Non seated section</h6>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm tracking-tight text-gray-900 dark:text-white">Starting at</p>
                    </div>
                    <div className="flex items-center dark:text-white">
                      <svg width="22px" height="22px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <g fill="none">
                          <circle fill="#6F41D8" cx="16" cy="16" r="16" />
                          <path d="M21.092 12.693c-.369-.215-.848-.215-1.254 0l-2.879 1.654-1.955 1.078-2.879 1.653c-.369.216-.848.216-1.254 0l-2.288-1.294c-.369-.215-.627-.61-.627-1.042V12.19c0-.431.221-.826.627-1.042l2.25-1.258c.37-.216.85-.216 1.256 0l2.25 1.258c.37.216.628.611.628 1.042v1.654l1.955-1.115v-1.653a1.16 1.16 0 00-.627-1.042l-4.17-2.372c-.369-.216-.848-.216-1.254 0l-4.244 2.372A1.16 1.16 0 006 11.076v4.78c0 .432.221.827.627 1.043l4.244 2.372c.369.215.849.215 1.254 0l2.879-1.618 1.955-1.114 2.879-1.617c.369-.216.848-.216 1.254 0l2.251 1.258c.37.215.627.61.627 1.042v2.552c0 .431-.22.826-.627 1.042l-2.25 1.294c-.37.216-.85.216-1.255 0l-2.251-1.258c-.37-.216-.628-.611-.628-1.042v-1.654l-1.955 1.115v1.653c0 .431.221.827.627 1.042l4.244 2.372c.369.216.848.216 1.254 0l4.244-2.372c.369-.215.627-.61.627-1.042v-4.78a1.16 1.16 0 00-.627-1.042l-4.28-2.409z" fill="#FFF" />
                        </g>
                      </svg>
                      <span className="pl-1 text-sm font-bold text-gray-900 dark:text-white">{section.price}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-center">
                      <div className="text-center lg:px-4">
                        <div className="inline-flex items-center rounded-full bg-indigo-800 leading-none text-indigo-100" role="alert">
                          <span className="flex rounded-full bg-indigo-500 px-2 py-1 text-xs font-bold uppercase">New</span>
                          <span className="mr-2 flex-auto p-1 text-left font-semibold">
                            <p className="inline-block font-bold">{section.availableTickets}</p> tickets left{" "}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-center">
                      <button
                        onClick={() => {
                          window.location.href = '/app/client/purchase-ticket/' + event.eventId
                        }}
                        className="flex w-full justify-center rounded-md bg-violet-800 p-2 text-xs text-white transition duration-500 ease-in-out focus:outline-none focus:ring-1 focus:ring-white hover:scale-[1.02] hover:bg-violet-700 hover:shadow-md hover:shadow-violet-400 md:text-sm"
                      >
                        Buy your ticket
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
            {event.structure.seatedSections.map((sections, key) => (
              <SwiperSlide key={key}>
                <div className="px-3 sm:mx-5 md:mx-8">
                  {event.eventNFT ? (
                    <div id="nftImage" className="w-148 h-60 rounded-t-lg bg-center bg-cover" style={{ backgroundImage: `url(${constants.SERVER_URL + "/" + event.eventNFT.replace(/\\/g, "/")})` }} />
                  ) : (
                    <div id="nftImage" className="w-148 h-60 rounded-t-lg bg-center bg-cover" style={{ backgroundImage: `url(${constants.SERVER_URL + "/" + sections.sectionNFT.replace(/\\/g, "/")})` }} />
                  )}
                  <div className="px-3 pb-3">
                    <h5 className="mt-3 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">{sections.name}</h5>
                    <h6 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Seated section</h6>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm tracking-tight text-gray-900 dark:text-white">Starting at</p>
                    </div>
                    <div className="flex items-center dark:text-white">
                      <svg width="22px" height="22px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <g fill="none">
                          <circle fill="#6F41D8" cx="16" cy="16" r="16" />
                          <path d="M21.092 12.693c-.369-.215-.848-.215-1.254 0l-2.879 1.654-1.955 1.078-2.879 1.653c-.369.216-.848.216-1.254 0l-2.288-1.294c-.369-.215-.627-.61-.627-1.042V12.19c0-.431.221-.826.627-1.042l2.25-1.258c.37-.216.85-.216 1.256 0l2.25 1.258c.37.216.628.611.628 1.042v1.654l1.955-1.115v-1.653a1.16 1.16 0 00-.627-1.042l-4.17-2.372c-.369-.216-.848-.216-1.254 0l-4.244 2.372A1.16 1.16 0 006 11.076v4.78c0 .432.221.827.627 1.043l4.244 2.372c.369.215.849.215 1.254 0l2.879-1.618 1.955-1.114 2.879-1.617c.369-.216.848-.216 1.254 0l2.251 1.258c.37.215.627.61.627 1.042v2.552c0 .431-.22.826-.627 1.042l-2.25 1.294c-.37.216-.85.216-1.255 0l-2.251-1.258c-.37-.216-.628-.611-.628-1.042v-1.654l-1.955 1.115v1.653c0 .431.221.827.627 1.042l4.244 2.372c.369.216.848.216 1.254 0l4.244-2.372c.369-.215.627-.61.627-1.042v-4.78a1.16 1.16 0 00-.627-1.042l-4.28-2.409z" fill="#FFF" />
                        </g>
                      </svg>
                      <span className="pl-1 text-sm font-bold text-gray-900 dark:text-white">{getLowestSeatedPrice(sections.name)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-center">
                      <div className="text-center lg:px-4">
                        <div className="inline-flex items-center rounded-full bg-indigo-800 leading-none text-indigo-100" role="alert">
                          <span className="flex rounded-full bg-indigo-500 px-2 py-1 text-xs font-bold uppercase">New</span>
                          <span className="mr-2 flex-auto p-1 text-left font-semibold">
                            <p className="inline-block font-bold">{sections.totalAvailableTickets}</p> tickets left{" "}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-center">
                      <button
                        className="flex w-full justify-center rounded-md bg-violet-800 p-2 text-xs text-white transition duration-500 ease-in-out focus:outline-none focus:ring-1 focus:ring-white hover:scale-[1.02] hover:bg-violet-700 hover:shadow-md hover:shadow-violet-400 md:text-sm"
                        onClick={() => {
                          window.location.href = '/app/client/purchase-ticket/' + event.eventId
                        }}>
                        Buy your ticket
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )
      }
    </>
  );
};

export default EventData;
