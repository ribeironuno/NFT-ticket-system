import { FaCloudDownloadAlt, FaEye } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import GenericButton from "../../../components/generic/GenericButton";
import constants from "../../../configs/constants";
import { Toaster, toast, ToastBar } from "react-hot-toast";
import { HiX } from "react-icons/hi";
import Toast, { ToastType } from "../../../components/generic/Toast";
import ReactLoading from "react-loading";
import { Modal, ModalBackground } from "../../../components";
import { ConnectWalletButton } from "../../../components";
import ErrorModel from "../../../components/generic/ErrorModal";
import SucessModel from "../../../components/generic/SucessModal";

const ValidateOrganizers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  const [organizers, setOrganizers] = useState();

  const [organizer, setOrganizer] = useState();
  const dataFetchedRef = useRef(false);
  let nPages = 1;

  // ################################### HTTP REQUESTS ################################

  //GET organizers waiting for validation
  const fetchData = () => {
    fetch(constants.URL_ORGANIZERS + "organizers-waiting-validation", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        console.log(data);
        setOrganizers(data);
        nPages = Math.ceil(data.length / recordsPerPage);
      })
      .catch((error) => {
        Toast("Error getting your data", "Try again later", ToastType.DANGER);
        console.log(error);
      });
  };

  //PUT update status account of organizer
  const updateStatus = (status) => {
    console.log(status);
    fetch(constants.URL_ORGANIZERS + "change-status-account", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: organizer.organizerId, status: status }),
    })
      .then((res) => {
        if (res.ok) {
          Toast("Data updated", " ", ToastType.SUCCESS);
          setTimeout(() => {
            window.location.reload(false);
          }, 3000);
        } else {
          Toast("Error trying to update data", "Try again later", ToastType.DANGER);
        }
      })
      .catch((err) => {
        Toast("Error trying to update data", "Try again later", ToastType.DANGER);
      });
  };

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetchData();
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
          }}
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <>
                  {icon}
                  {message}
                  {t.type !== "loading" && (
                    <button className="ring-primary-400 rounded-full p-1 transition focus:outline-none focus-visible:ring hover:bg-[#444]" onClick={() => toast.dismiss(t.id)}>
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
      <div>
        <Modal
          modalIsOpen={modalIsOpen}
          toggleModal={toggleModal}
          modalContent={
            modalContent === "DETAILS" ? (
              <>
                {/* WALLET INFORMATION */}
                <div className="flex sm:mb-8 md:w-[600px] lg:w-[950px]">
                  <div className="mt-5 md:mt-0">
                    <h3 className="mb-3 text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">Web3 Information</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="xxxs:col-span-3 sm:col-span-2">
                        <label className="text-md mb-2 mr-3 block font-medium text-gray-700 dark:text-gray-200">Wallet Address</label>
                        {organizer.walletAddress.map((walletAddress, key) => (
                          <div key={key}>
                            <ConnectWalletButton walletAddress={walletAddress} />
                          </div>
                        ))}
                        {organizer.walletAddress.length === 0 && <ConnectWalletButton walletAddress="" />}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <h3 className="mb-3 text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">Personal information</h3>
                </div>
                {/* PERSONAL INFORMATION */}
                <div className="grid xxxs:gap-1 xxs:gap-3 sm:grid-cols-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{organizer.type === "Company" ? "Company name" : "Full name"}</label>
                    <input
                      disabled
                      type="text"
                      name="name"
                      value={organizer.name}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">NIF</label>
                    <input
                      disabled
                      type="text"
                      name="nif"
                      value={organizer.nif}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Cell phone number</label>
                    <input
                      disabled
                      type="tel"
                      name="phoneNumber"
                      value={organizer.phoneNumber}
                      autoComplete="family-name"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                    />
                  </div>
                  {organizer.type === "Personal" && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Date of birth</label>
                      <input
                        disabled
                        type="text"
                        name="dob"
                        value={organizer.dob}
                        autoComplete="family-name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                  )}
                  {organizer.type === "Personal" && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Gender</label>
                      <input
                        disabled
                        type="text"
                        name="address"
                        value={organizer.gender}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                  )}
                  <div className="sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Full address</label>
                    <input
                      disabled
                      type="text"
                      name="address"
                      value={organizer.address}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Country</label>
                    <input
                      disabled
                      type="text"
                      name="address"
                      value={organizer.country}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>
              </>
            ) : null
          }
          icon={null}
        />
        {isRefuseModalOpen && (
          <ErrorModel
            tittle={"Invalidate account"}
            message={"Do you want to invalidate this account? \n This action is irreversible"}
            onClick={() => {
              updateStatus("NotValid");
            }}
            cancelBtnName={"Cancel"}
            submitBtnName={"Invalidate"}
            toggleModal={toggleRefuseModal}
          />
        )}

        {isAcceptModalOpen && (
          <SucessModel
            tittle={"Activate account"}
            message={"Do you want to activate account this account? \n This action is irreversible "}
            onClick={() => {
              updateStatus("Active");
            }}
            cancelBtnName={"Cancel"}
            submitBtnName={"Activate"}
            toggleModal={toggleAcceptModal}
          />
        )}

        {/* PAGE BACKGROUND MODAL */}

        <ModalBackground modalIsOpen={modalIsOpen} toggleModal={toggleModal} />
      </div>
      <div className="flex min-h-[calc(100vh-425px)] flex-col space-y-7  sm:min-h-[calc(100vh-377px)] md:min-h-[calc(100vh-286px)]">
        <TailwindToaster />
        <span className="font-extrabold tracking-tight dark:text-white xxs:text-lg lg:text-3xl xl:text-4xl">Validate organizers</span>
        <div className="grid overflow-auto lg:col-span-3 lg:row-span-2 lg:mt-8">
          {!organizers && (
            <div className="flex flex-wrap items-center justify-center pt-24 ">
              <ReactLoading type={"bubbles"} height={100} width={120} color={"#5b2bab"} />
              <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">Loading</span>
            </div>
          )}

          {organizers && organizers.length > 0 && (
            <div className="mt-2 flex flex-col">
              <div className="overflow-x-auto">
                <div className="inline-block w-full p-1.5 align-middle">
                  <div className="overflow-hidden rounded-lg border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                            NIF
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                            Address Proof
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                            NIF Proof
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                            See details
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 "></th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 "></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {organizers.map((organizer, key) => (
                          <tr className="dark:bg-gray-800" key={key}>
                            <td className="px-6 py-4 text-sm font-medium text-black dark:text-white ">{organizer.nif}</td>
                            <td className="px-6 py-4 text-sm text-black dark:text-white truncate">{organizer.email}</td>
                            <td className="px-6 py-4 text-sm text-black dark:text-white ">
                              <a href={constants.URL_ROOT_API + organizer.addressProofUrl} target="_blank" rel="noreferrer">
                                <FaCloudDownloadAlt size={25} />
                              </a>
                            </td>
                            <td className="px-6 py-4 text-sm text-black dark:text-white ">
                              <a href={constants.URL_ROOT_API + organizer.nifProofUrl} target="_blank" rel="noreferrer">
                                <FaCloudDownloadAlt size={25} />
                              </a>
                            </td>
                            <td className="px-6 py-4 text-sm text-black dark:text-white ">
                              <FaEye
                                size={25}
                                onClick={() => {
                                  setModalContent("DETAILS");
                                  setOrganizer(organizer);
                                  toggleModal();
                                }}
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-black dark:text-white ">
                              <GenericButton
                                name={"Activate"}
                                onClick={() => {
                                  setOrganizer(organizer);
                                  toggleAcceptModal();
                                }}
                                color={"green"}
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-black dark:text-white ">
                              <GenericButton
                                name={"Invalidate"}
                                onClick={() => {
                                  setOrganizer(organizer);
                                  toggleRefuseModal();
                                }}
                                color={"red"}
                              />
                            </td>
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
          {organizers && organizers.length === 0 && (
            <div className="m-5 flex items-center justify-center">
              <span className="tracking-tight dark:text-white xxs:text-lg lg:text-xl xl:text-2xl">No organizers left to validate</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ValidateOrganizers;
