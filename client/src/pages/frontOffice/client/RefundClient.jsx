import { FaCloudDownloadAlt, FaEye } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import GenericButton from "../../../components/generic/GenericButton";
import constants from "../../../configs/constants";
import { Toaster, toast, ToastBar } from "react-hot-toast";
import { HiX } from "react-icons/hi";
import Toast, { ToastType } from "../../../components/generic/Toast";
import ReactLoading from "react-loading";
import { Modal, ModalBackground } from "../../../components";
import { ethers } from "ethers";
import { ConnectWalletButton } from "../../../components";
import ErrorModel from "../../../components/generic/ErrorModal";
import SucessModel from "../../../components/generic/SucessModal";

const RefundClient = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  const [organizers, setOrganizers] = useState();
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const [organizer, setOrganizer] = useState();
  const dataFetchedRef = useRef(false);
  let nPages = 1;

  // ################################### HTTP REQUESTS ################################

  const [refunds, setRefunds] = useState([]);


  useEffect(() => {
    provider
      .send("eth_requestAccounts", [])
      .then((result) => {
        fetch(constants.URL_REFUNDS + `getRefundByWallet?wallet=${result[0]}`)
          .then((res) => {
            if (!res.ok) throw new Error(res.status);
            else return res.json();
          })
          .then((data) => {
            console.log(data);
            setRefunds(data);
          })
          .catch((err) => {
            console.log(err.message);
          });
      })
      .catch((err) => {
        Toast("Error getting your data", "Try again later", ToastType.DANGER);
        console.log(err);
      });
  }, []);


  // ###########################################################################################

  const pageNumbers = [...Array(nPages + 1).keys()].slice(1);

  const nextPage = () => {
    if (currentPage !== nPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage !== 1) setCurrentPage(currentPage - 1);
  };

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");

  const [isRefuseModalOpen, setIsRefuseModalOpen] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);

  function toggleRefuseModal() {
    setIsRefuseModalOpen(!isRefuseModalOpen);
  }

  function toggleAcceptModal() {
    setIsAcceptModalOpen(!isAcceptModalOpen);
  }

  const toggleModal = () => {
    setModalIsOpen(!modalIsOpen);
  };

  return (
    <div>
      {refunds && refunds.length > 0 && (
        <div className="mt-2 flex flex-col">
          <div className="overflow-x-auto">
            <div className="inline-block w-full p-1.5 align-middle">
              <div className="overflow-hidden rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                        Request ID
                      </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                        Event name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {refunds.map((refund, key) => (
                      <tr className="dark:bg-gray-800" key={key}>
                        <td className="px-6 py-4 text-sm font-medium text-black dark:text-white ">{refund.refundId}</td>
                        <td className="px-6 py-4 text-sm font-medium text-black dark:text-white ">{refund.eventName}</td>
                        <td className="px-6 py-4 text-sm text-black dark:text-white truncate">{refund.dateOfRegistration}</td>
                        <td className="px-6 py-4 text-sm text-black dark:text-white truncate">{refund.title}</td>
                        <td className="px-6 py-4 text-sm text-black dark:text-white truncate">
                          {refund.isRefunded
                            ?
                            <label className="font-medium text-green-600" >Refunded</label>
                            :
                            <label className="font-medium text-yellow-600" >Pending</label>
                          }</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* PAGINATION */}
          <div className="p-4 ">
            <nav className="grid grid-cols-3 content-center gap-4">
              <ul className="col-start-2 mt-4 inline-flex justify-center">
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
            </nav>
          </div>
        </div>
      )}
      {refunds && refunds.length === 0 && (
        <div className="m-5 flex items-center justify-center">
          <span className="tracking-tight dark:text-white xxs:text-lg lg:text-xl xl:text-2xl">No refunds registered</span>
        </div>
      )}
    </div>
  );
};

export default RefundClient;