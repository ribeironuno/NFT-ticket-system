import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon, XCircleIcon } from "@heroicons/react/solid";
import React, { useState, Fragment, useEffect } from "react";
import { Modal, ModalBackground } from "../../../components";
import Toast, { ToastType } from "../../../components/generic/Toast";
import { Toaster, toast } from "react-hot-toast";
import QRcode from "react-qr-code";
import { QRCode } from "react-qrcode-logo";
import CryptoJS from "crypto-js";
import constants from "../../../configs/constants";
import moment from "moment";
import "swiper/css";
import "swiper/css/navigation";
import { ethers } from "ethers";
import ReactLoading from "react-loading";
import storageABI from "../../../configs/abi.json";
import { alert } from "@material-tailwind/react";

/* DORPDOWN FUNCTION */
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* GET ABBREVIATION FROM EVENT DATA */
function toMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1);

  return date.toLocaleString("en-US", {
    month: "short",
  });
}

const TicketsPurchasedByClient = () => {
  const [purchases, setPurchases] = useState([]);
  const [menu, setMenu] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalPurchase, setModalPurchase] = useState("");
  const [modalTicket, setModalTicket] = useState("");
  const [radiosState, setRadiosState] = useState("all");
  const [refundDescription, setRefundDescription] = useState("");
  const [refundEnum, setRefundEnum] = useState("");
  const [refundTitle, setRefundTitle] = useState("");
  const [proofFiles, setProofFiles] = useState(null);
  const [maticPrice, setMaticPrice] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const serverUrl = constants.SERVER_URL;
  let provider = new ethers.providers.Web3Provider(window.ethereum);

  //smart contract area
  const contractAddress = constants.CONTRACT_ADDRESS;
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  //######################################### HTTP #######################################

  const url = constants.URL_PURCHASES;
  const urlRefunds = constants.URL_REFUNDS;

  function updateMaticPrice() {
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
  }

  useEffect(() => {
    provider
      .send("eth_requestAccounts", [])
      .then((result) => {
        fetch(url + `getByWallet?wallet=${result[0]}`)
          .then((res) => {
            if (!res.ok) throw new Error(res.status);
            else return res.json();
          })
          .then((data) => {
            setPurchases(data);
          })
          .catch((err) => {
            console.log(err.message);
          });
      })
      .catch((err) => {
        console.log(err);
      });
    updateMaticPrice();
    updateEthers();
  }, []);

  //sets up ethers
  const updateEthers = async () => {
    let signer = provider.getSigner();
    setSigner(signer);

    let tempContract = new ethers.Contract(contractAddress, storageABI, signer);
    setContract(tempContract);
  };

  function burnTicket(ticket) {
    let tmpPurchase = modalPurchase;
    let purchaseTmp = JSON.parse(JSON.stringify(tmpPurchase));
    purchaseTmp.tickets = [];
    for (let i = 0; i < tmpPurchase.tickets.length; i++) {
      if (tmpPurchase.tickets[i].hash !== ticket.hash) {
        purchaseTmp.tickets.push(ticket)
      }
    }

    contract
      .burnTicket(modalPurchase.eventId, ticket.hash).then(async (result) => {
        //if transaction returns a hash
        if (result.hash) {
          fetch(url + `burnTicket?ticketHash=${ticket.hash}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            body: JSON.stringify(purchaseTmp),
          })

            .then((res) => {
              if (res.status !== 200) {
                Toast("Error", "Something happened! The ticket was not burned", ToastType.SUCCESS);
              } else {
                Toast("Sucess", "The ticket was burned", ToastType.DANGER);
                setTimeout(() => {
                  window.location.reload(false);
                }, 2000);
              }
            })
            .catch((error) => {
              Toast("Error", "Something happened! The ticket was not burned", ToastType.DANGER);
            });
        } else {
          Toast("Error", "Something happened! The ticket was not burned", ToastType.DANGER);
        }
      })
  }


  console.log(modalPurchase);

  /**
   * Function to toggle the modal
   */
  const toggleModal = () => {
    setModalIsOpen(!modalIsOpen);
  };

  function checkIfDatePassed(date) {
    const currentDate = moment();
    const formattedDate = currentDate.format("DD-MM-YYYY");
    var current = moment(formattedDate, "DD-MM-YYYY");

    if (moment(date, "DD-MM-YYYY").isBefore(current)) {
      return true;
    } else {
      return false;
    }
  }

  //SEARCH BAR
  const handleInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const [qrCodeContent, setQRCodeContent] = useState("");

  const generateQRCode = (purchase, ticket, i) => {
    setModalTicket(ticket);
    const currentDate = moment().format("DD-MM-YYYY HH:mm:ss");

    let qrCodeData = {
      wallet: purchase.wallet,
      idEvent: purchase.eventId,
      sectionName: ticket.sectionName,
      idTicket: ticket.hash,
      door: ticket.door,
      dateGenerated: currentDate,
      index: i,
    };

    const ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(qrCodeData),
      constants.KEY_ENCRYPT_QR_CODE
    ).toString();
    console.log(ciphertext);
    setQRCodeContent(ciphertext);
  };

  const sendRefundRequest = async () => {
    if (refundTitle.length < 3) {
      Toast("Error!", "Title must have at least 3 letters", ToastType.DANGER);
      return;
    } else if (refundEnum === "-- Request motivation --") {
      Toast("Error!", "Choose a request", ToastType.DANGER);
      return;
    } else if (refundDescription.length < 30) {
      Toast(
        "Error!",
        "Description should have more that 30 characters",
        ToastType.DANGER
      );
      return;
    }
    let typeEnum = "";

    if (refundEnum === "Fraud") {
      typeEnum = "Fraud";
    } else if (refundEnum === "Personal reasons") {
      typeEnum = "Personal";
    } else if (refundEnum === "Bad organization") {
      typeEnum = "Bad_organization";
    } else {
      typeEnum = "Other";
    }

    const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
    console.log(modalPurchase)
    if (refundDescription.length > 30) {
      tempProvider
        .send("eth_requestAccounts", [])
        .then((result) => {
          const walletAddress = result[0];
          var formData = new FormData();
          formData.append("eventId", modalPurchase.eventId);
          formData.append("walletAddress", walletAddress);
          formData.append("description", refundDescription);
          formData.append("eventName", modalPurchase.eventName);
          formData.append("type", typeEnum);
          formData.append("title", refundTitle);

          if (proofFiles != null) {
            formData.append("proofFiles", proofFiles);
          }

          fetch(urlRefunds + "create", {
            method: "POST",
            body: formData,
          })
            .then((res) => {
              return res.json();
            })
            .then((data) => {
              if (data.status === 200) {
                Toast("Submited", data.message, ToastType.SUCCESS);
                setProofFiles(null);
                setRefundDescription("");
                setRefundEnum("");
                setRefundTitle("");
                setModalIsOpen(false);
              } else {
                Toast("Error", data.message, ToastType.DANGER);
              }
            });
        })
        .catch((error) => {
          Toast(
            "Authentication",
            "Check your web3 wallet connection!",
            ToastType.DANGER
          );
        });
    } else {
      Toast(
        "Error",
        "Description must have at least 30 characters",
        ToastType.DANGER
      );
    }
  };

  const [uri, setUri] = useState()

  function getTokenUri(ticket) {
    console.log('event', modalPurchase.eventId);
    console.log('ticket', ticket);
    contract
      .getTokenUriByHash(modalPurchase.eventId, ticket)
      //if transaction returns a hash
      .then((res) => {
        console.log(res);
        setUri(res)
        return res
      }).catch((error) => {
        console.log(error);
        setUri("")
      })
  }

  const handleRefundEnumChange = (event) => {
    setRefundEnum(event.target.value);
  };

  const handleRefundTitleChange = (event) => {
    setRefundTitle(event.target.value);
  };

  const handleRefundDescriptionChange = (event) => {
    console.log(modalTicket);
    setRefundDescription(event.target.value);
  };

  const handleProofFilesChange = (event) => {
    setProofFiles(event.target.files[0]);
  };

  return (
    <>
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
      <div>
        <Modal
          modalIsOpen={modalIsOpen}
          toggleModal={toggleModal}
          modalContent={
            modalContent === "TICKETS" ? (
              <div
                id="scrollContainer"
                className="flex-no-wrap  mb-8 flex items-start  overflow-x-auto md:w-[600px] lg:w-[950px]">
                {modalPurchase.tickets.map((ticket, i) => (
                  <>
                    <div
                      className="m-2 flex-none rounded-lg border duration-300 ease-in-out hover:scale-[1.01] hover:cursor-pointer  xxs:mr-12 xxs:ml-12 sm:mr-12 sm:ml-12 md:pb-1"
                      onClick={() => {
                        setModalTicket(ticket);
                        getTokenUri(ticket.hash)
                        console.log('AA', ticket);
                        generateQRCode(modalPurchase, ticket, i);
                        setModalContent("TICKET");
                      }}>
                      <img
                        id="nftImage"
                        className="w-148 h-60 rounded-t-lg bg-cover bg-center"
                        src={constants.SERVER_URL + "/" + ticket.ticketNFT}
                        alt="NFT"
                      />

                      <div className="p-5">
                        <h5 className="mt-3 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                          {ticket.sectionName}
                        </h5>

                        <h6 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                          {ticket.rowName !== null && ticket.seat !== null
                            ? "Row: " + ticket.rowName + " Seat: " + ticket.seat
                            : "Seated section"}
                        </h6>

                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-sm tracking-tight text-gray-900 dark:text-white">
                            {ticket.door}
                          </p>
                        </div>

                        <div className="flex items-center">
                          <svg
                            width="22px"
                            height="22px"
                            viewBox="0 0 32 32"
                            xmlns="http://www.w3.org/2000/svg">
                            <g fill="none">
                              <circle fill="#6F41D8" cx="16" cy="16" r="16" />
                              <path
                                d="M21.092 12.693c-.369-.215-.848-.215-1.254 0l-2.879 1.654-1.955 1.078-2.879 1.653c-.369.216-.848.216-1.254 0l-2.288-1.294c-.369-.215-.627-.61-.627-1.042V12.19c0-.431.221-.826.627-1.042l2.25-1.258c.37-.216.85-.216 1.256 0l2.25 1.258c.37.216.628.611.628 1.042v1.654l1.955-1.115v-1.653a1.16 1.16 0 00-.627-1.042l-4.17-2.372c-.369-.216-.848-.216-1.254 0l-4.244 2.372A1.16 1.16 0 006 11.076v4.78c0 .432.221.827.627 1.043l4.244 2.372c.369.215.849.215 1.254 0l2.879-1.618 1.955-1.114 2.879-1.617c.369-.216.848-.216 1.254 0l2.251 1.258c.37.215.627.61.627 1.042v2.552c0 .431-.22.826-.627 1.042l-2.25 1.294c-.37.216-.85.216-1.255 0l-2.251-1.258c-.37-.216-.628-.611-.628-1.042v-1.654l-1.955 1.115v1.653c0 .431.221.827.627 1.042l4.244 2.372c.369.216.848.216 1.254 0l4.244-2.372c.369-.215.627-.61.627-1.042v-4.78a1.16 1.16 0 00-.627-1.042l-4.28-2.409z"
                                fill="#FFF"
                              />
                            </g>
                          </svg>
                          <label className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">
                            {" "}
                            {ticket.price}{" "}
                            <label className="text-xs">
                              {" "}
                              ({(ticket.price * maticPrice).toFixed(5)} €)
                            </label>
                          </label>
                        </div>
                        <div className="mt-3 flex items-center justify-center"></div>
                      </div>
                    </div>
                  </>
                ))}
              </div>
            ) : modalContent === "TICKET" ? (
              <div className="flex flex-col rounded-md bg-white p-1 sm:p-7">
                {uri && uri !== "" &&
                  <div className="w-full flex justify-center">
                    <button
                      type="button"
                      className="mr-2 mb-2 rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg shadow-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-300 hover:bg-gradient-to-br dark:shadow-lg dark:shadow-cyan-800/80 dark:focus:ring-cyan-800"
                      onClick={() => {
                        Toast("Copied", "Token URI copied!", ToastType.SUCCESS);
                        navigator.clipboard.writeText(uri);
                      }}
                    >
                      Copy token URI
                    </button>
                  </div>
                }
                <div className="flex w-full flex-col items-center justify-center p-0 sm:p-5 xl:flex-row">
                  <div
                    className="flex w-full flex-col justify-center rounded-lg border xxs:w-1/2 sm:w-1/3 md:w-1/2 lg:w-full lg:flex-row xl:mr-8 xl:w-1/3 xl:flex-col"
                    key={modalTicket.hash}>
                    <img
                      className="h-24 w-full rounded-t-lg object-cover sm:w-48 lg:h-48 lg:w-96"
                      src={
                        constants.SERVER_URL + "/" +
                        modalTicket.ticketNFT
                        //? modalSection.imageURL
                        //: data[0].imageurl
                      }
                      alt="NFT ticket"
                    />
                    <div className="p-2">
                      <h5 className="text-md font-semibold tracking-tight text-gray-900 sm:text-xl">
                        {modalTicket.sectionName}
                      </h5>
                      <h6 className="text-sm font-semibold tracking-tight text-gray-900">
                        {modalTicket.rowName !== null &&
                          modalTicket.seat !== null
                          ? "Row: " +
                          modalTicket.rowName +
                          " Seat: " +
                          modalTicket.seat
                          : "Seated section"}
                      </h6>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm tracking-tight text-gray-900">
                          Price
                        </p>
                      </div>

                      <div className="flex items-center">
                        <svg
                          width="22px"
                          height="22px"
                          viewBox="0 0 32 32"
                          xmlns="http://www.w3.org/2000/svg">
                          <g fill="none">
                            <circle fill="#6F41D8" cx="16" cy="16" r="16" />
                            <path
                              d="M21.092 12.693c-.369-.215-.848-.215-1.254 0l-2.879 1.654-1.955 1.078-2.879 1.653c-.369.216-.848.216-1.254 0l-2.288-1.294c-.369-.215-.627-.61-.627-1.042V12.19c0-.431.221-.826.627-1.042l2.25-1.258c.37-.216.85-.216 1.256 0l2.25 1.258c.37.216.628.611.628 1.042v1.654l1.955-1.115v-1.653a1.16 1.16 0 00-.627-1.042l-4.17-2.372c-.369-.216-.848-.216-1.254 0l-4.244 2.372A1.16 1.16 0 006 11.076v4.78c0 .432.221.827.627 1.043l4.244 2.372c.369.215.849.215 1.254 0l2.879-1.618 1.955-1.114 2.879-1.617c.369-.216.848-.216 1.254 0l2.251 1.258c.37.215.627.61.627 1.042v2.552c0 .431-.22.826-.627 1.042l-2.25 1.294c-.37.216-.85.216-1.255 0l-2.251-1.258c-.37-.216-.628-.611-.628-1.042v-1.654l-1.955 1.115v1.653c0 .431.221.827.627 1.042l4.244 2.372c.369.216.848.216 1.254 0l4.244-2.372c.369-.215.627-.61.627-1.042v-4.78a1.16 1.16 0 00-.627-1.042l-4.28-2.409z"
                              fill="#FFF"
                            />
                          </g>
                        </svg>
                        <label className="ml-2 text-2xl font-bold text-gray-900">
                          {" "}
                          {modalTicket.price}
                        </label>
                      </div>
                      <div className="flex items-center">
                        <span className="pl-1 text-sm font-bold text-gray-900">
                          {(modalTicket.price * maticPrice).toFixed(5)} €
                        </span>
                      </div>
                    </div>
                  </div>
                  {modalTicket.isActive
                    ?
                    <div className="mt-3 flex items-center justify-center">
                      <QRCode
                        value={qrCodeContent}
                        size={400}
                        logoImage={require("../../../assets/images/black-logo.png")}
                        logoWidth={50}
                        logoHeight={40}
                        logoOpacity={1}
                        removeQrCodeBehindLogo={true}
                      />
                    </div>
                    :
                    <p className="font-bold text-red-600 text-xl pt-8 ">Ticket used!</p>
                  }
                  <br />
                </div>
                <div className="flex w-full flex-col justify-center">
                  <div className="flex w-full justify-center">
                    <button
                      className="rounded-lg bg-red-600 py-1 px-4 font-bold text-white hover:bg-red-800 sm:py-2"
                      onClick={() => {
                        {
                          burnTicket(modalTicket)
                        }
                      }}>
                      Burn Ticket
                    </button>
                  </div>
                </div>
              </div>
            ) : modalContent === "REFUNDREQUEST" ? (
              <div className="flex flex-col">
                <p className="text-md text-center font-bold tracking-tight text-black dark:text-white xxs:text-lg">
                  Refund Request
                </p>
                <br />

                <input
                  type="text"
                  value={refundTitle}
                  onChange={handleRefundTitleChange}
                  id="message"
                  className="block resize-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 
                  focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 
                  dark:focus:ring-blue-500 md:w-[500px] lg:w-[600px]"
                  placeholder="Title"
                />

                <select
                  name="enum"
                  value={refundEnum}
                  onChange={handleRefundEnumChange}
                  className="mt-6 block resize-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 
                  focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 
                  dark:focus:ring-blue-500 md:w-[500px] lg:w-[600px]">
                  <option>-- Request motivation --</option>
                  <option>Personal reasons</option>
                  <option>Bad organization</option>
                  <option>Fraud</option>
                  <option>Other</option>
                </select>

                <textarea
                  value={refundDescription}
                  onChange={handleRefundDescriptionChange}
                  id="message"
                  rows="4"
                  className="mt-6 block resize-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 
                                focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 
                                dark:focus:ring-blue-500 md:w-[500px] lg:w-[600px]"
                  placeholder="Tell us what heppened..."
                />

                <br />
                <p className="text-center text-sm font-bold tracking-tight text-black dark:text-white xxs:text-left xxs:text-lg">
                  Files can help you prove your words
                </p>
                <br />
                {proofFiles == null ? (
                  <div className="flex w-full items-center justify-center">
                    <label
                      for="dropzone-file"
                      className="dark:hover:bg-bray-800 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          aria-hidden="true"
                          className="h-10 w-10 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <p className="mb-2 text-center text-sm text-gray-500 dark:text-gray-400">
                          <span className="text-center font-semibold">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                          PLEASE ZIP YOUR FILES, WE ONLY ACCEPT FILES WITH THE
                          EXTENSION .ZIP
                        </p>
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        accept=".zip"
                        className="hidden"
                        onChange={handleProofFilesChange}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex w-full items-center justify-center">
                    <div className="flex w-fit flex-row items-center justify-center space-x-1 rounded-3xl bg-gray-200 py-1 px-2 ">
                      <div className=" text-gray-700">{proofFiles.name}</div>
                      <button onClick={() => setProofFiles(null)}>
                        <XCircleIcon className="w-7" />
                      </button>
                    </div>
                  </div>
                )}

                <br />
                <button
                  className="rounded-lg bg-red-600 py-1 px-4 font-bold text-white hover:bg-red-800 sm:py-2"
                  onClick={() => {
                    sendRefundRequest();
                  }}>
                  Submit
                </button>
              </div>
            ) : null
          }
          icon={null}
        />

        {/* PAGE BACKGROUND MODAL */}

        <ModalBackground modalIsOpen={modalIsOpen} toggleModal={toggleModal} />
      </div>

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
        <div
          id="mainDiv"
          className="flex-col space-y-5 bg-gray-50 dark:bg-gray-900">
          <span className="mb-4 self-start font-extrabold tracking-tight dark:text-white xxs:text-lg lg:text-3xl xl:text-4xl">
            Check out your tickets
          </span>

          <div className="flex w-full animate-fade-in-down flex-col items-center space-y-3 md:flex-row md:justify-end md:space-y-0">
            <div className="flex flex-row space-x-2">
              <div className="flex items-center">
                <input
                  id="default-radio-1"
                  onChange={() => setRadiosState("all")}
                  type="radio"
                  value=""
                  name="default-radio"
                  className="h-4 w-4 border-gray-300 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                />
                <label
                  htmlFor="default-radio-1"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  All
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="default-radio-2"
                  onChange={() => setRadiosState("active")}
                  type="radio"
                  value=""
                  name="default-radio"
                  className="h-4 w-4 border-gray-300 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                />
                <label
                  htmlFor="default-radio-2"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Active
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="default-radio-3"
                  onChange={() => setRadiosState("used")}
                  type="radio"
                  value=""
                  name="default-radio"
                  className="h-4 w-4 border-gray-300 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                />
                <label
                  htmlFor="default-radio-3"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Used
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="default-radio-4"
                  onChange={() => setRadiosState("canceled")}
                  type="radio"
                  value=""
                  name="default-radio"
                  className="h-4 w-4 border-gray-300 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                />
                <label
                  htmlFor="default-radio-4"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Canceled
                </label>
              </div>
            </div>

            <div className="flex flex-row space-x-2">
              <label htmlFor="simple-search" className="sr-only">
                Search
              </label>
              <div className="w-45 relative">
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

              <Menu as="div" className="relative inline-block">
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
          </div>

          <div>
            <div className="space-y-10">
              {purchases.map((purchase) => (
                <>
                  {(purchase.category === menu || menu === "All") &&
                    (purchase.eventName
                      .toLowerCase()
                      .includes(searchInput.toLocaleLowerCase()) ||
                      searchInput === "") &&
                    (purchase.state === radiosState ||
                      radiosState === "all") && (purchase.tickets.length > 0) && (
                      <>
                        <div
                          key={"div" + purchase.id}
                          id="ticketBanner"
                          className={`flex min-h-fit w-full animate-fade-in-down flex-col 
                                rounded-md bg-cover bg-center p-0 text-left text-white duration-300 ease-in-out hover:scale-[1.01] hover:cursor-pointer sm:p-2 lg:flex-row lg:p-5`}
                          style={{
                            backgroundImage: `url(${constants.SERVER_URL +
                              "/" +
                              purchase.banner.replace(/\\/g, "/")
                              })`,
                          }}
                          onClick={() => {
                            setModalContent("TICKETS");
                            getTokenUri(purchase.id)
                            setModalPurchase(purchase);
                            toggleModal();
                          }}>
                          <div className="m-0 flex h-full flex-row space-x-10 rounded-md bg-black bg-opacity-70 p-5 align-middle sm:m-1 sm:w-1/2 md:w-full">
                            <div className="b-0 grid min-h-fit w-1/5 content-center rounded-md bg-gray-500 bg-opacity-80 p-2 font-bold xl:text-center">
                              <p className="text-xl text-black sm:text-2xl">
                                {toMonthName(
                                  purchase.datesInfo.startDate.dayMonthYear.split(
                                    "-"
                                  )[1]
                                )}
                              </p>
                              <p className="text-xl text-black sm:text-xl lg:text-4xl">
                                {
                                  purchase.datesInfo.startDate.dayMonthYear.split(
                                    "-"
                                  )[0]
                                }
                              </p>
                            </div>

                            <div className="h-full w-4/5 space-y-1 p-1 font-bold sm:p-5">
                              <p className="text-center text-xl text-white sm:text-left sm:text-4xl">
                                {purchase.eventName}
                              </p>
                              <p className="text-center text-lg text-gray-400 sm:text-left">
                                Location
                              </p>
                              <p className="text-center text-lg text-white sm:text-left">
                                {purchase.location}
                              </p>
                              <p className="text-center text-lg text-white sm:text-left">
                                {purchase.tickets.length} tickets
                              </p>
                            </div>
                          </div>
                          <div className="b-0 m-1 flex w-full items-center justify-center p-5 lg:justify-end xl:w-1/2">
                            <div className="flex flex-col space-y-2">
                              <p className="rounded-md bg-gray-600 p-2 text-center text-lg font-bold tracking-tight text-white sm:text-2xl">
                                See your tickets
                              </p>
                              <button
                                className="rounded-lg bg-red-600 py-1 px-4 font-bold text-white hover:bg-red-800 sm:py-2"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setModalContent("REFUNDREQUEST");
                                  toggleModal();
                                  setModalPurchase(purchase)
                                }}>
                                Ask for a refund
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                </>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketsPurchasedByClient;
