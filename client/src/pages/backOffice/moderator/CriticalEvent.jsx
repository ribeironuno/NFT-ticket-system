import React, { Fragment, useState, useEffect } from "react";
import DividerLine from "../../../components/generic/DividerLine";
import GenericButton from "../../../components/generic/GenericButton";
import ErrorModel from "../../../components/generic/ErrorModal";
import SearchBar from "../../../components/generic/SearchBar";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { PencilAltIcon, XIcon } from "@heroicons/react/outline";
import { toMonthName, compareDates } from "../../../helper/functionsGeneral";
import {
  ChevronDownIcon,
  ArrowNarrowUpIcon,
  ArrowNarrowDownIcon,
} from "@heroicons/react/solid";
import constants from "../../../configs/constants";
import Toast, { ToastType } from "../../../components/generic/Toast";
import { Toaster, toast, ToastBar } from "react-hot-toast";
import { HiX } from "react-icons/hi";
import ReactLoading from "react-loading";
const sortOptions = ["Fraud", "Personal", "Bad Organization", "Other"];

export const DateFilterType = {
  ASCENDING: 1,
  DESCENDING: 2,
};

const CriticalEvent = () => {
  const [searchBar, setSearchBar] = useState("");
  const [dateFilter, setDateFilter] = useState(DateFilterType.DESCENDING);
  const [refund, setRefund] = useState("");
  const [isDeleteStructModalOpen, setIsDeleteStructModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [sortType, setSortType] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState(null);

  const queryParams = new URLSearchParams(window.location.search);
  const id = queryParams.get("eventId");

  const toggleDetailModal = () => {
    setIsDetailModalOpen(!isDetailModalOpen);
  };

  //PUT ban organizer
  const banOrganizerRequest = (organizerId) => {
    fetch(constants.URL_ORGANIZERS + "change-status-account", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: organizerId, status: "Banned" }),
    })
      .then((res) => {
        if (res.ok) {
          Toast("Organizer banned", " ", ToastType.SUCCESS);
          setTimeout(() => {
            window.location.reload(false);
          }, 1500);
        } else {
          Toast(
            "Error trying to ban organizer",
            "Try again later",
            ToastType.DANGER
          );
        }
      })
      .catch((err) => {
        Toast(
          "Error trying to ban organizer",
          "Try again later",
          ToastType.DANGER
        );
      });
  };

  useEffect(() => {
    var tmp = refunds.slice();

    tmp.sort(function (a, b) {
      return dateFilter === DateFilterType.ASCENDING
        ? compareDates(b.dateOfRegistration, a.dateOfRegistration)
        : compareDates(a.dateOfRegistration, b.dateOfRegistration);
    });
  }, [dateFilter]);

  const toggleErrorModal = () => {
    setIsDeleteStructModalOpen(!isDeleteStructModalOpen);
  };

  //fetch event, organizer, refunds and stats data
  useEffect(() => {
    var eventId;
    setIsLoading(true);

    fetch(`${constants.URL_EVENTS}getEvent?eventId=${id}`)
      .then((res) => {
        if (res.ok) return res.json();
        else throw Error(res);
      })
      .then((data) => {
        eventId = data.message.eventId;
        setEvent(data.message);
        return data.message.organizerId;
      })
      .then((organizerId) => {
        fetch(`${constants.URL_ORGANIZERS}getAll`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        })
          .then((res) => {
            if (res.ok) return res.json();
            else throw Error(res);
          })
          .then((data) => {
            data.forEach((organizer) => {
              if (organizer.organizerId === organizerId) {
                setOrganizer(organizer);
              }
            });
          })
          .then(() => {
            fetch(
              `${constants.URL_REFUNDS}getEventRefunds?eventId=${eventId}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json",
                },
              }
            )
              .then((res) => {
                if (res.ok) return res.json();
                else throw Error(res);
              })
              .then((data) => {
                setRefunds(data);
              })
              .then(() => {
                fetch(
                  `${constants.URL_REFUNDS}getCriticalEventStats?eventId=${eventId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                      "Content-Type": "application/json",
                    },
                  }
                )
                  .then((res) => {
                    if (res.ok) return res.json();
                    else throw Error(res);
                  })
                  .then((data) => {
                    setIsLoading(false);
                    setStats(data);
                  })
                  .catch((err) => {
                    setIsLoading(false);
                  });
              })
              .catch((err) => {
                setIsLoading(false);
              });
          })
          .catch((err) => {
            setIsLoading(false);
          });
      })
      .catch((err) => {
        setIsLoading(false);
      });
  }, []);

  const handleProofFilesDownload = (fileName) => {
    fetch(`${constants.URL_REFUNDS}downloadProofFiles?path=${fileName}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (response.ok) return response.blob();
        else throw Error(response);
      })
      .then((blob) => {
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
      })
      .catch((err) => {
        console.log(err);
      });
  };

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

  return isLoading ? (
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
  ) : stats === null ? (
    <div className="flex justify-center">Unable to fetch data...</div>
  ) : (
    <div className="min-h-[calc(100vh-425px)] p-4 dark:bg-gray-900 sm:min-h-[calc(100vh-377px)] md:min-h-[calc(100vh-286px)] md:p-6">
      <TailwindToaster />
      {/* TODO: ALTERAR ID A SER ENVIADO NA FUNÇÃO banOrganizerRequest, COLOCAR DINÁMICO */}
      {isDeleteStructModalOpen && (
        <ErrorModel
          tittle={"Ban organizer"}
          message={
            "You have sure that you want to complete the operation? There is a severe consequence for the organizer, and must be a solid choice take on our part! You will be the responsible for this action."
          }
          onClick={() => {
            //AQUI OU SEM PARAMETRO E ENVIAR NA FUNÇÃO A PARTIR DO USESTATE
            banOrganizerRequest(organizer.organizerId);
          }}
          cancelBtnName={"Cancel"}
          submitBtnName={"Delete"}
          toggleModal={toggleErrorModal}
        />
      )}

      {/* TITLE AND BUTTON */}
      <div className="flex flex-wrap justify-center sm:justify-between">
        <span className="self-start text-2xl font-extrabold tracking-tight dark:text-white lg:text-3xl xl:text-4xl">
          Critical event analysis
        </span>
      </div>

      <DividerLine />

      {/* HEADER EVENT*/}
      <div className="grid grid-cols-3 md:divide-x md:divide-gray-500">
        <div className="col-span-3 p-0 md:col-span-2 md:pr-5 ">
          {/* IMAGE */}
          <div className="flex w-full flex-wrap justify-start">
            <div
              id="ticketBanner"
              className={`flex min-h-fit w-full flex-col
                                rounded-md bg-cover bg-center text-left text-white duration-300 ease-in-out lg:flex-row`}
              style={{
                backgroundImage: `url(${
                  constants.SERVER_URL + "/" + event.banner.replace(/\\/g, "/")
                })`,
              }}>
              <div className="lg:w-5/3 flex w-full flex-row space-x-10 rounded-md bg-black bg-opacity-70 p-5 align-middle md:w-full">
                <div
                  className="b-0 grid min-h-fit w-1/4 content-center rounded-md bg-gray-500 bg-opacity-80 p-2 
                            text-center font-bold md:w-1/5">
                  <p className="text-2xl text-black">
                    {event.datesInfo.startDate.dayMonthYear.split("-")[2]}
                  </p>
                  <p className="text-2xl text-black">
                    {toMonthName(
                      event.datesInfo.startDate.dayMonthYear.split("-")[1]
                    )}
                  </p>
                  <p className="text-4xl text-black">
                    {event.datesInfo.startDate.dayMonthYear.split("-")[0]}
                  </p>
                </div>

                <div className="w-full w-3/4 space-y-5 p-1 font-bold sm:p-5 md:w-4/5">
                  <p className="text-center text-xl text-white sm:text-left sm:text-4xl">
                    {event.name}
                  </p>
                  <p className="text-center text-lg text-white sm:text-left">
                    {event.location + ", " + event.country}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="col-span-3 mt-5 flex min-h-full flex-wrap justify-between p-0 md:col-span-1 md:mt-0 md:pl-5 ">
          <div className="mb-5 flex h-fit w-full flex-wrap justify-center md:mb-0">
            <p className="w-full text-center text-3xl font-extrabold tracking-tight dark:text-white">
              Organizer
            </p>
            <p className="w-full pt-4 text-center text-2xl font-medium tracking-tight dark:text-white md:pt-3 xl:pt-3">
              {organizer.name}
            </p>
          </div>

          <div className="mt-auto flex w-full flex-wrap justify-between md:justify-end md:space-y-4 lg:justify-between lg:space-y-0">
            <GenericButton
              name={"Send email"}
              onClick={(e) => {
                window.location.href = `mailto:${organizer.email}?subject=Are%20you%20playing%20with%20our%20dear%20customers?&body=Either%20you%20do%20refunds%20or%20we're%20going%20to%20have%20problems...Rui%20Jorge%20will%20catch%20you..`;
                e.preventDefault();
                Toast(
                  "Warning",
                  "If nothing happens the e-mail is " + organizer.email,
                  ToastType.DANGER
                );
              }}
              color={"indigo"}
              className={"h-fit w-fit md:w-full lg:w-fit"}
            />
            {/*TODO: ESCONDER ESTE BUTTON SE O ESTADO JÁ FOR BANIDO*/}
            <GenericButton
              name={"Ban organizer"}
              onClick={() => {
                toggleErrorModal();
              }}
              color={"red"}
              className={"h-fit w-fit md:w-full lg:w-fit"}
            />
          </div>
        </div>
      </div>

      {/* STATISTICS ABOUT EVENT */}
      <div className="mt-14 w-full">
        <p className="w-full text-start text-2xl font-bold tracking-tight dark:text-white">
          Statistics
        </p>
        <dl
          className="mt-5 grid grid-cols-1 divide-y divide-gray-300 overflow-hidden rounded-lg bg-gray-100 shadow 
                        dark:divide-gray-800 dark:bg-gray-700 md:grid-cols-2 md:divide-x lg:grid-cols-4 lg:divide-y-0">
          <div className="bg-gray-100 px-4 py-5 dark:bg-gray-700 sm:p-6 ">
            <dt className="text-base font-medium text-gray-900 dark:text-gray-300">
              Total refunds requests
            </dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                {stats.totalRefundRequest}
              </div>
            </dd>
          </div>
          <div className="bg-gray-100 px-4 py-5 dark:bg-gray-700 sm:p-6 ">
            <dt className="text-base font-medium text-gray-900 dark:text-gray-300">
              Validated Tickets
            </dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                {stats.validatedTickets}
              </div>
            </dd>
          </div>
          <div className="bg-gray-100 px-4 py-5 dark:bg-gray-700 sm:p-6 ">
            <dt className="text-base font-medium text-gray-900 dark:text-gray-300">
              Fraud complaints
            </dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                {stats.fraudComplaints}
              </div>
            </dd>
          </div>
          <div className="bg-gray-100 px-4 py-5 dark:bg-gray-700 sm:p-6 ">
            <dt className="text-base font-medium text-gray-900 dark:text-gray-300">
              Open refunds
            </dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                {stats.openRefunds}
              </div>
            </dd>
          </div>
        </dl>
      </div>

      {/* LIST */}
      <div className="mt-14 w-full">
        <p className="mb-6 w-full text-start text-2xl font-bold tracking-tight dark:text-white">
          List of refunds
        </p>

        {/* FILTERS */}
        <div className="grid w-full grid-cols-4 gap-6">
          {/* SEARCH BAR */}
          <div className="col-span-4 sm:col-span-3 md:col-span-2">
            <SearchBar
              placeholder={"Refund id or title "}
              stateValue={searchBar}
              onChangeFunction={setSearchBar}
            />
          </div>

          {/* FILTERS */}
          <div className="col-start-4 col-end-4 my-auto flex justify-end">
            <Menu as="div" className="relative justify-end text-left">
              <div>
                <Menu.Button className="group inline-flex justify-center text-lg font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300">
                  Sort
                  <ChevronDownIcon
                    className="-mr-1 ml-1 h-8 w-8 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
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
                <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {sortOptions.map((option, key) => (
                      <Menu.Item key={key}>
                        <p
                          onClick={() => {
                            if (option === "Bad Organization")
                              setSortType("Bad_organization");
                            else setSortType(option);
                          }}
                          className={`${
                            option === sortType
                              ? "font-medium text-gray-900"
                              : "text-gray-500"
                          }
                                                            block cursor-pointer px-4 py-2 text-sm`}>
                          {option}
                        </p>
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            <Menu
              as="div"
              className="relative justify-end pl-4 text-left md:pl-8">
              <Menu.Button
                className="group inline-flex justify-center text-lg font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300"
                onClick={() => {
                  setDateFilter(
                    dateFilter === DateFilterType.ASCENDING
                      ? DateFilterType.DESCENDING
                      : DateFilterType.ASCENDING
                  );
                }}>
                Date
                {dateFilter === DateFilterType.ASCENDING && (
                  <ArrowNarrowUpIcon
                    className="my-auto -mr-1 ml-1 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                )}
                {dateFilter === DateFilterType.DESCENDING && (
                  <ArrowNarrowDownIcon
                    className="my-auto -mr-1 ml-1 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                )}
              </Menu.Button>
            </Menu>
          </div>
        </div>

        {/* LIST OF REFUNDS */}
        <div className="mt-12 grid w-full grid-cols-2 gap-6">
          {refunds.map((refund, key) => (
            <React.Fragment key={key}>
              {(sortType === refund.type || sortType === "All") &&
                (refund.title.toLowerCase().includes(searchBar.toLowerCase()) ||
                  searchBar === "" ||
                  refund.refundId.toString().includes(searchBar) ||
                  searchBar === "") && (
                  <div
                    className="col-span-2 rounded-lg bg-gray-100 p-4 shadow hover:cursor-pointer hover:bg-gray-300 dark:bg-gray-700 hover:dark:bg-gray-600 xl:col-span-1"
                    onClick={() => {
                      setRefund(refund);
                      toggleDetailModal();
                    }}>
                    <div key={key} className="my-auto grid grid-cols-4 gap-6">
                      <div className="col-span-4 md:col-span-3">
                        <h3 className="text-xs leading-6 text-gray-900 dark:text-gray-200">
                          {refund.walletAddress}
                        </h3>
                        <h3 className="mt-2 text-xl font-medium leading-6 text-gray-900 dark:text-gray-200">
                          {refund.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
                          {refund.description}
                        </p>
                      </div>
                      <div className=" col-span-4 h-full md:col-span-1 md:mt-0">
                        <div className="mt-2 flex w-full flex-wrap justify-end">
                          <p className="text-md w-full text-end font-medium tracking-tight dark:text-white">
                            {refund.dateOfRegistration}
                          </p>

                          <p className="text-md w-full text-end font-medium tracking-tight dark:text-white">
                            {refund.type}
                          </p>

                          <p className="text-md w-full text-end font-medium tracking-tight dark:text-white">
                            ID: {refund.refundId}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* MODAL FOR PRESENTING THE REFUND REQUEST */}
      {isDetailModalOpen && (
        <Transition.Root show={true} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-10 overflow-y-auto"
            onClose={toggleDetailModal}>
            <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0">
                <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span
                className="hidden sm:inline-block sm:h-screen sm:align-middle"
                aria-hidden="true">
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
                  <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:text-gray-500 dark:bg-gray-600"
                      onClick={toggleDetailModal}>
                      <span className="sr-only">Close</span>
                      <XIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10">
                      <PencilAltIcon
                        className="h-6 w-6 text-gray-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">
                        Id: {refund.refundId}
                      </Dialog.Title>
                      <div className="mt-2">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          <div className="col-span-4 md:col-span-3">
                            <p className="text-md leading-6 text-gray-900 dark:text-gray-200">
                              {refund.walletAddress}
                            </p>
                            <p className="text-md mt-8 font-medium leading-6 text-gray-900 dark:text-gray-200">
                              {refund.title}
                            </p>

                            <p className="text-wrap mt-1 break-all text-sm text-gray-500 dark:text-gray-300">
                              {refund.description}
                            </p>

                            <p className="text-md mt-8 w-full text-end font-medium tracking-tight dark:text-white">
                              {refund.dateOfRegistration}
                            </p>

                            <p className="text-md w-full text-end font-medium tracking-tight dark:text-white">
                              {refund.type}
                            </p>

                            {refund.proofFiles != null ? (
                              <div>
                                <p className="mt-1 mt-8 text-sm text-gray-500 dark:text-gray-300">
                                  Proof files
                                </p>
                                <div className="flex justify-center">
                                  <button
                                    onClick={() =>
                                      handleProofFilesDownload(
                                        refund.proofFiles
                                      )
                                    }
                                    className="rounded-xl border px-2 text-gray-600 transition-colors duration-150 hover:bg-gray-200">
                                    click to download files
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      )}
    </div>
  );
};

export default CriticalEvent;
