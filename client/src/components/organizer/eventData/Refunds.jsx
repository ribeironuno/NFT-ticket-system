import { FaCloudDownloadAlt, FaSearch, FaCheck } from "react-icons/fa";
import { useState, Fragment, useEffect } from "react";
import GenericButton from "../../generic/GenericButton";
import ReactLoading from "react-loading";
import { ethers } from "ethers";
import constants from "../../../configs/constants";
import storageABI from "../../../configs/abi.json";
import Toast, { ToastType } from "../../generic/Toast";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { PencilAltIcon, XIcon } from "@heroicons/react/solid";

const Checkbox = ({ id, type, name, handleClick, isChecked }) => {
  return <input id={id} name={name} type={type} onChange={handleClick} checked={isChecked} />;
};


const Refunds = ({ id }) => {
  const [refunds, setRequests] = useState([]);
  const [refundToDetail, setRefundToDetail] = useState({});
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  const urlRefunds = constants.URL_REFUNDS;

  function maticToWei(value) {
    return value * 1000000000000000000;
  }

  //smart contract area
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const [isLoadingMinting, setIsLoadingMinting] = useState(false);
  const [isLoadingPinning, setIsLoadingPinning] = useState(false);
  const [afterMintedSuccess, setAfterMintedSuccess] = useState(false);

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

    let tempContract = new ethers.Contract(
      constants.CONTRACT_ADDRESS,
      storageABI,
      tempSigner
    );
    setContract(tempContract);
  };

  function getRefunds() {
    setIsLoadingRequests(true)
    fetch(urlRefunds + `getEventRefunds?eventId=${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      method: "GET",
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.json());
        else return res.json();
      })
      .then((data) => {
        data.forEach(info => {
          info.checked = false;
        })
        console.log(data);
        setIsLoadingRequests(false)
        setRequests(data)
      })
      .catch((err) => {
        setIsLoadingRequests(false)
        Toast(
          "Error",
          "Error getting the requests from the server",
          ToastType.DANGER
        );
      });
  }

  //check box off all items
  const [isCheckAll, setIsCheckAll] = useState(false);
  //list of refunds checked
  const [isToShowResolved, setIsToShowResolved] = useState(true);
  //list of refunds

  useEffect(() => {
    setLoading(false);
    updateEthers();
    getRefunds()
  }, []);


  function toggleDetailModal() {
    setIsDetailOpen(!isDetailOpen)
  }

  function handleClick(id) {
    console.log(id);
    let tmp = []
    refunds.forEach(refund => {
      if (refund.refundId === id) {
        if (!refund.isRefunded) {
          refund.checked = !refund.checked
        }
      }
      tmp.push(refund)
    })
    setRequests(tmp)
  };

  const truncateFromMiddle = (fullStr = "", strLen, middleStr = "...") => {
    if (fullStr.length <= strLen) return fullStr;
    const midLen = middleStr.length;
    const charsToShow = strLen - midLen;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    return (
      fullStr.substr(0, frontChars) +
      middleStr +
      fullStr.substr(fullStr.length - backChars)
    );
  };

  function handleClickAll() {
    console.log(id);
    let tmp = []
    refunds.forEach(refund => {
      if (!refund.isRefunded) {
        refund.checked = !isCheckAll
      }
      tmp.push(refund)
    })
    setIsCheckAll(!isCheckAll);
    setRequests(tmp)
  };

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = data.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(data.length / recordsPerPage);

  const pageNumbers = [...Array(nPages + 1).keys()].slice(1);

  const nextPage = () => {
    if (currentPage !== nPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage !== 1) setCurrentPage(currentPage - 1);
  };


  function executeRefund() {
    let activeRefunds = []
    refunds.forEach(refund => {
      if (!refund.isRefunded && refund.checked) {
        activeRefunds.push(refund)
      }
    })

    if (activeRefunds.length < 1) {
      Toast("Error!", "There is no refunds to be executed", ToastType.DANGER);
      return;
    }

    //get tickets 
    let formData = new FormData();
    formData.append("eventId", id);
    let wallets = []

    //gets the wallets to refund 
    activeRefunds.forEach(refund => {
      wallets.push(refund.walletAddress)
      formData.append("wallet", refund.walletAddress);
    })

    //gets the tickets of each wallet
    fetch(constants.URL_PURCHASES + `getAllCombining`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.json());
        else return res.json();
      })
      .then((data) => {
        let ticketsHash = []
        let totalToPay = 0

        data.forEach(purchase => {
          purchase.tickets.forEach(ticket => {
            ticketsHash.push(ticket.hash)
            totalToPay += ticket.price
          })
        })

        console.log('hahs', ticketsHash);
        console.log('total', totalToPay);
        //now call smart contract
        executeSmartContract(ticketsHash, totalToPay, activeRefunds)
      })
      .catch((err) => {
        console.log(err);
        Toast(
          "Error",
          "Error getting the requests from the server",
          ToastType.DANGER
        );
      });
  }

  function executeSmartContract(ticketsHash, totalToPay, activeRefunds) {
    contract.refundByTicket(id, ticketsHash, {
      value: maticToWei(totalToPay).toString().replace("\.", "")
    })
      .then(async (result) => {
        //if transaction returns a hash
        if (result.hash) {
          //after validation the transaction is saved in the off-chain
          setTimeout(function () {
            let urlScan =
              "https://mumbai.polygonscan.com/tx/" + result.hash;
            window.open(urlScan, "_blank");
          }, 3000);

          updateDb(activeRefunds, result.hash);
        }
      })
      .catch((error) => {
        setIsLoadingMinting(false);
        console.error("error", error);
        Toast(
          "Error",
          "Something happened! We could not refund the client on-chain",
          ToastType.DANGER
        );
      });
  }

  function getEnumString(stringEnum) {
    if (stringEnum === "Bad_organization") {
      return "Bad organization"
    }
    return stringEnum;
  }

  function updateDb(activeRefunds, txHash) {
    let formData = new FormData();
    formData.append("txHash", txHash)
    activeRefunds.forEach(refund => {
      formData.append("refundIds", refund.refundId)
    })
    //updates off-chain information
    fetch(constants.URL_REFUNDS + `closeRefunds`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.json());
        else return res.json();
      })
      .then((data) => {
        Toast(
          "Success",
          "Refunds closed!",
          ToastType.SUCCESS
        );
        getRefunds();
      })
      .catch((err) => {
        Toast(
          "Error",
          "Error closing the refunds",
          ToastType.DANGER
        );
      });
  }


  return (
    <>
      <div className="grid overflow-auto lg:col-span-3 lg:row-span-2 lg:mt-8">
        <div className="mt-2 flex flex-col ">
          <div className="overflow-x-auto">
            <div className="inline-block w-full p-1.5 align-middle">

              {isLoadingRequests &&
                <div>
                  <div className="flex flex-wrap items-center justify-center">
                    <ReactLoading
                      type={"bubbles"}
                      height={100}
                      width={120}
                      color={"#5b2bab"}
                    />
                    <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">
                      Loading
                    </span>
                  </div>
                </div>
              }

              {!isLoadingRequests &&
                <>
                  {refunds && refunds.length === 0 &&
                    <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight text-gray-900 dark:text-white xl:text-2xl">
                      There is no refunds.
                    </span>
                  }

                  {refunds && refunds.length !== 0 &&
                    <>
                      <div className="w-full flex justify-end mb-4">
                        <div>
                          <button onClick={() => { setIsToShowResolved(!isToShowResolved) }}>
                            <Checkbox type="checkbox" name="selectAll" id="selectAll" isChecked={isToShowResolved} />
                          </button>
                          <label className="ml-2 text-gray-500 dark:text-white">Show resolved refunds</label>
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-lg border">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                                <Checkbox type="checkbox" name="selectAll" id="selectAll" handleClick={handleClickAll} isChecked={isCheckAll} />
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                                Title
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                                Reason
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                                File proof
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {refunds.map((refundRequest, key) => (
                              <>
                                {(!refundRequest.isRefunded || isToShowResolved) &&
                                  <tr className="dark:bg-gray-800" key={key}>
                                    <td className="w-4 p-4">
                                      {refundRequest.isRefunded
                                        ?
                                        <FaCheck className="text-green-300" size={20} />
                                        :
                                        <button onClick={() => handleClick(refundRequest.refundId)}>
                                          <Checkbox key={key} id={refundRequest.id} type="checkbox" isChecked={refundRequest.checked} />
                                        </button>
                                      }
                                    </td>
                                    <td className="px-6 py-4 text-sm text-black dark:text-white ">{refundRequest.title}</td>
                                    <td className="px-6 py-4 text-sm text-black dark:text-white ">{getEnumString(refundRequest.type)}</td>
                                    <td className="px-6 py-4 text-sm text-black dark:text-white ">{refundRequest.dateOfRegistration}</td>
                                    {!refundRequest.txHash &&
                                      <>
                                        <td className="px-6 py-4 text-sm text-black dark:text-white">
                                          <a href={constants.SERVER_URL + "/" + refundRequest.proofFiles} download>
                                            <FaCloudDownloadAlt size={25} />
                                          </a>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-black dark:text-white ">
                                          <button
                                            onClick={() => {
                                              setRefundToDetail(refundRequest);
                                              toggleDetailModal();
                                            }}
                                          >
                                            <FaSearch size={20} />
                                          </button>
                                        </td>
                                      </>
                                    }
                                    {refundRequest.txHash &&
                                      <>
                                        <td className="px-6 py-4 text-sm text-black dark:text-white">
                                          <a href={constants.SERVER_URL + "/" + refundRequest.proofFiles} download>
                                            <FaCloudDownloadAlt size={25} />
                                          </a>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-black dark:text-white ">
                                          <button onClick={() => {
                                            window.open("https://mumbai.polygonscan.com/tx/" + refundRequest.txHash, "_blank");
                                          }}>
                                            {truncateFromMiddle(
                                              refundRequest.txHash,
                                              refundRequest.txHash.length / 5,
                                              "..."
                                            )}
                                          </button>
                                        </td>
                                      </>
                                    }
                                  </tr>
                                }
                              </>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  }
                </>
              }
            </div>
          </div>

          {/* Pagination */}
          {refunds && refunds.length !== 0 &&
            <div className="p-4">
              <nav className="grid grid-cols-3 content-start gap-4">
                <ul className="mt-4 inline-flex -space-x-px">
                  <li>
                    <a
                      onClick={prevPage}
                      href="#/"
                      className="ml-0 rounded-l-lg border border-gray-300 bg-white px-3 py-2  leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      Previous
                    </a>
                  </li>
                  {pageNumbers.map((pgNumber) => (
                    <li key={pgNumber}>
                      <a
                        onClick={() => setCurrentPage(pgNumber)}
                        href="#/"
                        className={`border border-gray-300 bg-blue-50 px-3 py-2 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white`}
                      >
                        {pgNumber}
                      </a>
                    </li>
                  ))}
                  <li className="page-item">
                    <a
                      onClick={nextPage}
                      href="#/"
                      className="rounded-r-lg border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      Next
                    </a>
                  </li>
                </ul>
                <GenericButton
                  name={"Refund"}
                  onClick={() => {
                    executeRefund();
                  }}
                  color={"green"}
                  className={"mt-2 mb-2"}
                />
              </nav>
            </div>
          }
        </div>
      </div>

      {isDetailOpen && (
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
                        Id: {refundToDetail.refundId}
                      </Dialog.Title>
                      <div className="mt-2">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          <div className="col-span-4 md:col-span-3">
                            <p className="text-md leading-6 text-gray-900 dark:text-gray-200">
                              {refundToDetail.walletAddress}
                            </p>
                            <p className="text-md mt-2 font-medium leading-6 text-gray-900 dark:text-gray-200">
                              Date: {refundToDetail.dateOfRegistration}
                            </p>
                            <p className="text-md mt-2  font-medium leading-6 text-gray-900 dark:text-gray-200">
                              Type: {getEnumString(refundToDetail.type)}
                            </p>
                            <p className="text-md mt-8 font-medium leading-6 text-gray-900 dark:text-gray-200">
                              {refundToDetail.title}
                            </p>

                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                              {refundToDetail.description}
                            </p>

                            <p className="mt-1 mt-8 text-sm text-gray-500 dark:text-gray-300">
                              <a href={constants.SERVER_URL + "/" + refundToDetail.proofFiles} download>
                                <div className="flex">
                                  <label className="mr-6"> Download files</label>
                                  <FaCloudDownloadAlt size={25} />
                                </div>
                              </a>
                            </p>
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
    </>
  );
};

export default Refunds;
