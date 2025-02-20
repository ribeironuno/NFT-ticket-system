import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  NonSeatedSeats,
  SeatedSeats,
  Timer,
  Refunds,
  Details,
  Stats,
} from "../../../components";
import { ethers } from "ethers";
import ReactLoading from "react-loading";
import { motion, useMotionValue, useTransform } from "framer-motion";
import constants from "../../../configs/constants";
import storageABI from "../../../configs/abi.json";
import Toast, { ToastType } from "../../../components/generic/Toast";
import { Toaster } from "react-hot-toast";
import { wait } from "@testing-library/user-event/dist/utils";
import { toMonthName } from "../../../helper/functionsGeneral";
const moment = require("moment");

const Event = () => {
  //selected menu
  const [menu, setMenu] = useState("dates");
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState();
  const [structure, setStructure] = useState();
  const [canBeMinted, setCanBeMinted] = useState();
  const [alreadyHappened, setAlreadyHappened] = useState();
  const navigate = useNavigate();
  let progress = useMotionValue(90);

  //atual date formatt date
  const atualDate = new Date().toLocaleDateString("en-GB").replaceAll("/", "-");
  atualDate.replace("/", "-");

  const currentDate = moment();
  const formattedDate = currentDate.format("DD-MM-YYYY HH:mm:ss");
  var current = moment(formattedDate, "DD-MM-YYYY HH:mm:ss");
  var startDate;

  //Get id from url
  const queryParams = new URLSearchParams(window.location.search);
  const id = queryParams.get("eventId");

  const dataFetchedRef = useRef(false);
  //Fetch event
  const url = constants.URL_EVENTS;
  const fetchData = () => {
    fetch(url + `getOrganizerEvent?eventId=${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        setIsLoading(false);
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        calculateDeadline(data);
        setEvent(data);
        setStructure(data.structure);
        var startDateTime = data.datesInfo.startDate.dayMonthYear + " " + data.datesInfo.startDate.startTime.replace("h", ":") + ":00";
        startDate = moment(startDateTime, "DD-MM-YYYY HH:mm:ss");
        setAlreadyHappened(startDate.isBefore(current));
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  function maticToWei(value) {
    return value * 10000000000000000
  }

  //smart contract area
  const contractAddress = constants.CONTRACT_ADDRESS;
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const [isLoadingMinting, setIsLoadingMinting] = useState(false);
  const [isLoadingPinning, setIsLoadingPinning] = useState(false);
  const [afterMintedSuccess, setAfterMintedSuccess] = useState(false);
  const [statusAccount, setStatusAccount] = useState();

  //sets up ethers
  const updateEthers = async () => {
    let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
    let tempProvider2 = new ethers.providers.EtherscanProvider();

    tempProvider2.getEtherPrice().then(function (price) {
      console.log("Ether price in USD: " + price);
    });

    setProvider(tempProvider);

    let tempSigner = tempProvider.getSigner();
    setSigner(tempSigner);

    let tempContract = new ethers.Contract(contractAddress, storageABI, tempSigner);
    setContract(tempContract);
  };

  //calls backend to return the metadata
  const initMint = () => {
    //gets the url according with the event status
    let urlToCall;
    let methodToCall;
    if (event.status === "NotMinted") {
      urlToCall = url + `initMint?eventId=${id}`;
      methodToCall = "POST";
    } else {
      urlToCall = url + `halfMint?eventId=${id}`;
      methodToCall = "GET";
    }
    setIsLoadingPinning(true);
    fetch(urlToCall, {
      method: methodToCall,
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        setIsLoadingPinning(false);
        if (!res.ok) throw new Error(res.json());
        else return res.json();
      })
      //callback to mint process3
      .then((data) => {
        if (statusAccount === "Active") {
          console.log(data);
          finalizeMint(data);
        }

      })
      .catch((err) => {
        setIsLoadingPinning(false);
        console.log(err);
      });
  };

  //finish the process of mint by calling smart contract
  const finalizeMint = (res) => {
    setIsLoadingMinting(true);
    const maxTickets = event.maxTicketsPerPerson === null ? 0 : event.maxTicketsPerPerson;

    //prepare the array of sections
    var ticketTuple = [];
    res.forEach((tickets) => {
      let obj = [];
      obj.push(tickets.ipfs);
      obj.push(tickets.sectionOrRowId);
      obj.push(tickets.type === "Seated" ? 1 : 0);
      obj.push(tickets.numberOfTickets);
      obj.push(maticToWei(tickets.price).toString().replace(".", ""));
      ticketTuple.push(obj);
    });

    let error = false;

    //check if user is not logged
    if (window.ethereum) {
      if (!provider.isMetaMask) {
        if (typeof window.ethereum !== "undefined") {
          window.ethereum.enable();
        } else if (typeof window.web3 !== "undefined") {
          window.web3.currentProvider.enable();
        }
      } else {
        error = true;
        Toast("Error on metamask", "Login on your metamask account!", ToastType.DANGER);
      }
    } else {
      error = true;
      Toast("Error on metamask", "Metamask is not installed!", ToastType.DANGER);
    }

    if (!error) {
      //transform date to unix time to send to the smart contract
      let unixTime = moment(event.datesInfo.startDate.dayMonthYear, "DD/MM/YYYY").add(25, 'hours').unix();

      console.log('b',moment(event.datesInfo.startDate.dayMonthYear, "DD/MM/YYYY").unix().toString());
      console.log('a',unixTime.toString());

      console.log("obj", ticketTuple);

      //calls the smart contract function
      contract
        .createEvent(event.eventId, maxTickets, unixTime, ticketTuple, {
          value: "6000000000000000",
        })
        .then(async (result) => {
          //if transaction returns a hash
          if (result.hash) {
            //after validation the transaction is saved in the off-chain

            fetch(url + `finalizeMint?eventId=${id}&txHash=${result.hash}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              method: "POST",
            })
              .then((res) => {
                if (!res.ok) throw new Error(res.json());
                else return res.json();
              })
              .then((res) => {
                setIsLoadingMinting(false);
                setAfterMintedSuccess(true);
                setTimeout(function () {
                  setAfterMintedSuccess(false);
                }, 2000);
                setEvent({ ...event, status: "Minted", txHash: result.hash });
                setTimeout(function () {
                  let urlScan = "https://mumbai.polygonscan.com/tx/" + result.hash;
                  window.open(urlScan, "_blank");
                }, 10000);
              })
              .catch((error) => {
                setIsLoadingMinting(false);
                console.error("error", error);
                Toast("Error", "Something happened! We could not mint you event", ToastType.DANGER);
              });
          } else {
            Toast("Error", "Something happened! We could not mint you event", ToastType.DANGER);
          }
        })
        .catch((error) => {
          setIsLoadingMinting(false);
          console.error("error", error);
          Toast("Error", "Something happened! We could not mint you event", ToastType.DANGER);
        });
    }
  };

  const truncateFromMiddle = (fullStr = "", strLen, middleStr = "...") => {
    if (fullStr.length <= strLen) return fullStr;
    const midLen = middleStr.length;
    const charsToShow = strLen - midLen;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    return fullStr.substr(0, frontChars) + middleStr + fullStr.substr(fullStr.length - backChars);
  };

  //GET generate validators key
  function fetchValidatorKey() {
    if (statusAccount === "Banned") {
      Toast("Your account was banned!", "Validators groups information are read-only", ToastType.DANGER);
    } else {
      fetch(url + `generate-validators-key?eventId=${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((res) => {
          console.log(res);
          if (!res.ok) throw new Error(res.json());
          else {
            return res.text();
          }
        })
        .then((data) => {
          Toast("Copied", "Validators key to the clipboard!", ToastType.SUCCESS);
          navigator.clipboard.writeText(data);
          setEvent({
            ...event,
            validation: {
              ...event.validation,
              hash: data,
            },
          });
        })
        .catch((err) => {
          console.log(err);
          Toast("Error", "Ocorrured an error trying to generate validators key", ToastType.DANGER);
        });
    }
  }

  function checkStatusAccount() {
    fetch(constants.URL_ORGANIZERS + "information-account", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        if (data.statusAccount !== "Active") {
          Toast("Your account aren't valid!", "Event are read-only", ToastType.DANGER);
        }
        setStatusAccount(data.statusAccount);
      })
      .catch((error) => {
        Toast("Error getting your data", "Try again later", ToastType.DANGER);
        console.log(error);
      });
  }

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetchData();
    checkStatusAccount();
    updateEthers();
  }, []);

  let deadline;

  function calculateDeadline(event) {
    var startDateTime = event.datesInfo.startDate.dayMonthYear + " " + event.datesInfo.startDate.startTime.replace("h", ":") + ":00";
    var startDateTotal = moment(startDateTime, "DD-MM-YYYY HH:mm:ss");
    var creationDateTotal = moment(event.statusDates.created, "DD-MM-YYYY HH:mm:ss");

    var duration = moment.duration(creationDateTotal.diff(startDateTotal));

    //check if the event was created 2 days before start event date
    if (duration.asDays() >= -2) {
      //if true than the deadline is 2h until the start of event

      deadline = moment(startDateTotal, "DD-MM-YYYY HH:mm:ss").subtract(2, "hours");
      if (deadline.isBefore(current)) {
        setCanBeMinted(false);
      } else {
        setCanBeMinted(true);
      }
    } else {
      deadline = moment(event.statusDates.created, "DD-MM-YYYY HH:mm:ss").add(48, "hours");
      if (deadline.isBefore(current)) {
        setCanBeMinted(false);
      } else {
        setCanBeMinted(true);
      }
    }
  }

  //after minted
  function Confirmed({ progress }) {
    const circleLength = useTransform(progress, [0, 100], [0, 1]);
    const checkmarkPathLength = useTransform(progress, [0, 95, 100], [0, 0, 1]);
    const circleColor = useTransform(progress, [0, 95, 100], ["#FFCC66", "#FFCC66", "#66BB66"]);

    return (
      <motion.svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 258 258">
        {/* Check mark  */}
        <motion.path transform="translate(60 85)" d="M3 50L45 92L134 3" fill="transparent" stroke="#7BB86F" strokeWidth={8} style={{ pathLength: checkmarkPathLength }} />
        {/* Circle */}
        <motion.path
          d="M 130 6 C 198.483 6 254 61.517 254 130 C 254 198.483 198.483 254 130 254 C 61.517 254 6 198.483 6 130 C 6 61.517 61.517 6 130 6 Z"
          fill="transparent"
          strokeWidth="8"
          stroke={circleColor}
          style={{
            pathLength: circleLength,
          }}
        />
      </motion.svg>
    );
  }


  const deleteEvent = () => {
    if (statusAccount === "Banned") {
      Toast("Your account was banned!", "Validators groups information are read-only", ToastType.DANGER);
    } else {
      fetch(url + `cancel?eventId=${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        method: "PUT",
      })
        .then((res) => {
          if (!res.ok) throw new Error(res.json());
          else return res.json();
        })
        .then((res) => {
          Toast("Delete operation", "Event deleted with success!", ToastType.SUCCESS);
          wait(1000).then(() => {
            navigate("/app/organizer/events");
          });
        })
        .catch((err) => {
          Toast("Delete operation", "Event could not be deleted.", ToastType.DANGER);
        });
    }
  };

  const cancelEvent = () => {
    if (statusAccount === "Banned") {
      Toast("Your account was banned!", "Validators groups information are read-only", ToastType.DANGER);
    } else {
      contract
        .cancelEvent(id)
        .then(async (result) => {
          if (result.hash) {
            fetch(url + `cancel?eventId=${id}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              method: "POST",
            })
              .then((res) => {
                if (!res.ok) throw new Error(res.json());
                else return res.json();
              })
              .then((res) => {
                Toast("Success", "Event canceled with success!", ToastType.SUCCESS);
              })
              .catch((error) => {
                Toast("Error", "Something happened! We could not cancel your event", ToastType.DANGER);
              });
          } else {
            Toast("Error", "Something happened! We could not cancel your event", ToastType.DANGER);
          }
        })
        .catch((error) => {
          Toast("Error", "Something happened! We could not cancel your event", ToastType.DANGER);
        });
    }
  };

  return (
    <div>
      {(!event || !structure) && (
        <div className="flex flex-wrap items-center justify-center pt-24 ">
          <ReactLoading type={"bubbles"} height={100} width={120} color={"#5b2bab"} />
          <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">Loading</span>
        </div>
      )}
      {event && structure && (
        <>
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


          {event && event.status === "Critical" &&
            <div className="col-span-6 bg-red-800 rounded-lg p-4 flex justify-center text-white text-lg font-medium w-full my-8">
              <label className="w-full text-center">
                This event was marked as critical due to many refunds requests!
              </label>
            </div>
          }

          {isLoadingMinting && (
            <div className="flex flex-wrap items-center justify-center">
              <ReactLoading type={"bubbles"} height={100} width={120} color={"#5b2bab"} />
              <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">Minting the event</span>
              <h1 className=" mt-8 text-center font-bold  drop-shadow-lg dark:text-gray-200 xxs:text-3xl">We are minting all your tickets! Please be patient!</h1>
            </div>
          )}

          {isLoadingPinning && (
            <div className="flex flex-wrap items-center justify-center">
              <ReactLoading type={"bubbles"} height={100} width={120} color={"#5b2bab"} />
              <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">Preparing to mint</span>
              <h1 className=" mt-8 text-center font-bold  drop-shadow-lg dark:text-gray-200 xxs:text-3xl">
                This operation can take awhile. We are preparing everything in order to execute the mint! Please be patient!
              </h1>
            </div>
          )}

          {afterMintedSuccess && (
            <div className="flex w-full flex-wrap items-center justify-center pt-24">
              <motion.div initial={{ x: 0 }} animate={{ x: 100 }} style={{ x: progress }} transition={{ duration: 1 }} />
              <Confirmed progress={progress} />
              <h1 className="mt-3 w-full text-center text-xl font-semibold uppercase text-green-500">Congratulations</h1>
              <h1 className="mt-3 mb-1 w-full  text-center text-lg font-semibold text-gray-500">The event it's now minted!</h1>
            </div>
          )}

          {!isLoadingMinting && !isLoadingPinning && !afterMintedSuccess && (
            <div className=" grid overflow-visible lg:grid-cols-5 lg:grid-rows-2">
              <div className="mb-8 lg:col-span-2 lg:row-span-2">
                <p className="pr-4 pt-3 text-lg font-extralight text-black opacity-70 dark:text-white sm:mt-5">{event.description}</p>

                {/* EVENT CAN BE MINTED*/}
                {canBeMinted && (event.status === "NotMinted" || event.status === "HalfMinted") && (
                  <>
                    <Timer event={event} />
                    <div className="flex w-full items-center justify-center text-center text-2xl">
                      <button
                        type="button"
                        className="mr-2 mb-2 rounded-lg bg-gradient-to-r from-green-400 via-green-500 to-green-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg shadow-green-500/50 focus:outline-none focus:ring-4 focus:ring-green-300 hover:bg-gradient-to-br dark:shadow-lg dark:shadow-green-800/80 dark:focus:ring-green-800"
                        onClick={() => {
                          initMint();
                        }}
                      >
                        {event.status === "NotMinted" && <>Mint now (0.006 MATIC fee)</>}
                        {event.status === "HalfMinted" && <>Complete mint (0.006 MATIC fee)</>}
                      </button>
                    </div>
                    <div className="flex w-full items-center justify-center text-center text-2xl">
                      <h3 className="mb-3 inline-block scale-75 text-center text-2xl font-extralight text-black dark:text-white sm:scale-100">or</h3>
                    </div>
                    <div className="flex w-full items-center justify-center text-center text-2xl">
                      <button
                        onClick={() => deleteEvent()}
                        type="button"
                        className="mr-2 mb-2 rounded-lg bg-gradient-to-r from-red-400 via-red-500 to-red-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg shadow-red-500/50 focus:outline-none focus:ring-4 focus:ring-red-300 hover:bg-gradient-to-br dark:shadow-lg dark:shadow-red-800/80 dark:focus:ring-red-800"
                      >
                        Delete event
                      </button>
                    </div>
                  </>
                )}

                {event.status === "Minted" && (
                  <button
                    className="mx-auto mt-3 flex w-2/3 items-center justify-center text-center sm:w-full"
                    onClick={() => {
                      let urlScan = "https://mumbai.polygonscan.com/tx/" + event.txHash;
                      window.open(urlScan, "_blank");
                    }}
                  >
                    <div className="sm:scale-25 flex w-fit justify-center p-6">
                      <div className="flex w-fit flex-wrap overflow-hidden rounded-lg bg-gray-200 p-2 shadow dark:bg-gray-600">
                        <div className="w-full flex-col justify-center text-center font-bold">
                          <h3 className="my-auto mb-1 inline-block text-lg font-bold text-black dark:text-white">Minted</h3>
                        </div>
                        <div className=" flex w-full justify-center rounded-md p-3 ">
                          <svg width="30px" height="40px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                            <g fill="none">
                              <circle fill="#6F41D8" cx="16" cy="16" r="16" />
                              <path
                                d="M21.092 12.693c-.369-.215-.848-.215-1.254 0l-2.879 1.654-1.955 1.078-2.879 1.653c-.369.216-.848.216-1.254 0l-2.288-1.294c-.369-.215-.627-.61-.627-1.042V12.19c0-.431.221-.826.627-1.042l2.25-1.258c.37-.216.85-.216 1.256 0l2.25 1.258c.37.216.628.611.628 1.042v1.654l1.955-1.115v-1.653a1.16 1.16 0 00-.627-1.042l-4.17-2.372c-.369-.216-.848-.216-1.254 0l-4.244 2.372A1.16 1.16 0 006 11.076v4.78c0 .432.221.827.627 1.043l4.244 2.372c.369.215.849.215 1.254 0l2.879-1.618 1.955-1.114 2.879-1.617c.369-.216.848-.216 1.254 0l2.251 1.258c.37.215.627.61.627 1.042v2.552c0 .431-.22.826-.627 1.042l-2.25 1.294c-.37.216-.85.216-1.255 0l-2.251-1.258c-.37-.216-.628-.611-.628-1.042v-1.654l-1.955 1.115v1.653c0 .431.221.827.627 1.042l4.244 2.372c.369.216.848.216 1.254 0l4.244-2.372c.369-.215.627-.61.627-1.042v-4.78a1.16 1.16 0 00-.627-1.042l-4.28-2.409z"
                                fill="#FFF"
                              />
                            </g>
                          </svg>
                        </div>
                        <div className="w-full flex-col justify-center text-center">
                          <h3 className="my-auto mb-1 inline-block text-xs text-black dark:text-white md:text-lg">
                            {event.txHash ? truncateFromMiddle(event.txHash, event.txHash.length / 2, "...") : "Without hash information"}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </button>
                )}

                {/* HASH CAN BE GENARATED IF WAS MINTED AND THE VALIDATION IS BOTH OR HASH */}
                {event.status === "Minted" && (event.validation.validationType === "hash" || event.validation.validationType === "both") && (
                  <div className="mt-3 flex w-full items-center justify-center text-center">
                    {event.validation.hash && (
                      <button
                        type="button"
                        className="mr-2 mb-2 rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg shadow-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-300 hover:bg-gradient-to-br dark:shadow-lg dark:shadow-cyan-800/80 dark:focus:ring-cyan-800"
                        onClick={() => {
                          Toast("Copied", "Validators key copied to the clipboard!", ToastType.SUCCESS);
                          navigator.clipboard.writeText(event.validation.hash);
                        }}
                      >
                        Copy validators key
                      </button>
                    )}
                    <button
                      type="button"
                      className="mr-2 mb-2 rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg shadow-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-300 hover:bg-gradient-to-br dark:shadow-lg dark:shadow-cyan-800/80 dark:focus:ring-cyan-800"
                      onClick={() => {
                        fetchValidatorKey();
                      }}
                    >
                      Generate validators key
                    </button>
                  </div>
                )}

                {/*EVENT ONLY CAN BE CANCELED IF WERE MINTEND AND NOT HAPPEN */}
                {event.status === "Minted" && !alreadyHappened && (
                  <>
                    <div className="mt-2 flex w-full items-center justify-center text-center">
                      <button
                        onClick={() => cancelEvent()}
                        type="button"
                        className="mr-2 mb-2 rounded-lg bg-gradient-to-r from-red-400 via-red-500 to-red-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg shadow-red-500/50 focus:outline-none focus:ring-4 focus:ring-red-300 hover:bg-gradient-to-br dark:shadow-lg dark:shadow-red-800/80 dark:focus:ring-red-800"
                      >
                        Cancel event
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="grid overflow-auto lg:col-span-3 lg:row-span-2 lg:mt-8">
                <div className="ui menu text-white ">
                  <button type="button" className="font-bold text-black dark:text-white sm:pl-2" onClick={() => setMenu("dates")}>
                    DATES
                  </button>
                  <button type="button" className="pl-4 font-bold text-black dark:text-white" onClick={() => setMenu("details")}>
                    DETAILS
                  </button>
                  <button
                    type="button"
                    className="pl-4 font-bold text-black dark:text-white"
                    onClick={() => {
                      setMenu("refunds");
                    }}>
                    REFUNDS
                  </button>
                  {/* Event already happened, then the stats are available */}
                  <button type="button" className="pl-4 font-bold text-black dark:text-white" onClick={() => setMenu("stats")}>
                    STATS
                  </button>
                  {menu === "dates" && (
                    <>
                      <>
                        <div className="flex w-full items-center justify-center text-center">
                          {event.datesInfo.duration === "one_day" ? (
                            <h3 className="mb-1 mt-4 inline-block text-xl font-extralight text-black dark:text-white">
                              {event.datesInfo.startDate.dayMonthYear} {event.datesInfo.endDate} {event.datesInfo.startDate.startTime}-{event.datesInfo.startDate.endTime}{" "}
                              {event.ageRestriction != null && "+" + event.ageRestriction.split("plus_")[1]}
                            </h3>
                          ) : (
                            <h3 className="mb-1 mt-4 inline-block text-xl font-extralight text-black dark:text-white">
                              {event.datesInfo.startDate.dayMonthYear} at {event.datesInfo.startDate.startTime} till {event.datesInfo.endDate.dayMonthYear} at {event.datesInfo.endDate.endTime}{" "}
                              {event.ageRestriction != null && "+" + event.ageRestriction.split("plus_")[1]}
                            </h3>
                          )}
                        </div>
                        <div className="flex w-full items-center justify-center text-center">
                          <h4 className="mt-1 mb-2 text-xl font-bold text-black dark:text-white  sm:mx-3"> {event.structure.name}</h4>
                        </div>

                        {structure.nonSeatedSections.length > 0 && (
                          <>
                            <h3 className="mt-2  mb-2 inline-block text-lg font-extralight text-black dark:text-white  sm:mx-3">Non-seated sections</h3>

                            <NonSeatedSeats sections={structure.nonSeatedSections} eventStatus={event.status} />
                          </>
                        )}

                        {structure.seatedSections.length > 0 && (
                          <>
                            <div className="flex w-full">
                              <h3 className="mt-3 inline-block text-lg font-extralight text-black dark:text-white sm:mx-3">Seated sections</h3>
                            </div>
                            {structure.seatedSections.map((section) => (
                              <div key={"div"}>
                                <h3 className="text-md my-1 mt-2 mb-2 inline-block font-extralight text-black dark:text-white sm:mx-3">{section.name}</h3>
                                <h4 className="text-md my-1 mt-2 mb-2 inline-block font-extralight text-black dark:text-white sm:mx-3">Door: {section.door}</h4>
                                <SeatedSeats sections={section} eventStatus={event.status} />
                              </div>
                            ))}
                          </>
                        )}

                        {event.maxTicketsPerPerson && (
                          <div className="flex w-full items-center justify-center text-center">
                            <h3 className="text-md mx-3 my-3 inline-block font-extralight text-black  dark:text-white">* Max of {event.maxTicketsPerPerson} tickets per wallet</h3>
                          </div>
                        )}
                      </>
                    </>
                  )}
                  {menu === "details" && (
                    <Details event={event} atualDate={atualDate} />
                  )}
                  {menu === "refunds" && (
                    <Refunds id={event.eventId} />
                  )}
                  {menu === "stats" && (
                    <Stats data={event} structure={structure} />
                  )}
                </div>
              </div>
              <Toaster
                reverseOrder={false}
                position="top-center"
                toastOptions={{
                  style: {
                    borderRadius: "8px",
                    background: "#4b5563",
                    color: "#fff",
                  },
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default Event;
