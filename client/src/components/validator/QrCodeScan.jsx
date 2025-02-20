import React, { useState, useEffect } from "react";
import QrReader from "react-qr-scanner";
import { FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa";
import CryptoJS from "crypto-js";
import constants from "../../configs/constants";
import moment from "moment";
import { ethers } from "ethers";
import storageABI from "../../../src/configs/abi.json";
import GenericButton from "../generic/GenericButton";

export const InfoToDisplay = {
  WAITING: 1,
  CORRECT: 2,
  ERROR: 3,
};

const QrCodeScan = ({ validationStructure, refreshRate, constraints }) => {
  //smart contract area
  const contractAddress = constants.CONTRACT_ADDRESS;
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const [lastJSON, setLastJSON] = useState({});
  const [infoToDisplay, setInfoToDisplay] = useState(InfoToDisplay.WAITING);
  const [errorMsg, setErrorMsg] = useState("");

  const updateEthers = async () => {
    let tempProvider = new ethers.providers.Web3Provider(window.ethereum);

    setProvider(tempProvider);

    let tempSigner = tempProvider.getSigner();
    setSigner(tempSigner);

    let tempContract = new ethers.Contract(contractAddress, storageABI, tempSigner);
    setContract(tempContract);
  };

  const isQRValid = (readJSON, callback) => {
    //check all parameters
    if (!readJSON.wallet || !readJSON.idEvent || !readJSON.idTicket || !readJSON.door || !readJSON.dateGenerated || readJSON.index < 0) {
      console.log("Wrong QR Code");
      setErrorMsg("Wrong QR Code");
      callback(false);
    }

    //check event id
    if (readJSON.idEvent !== validationStructure.event.eventId) {
      console.log("Event doesn't match");
      setErrorMsg("Event doesn't match");
      callback(false);
    }

    //check door
    if (readJSON.door !== validationStructure.door) {
      console.log("Door doesn't match");
      setErrorMsg("Door doesn't match");
      callback(false);
    }

    const currentDate = moment();
    const formattedDate = currentDate.format("DD-MM-YYYY HH:mm:ss");
    var current = moment(formattedDate, "DD-MM-YYYY HH:mm:ss");
    let generatedDate = moment(readJSON.dateGenerated, "DD-MM-YYYY HH:mm:ss");

    var duration = moment.duration(current.diff(generatedDate));
    console.log(Number(duration.asMinutes()));

    if (Number(duration.asMinutes()) > 5) {
      console.log("Time passed");
      setErrorMsg("Time passed");
      callback(false);
    }

    //REPLACE constants.CONTRACT_ADDRESS WITH readJSON.wallet
    if (readJSON.idEvent === validationStructure.event.eventId && readJSON.door === validationStructure.door && Number(duration.asMinutes()) < 5 && readJSON.index >= 0) {
      fetch(constants.URL_PURCHASES + `check-status-ticket?EventId=${readJSON.idEvent}&Wallet=${readJSON.wallet}&TicketId=${readJSON.idTicket}&IndexTicket=${readJSON.index}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json;charset=UTF-8",
        },
      })
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          else return response.json();
        })
        .then((data) => {
          if (data.message === "Used") {
            setErrorMsg("Ticket already used!");
            callback(false);
          } else {
            let ticketInformation = {
              eventId: readJSON.idEvent,
              wallet: readJSON.wallet,
              ticketId: readJSON.idTicket,
              indexTicket: readJSON.index,
            };
            fetch(constants.URL_PURCHASES + "use-ticket", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json;charset=UTF-8",
              },
              body: JSON.stringify(ticketInformation),
            })
              .then((response) => {
                console.log(ticketInformation);
                if (response.ok) {
                  callback(true);
                } else {
                  setErrorMsg("Error trying update data. Validate again!");
                  callback(false);
                }
              })
              .catch((err) => {
                setErrorMsg("Error trying update data. Validate again!");
                callback(false);
              });
          }
        })
        .catch((err) => {
          setErrorMsg("Error get ticket data. Validate again!");
          callback(false);
        });
    } else {
      callback(false);
    }
  };

  useEffect(() => {
    updateEthers();
  }, []);

  const handleScan = (scan) => {
    setTimeout(function () {
      //console.log(scan);
      //logic
    }, 10000);
    if (scan !== null) {
      try {
        const bytes = CryptoJS.AES.decrypt(scan.text, constants.KEY_ENCRYPT_QR_CODE);
        const originalMessage = bytes.toString(CryptoJS.enc.Utf8);
        var readJSON = JSON.parse(originalMessage);

        setLastJSON(readJSON);

        isQRValid(readJSON, (result) => {
          if (result === false) {
            setInfoToDisplay(InfoToDisplay.ERROR);
            setTimeout(function () {
              setInfoToDisplay(InfoToDisplay.WAITING);
            }, refreshRate * 1000);
          } else {
            setInfoToDisplay(InfoToDisplay.CORRECT);
            setTimeout(function () {
              setInfoToDisplay(InfoToDisplay.WAITING);
            }, refreshRate * 1000);
          }
        });
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleError = (e) => {
    console.log("error_qr_code", e);
  };

  return (
    <div className="flex justify-center">
      <div className="flex w-full flex-wrap justify-center py-6 xl:w-5/12">
        {infoToDisplay === InfoToDisplay.WAITING && (
          <div className="w-full">
            <div className="flex w-full justify-center ">
              <QrReader delay={500} onError={handleError} onScan={handleScan} constraints={constraints} className={"w-full, rounded-[20px]"} />
            </div>
          </div>
        )}

        <div className="flex w-full justify-center">
          {/* CORRECT STATUS */}
          {infoToDisplay === InfoToDisplay.CORRECT && (
            <div className="flex w-fit flex-wrap justify-center rounded-lg bg-green-500 p-10 dark:bg-green-800">
              <FaRegCheckCircle size={100} className="w-full" />
              <span
                className="mb-4 mb-8 w-full text-center text-2xl font-extrabold
             tracking-tight text-black lg:text-3xl xl:text-4xl"
              >
                Success
              </span>
              <div className="flex flex-wrap justify-center">
                <span
                  className="w-full text-center text-2xl font-extrabold tracking-tight
            dark:text-white lg:text-2xl"
                >
                  Section: {lastJSON.sectionName}
                </span>
                <span
                  className="w-full text-center text-2xl font-extrabold tracking-tight
            dark:text-white lg:text-2xl"
                >
                  Section: {lastJSON.door}
                </span>
              </div>
            </div>
          )}

          {/* ERROR STATUS */}
          {infoToDisplay === InfoToDisplay.ERROR && (
            <div className="dark:red-800 flex w-fit flex-wrap justify-center rounded-lg bg-red-500 p-10">
              <FaRegTimesCircle size={100} className="w-full" />
              <span
                className="mb-4 mb-8 w-full text-center text-2xl font-extrabold
             tracking-tight text-black lg:text-3xl xl:text-4xl"
              >
                Failed
              </span>
              <div className="flex flex-wrap justify-center">
                <span
                  className="w-full text-center text-2xl font-extrabold tracking-tight
            dark:text-white lg:text-2xl"
                >
                  {errorMsg}
                </span>
                <span
                  className="w-full text-center text-2xl font-extrabold tracking-tight
            dark:text-white lg:text-2xl"
                ></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrCodeScan;
