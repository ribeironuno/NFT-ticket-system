import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ReactLoading from "react-loading";
import jwt_decode from "jwt-decode";
import DividerLine from "../../../components/generic/DividerLine";
import { HiX } from "react-icons/hi";
import { Toaster, toast, ToastBar } from "react-hot-toast";
import { StructureListing, StructureDetails, CreateStructureModal } from "../../../components/organizer/structure/index";
import { getActualDate_DayMonthYear } from "../../../helper/functionsGeneral";
import constants from "../../../configs/constants";
import { useEffect } from "react";
import Toast, { ToastType } from "../../../components/generic/Toast";

export const type = {
  LISTING: 1,
  DETAILS: 2,
  CREATING: 3,
};

export const StructureIndex = () => {
  const urlParams = useParams();
  const [showType, setShowType] = useState(type.LISTING);
  const [structToDetail, setStructToDetail] = useState();
  const [structsArr, setStructsArr] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteCount, setDeleteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusAccount, setStatusAccount] = useState();

  // ################## HTTP REQUEST ########################3
  const url = constants.URL_STRUCTURES;

  //decode the token and get email
  var decodedJwt = jwt_decode(localStorage.getItem("token"));
  console.log(decodedJwt);
  var id = decodedJwt[constants.ID_DECODE];
  var status = decodedJwt[constants.STATUS_ACCOUNT_DECODE];

  useEffect(() => {
    setIsLoading(true);
    //check if there is a params in the URL, so the objective is to check for a specific structure
    if (urlParams.name) {
      fetch(url + `getOne?organizerId=${id}&structureName=${urlParams.name}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => {
          setIsLoading(false);
          if (!res.ok) throw new Error(res);
          else return res.json();
        })
        .then((data) => {
          setStructToDetail(data);
          setShowType(type.DETAILS);
        })
        .catch((err) => {
          console.log(err.json());
          setIsLoading(false);
          console.log(err.message);
        });
    } else {
      fetch(url + `getAll?organizerId=${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => {
          setIsLoading(false);
          if (!res.ok) throw new Error(res.status);
          else return res.json();
        })
        .then((data) => {
          setStructsArr(data);
          console.log(data);
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err.message);
        });
    }
    fetch(constants.URL_ORGANIZERS + "information-account", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        if (data.statusAccount === "Banned") {
          Toast("Your account was banned!", "Strucutre information are read-only", ToastType.DANGER);
        }
        setStatusAccount(data.statusAccount);
      })
      .catch((error) => {
        Toast("Error getting your data", "Try again later", ToastType.DANGER);
        console.log(error);
      });
  }, []);

  // ################## HTTP REQUEST ########################3

  /*
   * Given a struct removes from the json
   */
  function deleteStruct(structToRemove) {
    if (statusAccount === "Banned") {
      Toast("Your account was banned!", "Strucutre information are read-only", ToastType.DANGER);
    } else {
      fetch(url + "delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizerId: id,
          structureName: structToRemove.name,
        }),
      })
        .then((res) => {
          if (res.status !== 200) throw new Error(res.status);
          else {
            Toast("Structure deleted", "Structure was deleted successfully", ToastType.SUCCESS);
            setDeleteCount(deleteCount + 1);
            window.location.href = "/app/organizer/structures/";
          }
        })
        .catch((err) => {
          Toast("Operation failed", "It was not possible to operate the task", ToastType.DANGER);
          console.log(err.message);
        });
    }
  }

  /**
   * Creates a structure and changes to details mode
   */
  function createStructure(name) {
    if ((name && name.length < 3) || !name) {
      tailwindToast("The name must have at least 3 digits!");
      return false;
    }

    var copyArr = structsArr.slice();

    for (var i = 0; i < copyArr.length; i++) {
      if (name === copyArr[i].name) {
        tailwindToast("The structure name is already taken!");
        return false;
      }
    }

    var newStructure = {
      name: name,
      stats: {
        creationDate: getActualDate_DayMonthYear(),
        totalEvents: 0,
        totalSections: 0,
        totalSeats: 0,
      },
      nonSeatedSections: [],
      seatedSections: [],
    };

    setIsCreating(true);
    setStructToDetail(newStructure);
    setIsCreateModalOpen(!isCreateModalOpen);
    setShowType(type.DETAILS);
    return true;
  }

  //Error toast
  const tailwindToast = (message) => {
    toast.custom((t) => (
      <div className="flex">
        <div id="toast-danger" className="mb-4 flex w-full max-w-xs items-center rounded-lg bg-white p-4 p-6 text-gray-500 shadow dark:bg-gray-800 dark:text-gray-400" role="alert">
          <div className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="sr-only">Error icon</span>
          </div>
          <div className="ml-3 text-sm font-normal">
            <span className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">There are incorrect data!</span>
            <div className="mb-2 text-sm font-normal">{message}</div>
          </div>
        </div>
      </div>
    ));
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
      <TailwindToaster />
      {/* is loading param structure */}
      {isLoading && (
        <div className="flex flex-wrap items-center justify-center pt-24 ">
          <ReactLoading type={"bubbles"} height={100} width={120} color={"#5b2bab"} />
          <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">Loading</span>
        </div>
      )}

      {/* param structure loaded */}
      {urlParams.name && !isLoading && structToDetail && (
        <div className="flex w-full flex-wrap justify-center md:justify-between">
          <span className="mb-4 self-start text-2xl font-extrabold tracking-tight dark:text-white lg:text-3xl xl:text-4xl">My Structures</span>
          <div className="flex w-full justify-center pt-4 md:justify-start">
            {showType === type.DETAILS && (
              <button
                type="submit"
                onClick={() => {
                  window.location.href = "/app/organizer/structures/";
                }}
                className="inline-flex justify-center rounded-md border border-transparent 
                     bg-green-600 py-2 px-6 text-sm font-medium text-white shadow-sm 
                     focus:outline-none hover:bg-green-700"
              >
                List of structures
              </button>
            )}
          </div>

          <DividerLine />
          <div className="w-full">
            <StructureDetails structInfo={structToDetail} deleteStruct={deleteStruct} isCreating={isCreating} statusAccount={statusAccount} />
          </div>
        </div>
      )}

      {/* param structure not found */}
      {urlParams.name && !isLoading && !structToDetail && (
        <div className="px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
          <div className="mx-auto max-w-max">
            <main className="sm:flex">
              <div className="sm:ml-6">
                <div className="sm:pl-6">
                  <h1 className="text-center text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-400 sm:text-5xl">Structure not found</h1>
                  <p className="mt-1 text-center text-base text-gray-400">We could not find any event structure with that name.</p>
                </div>
                <div className="mt-10 flex justify-center space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                  <a
                    href="/app/organizer/structures"
                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-indigo-700"
                  >
                    Go to Event Structures
                  </a>
                  <a
                    href="/app/organizer/"
                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-indigo-200"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}

      {/* show normal index*/}
      {!urlParams.name && !isLoading && (
        <div>
          {isCreateModalOpen && <CreateStructureModal setOpen={setIsCreateModalOpen} createStructure={createStructure} />}

          <div className="flex flex-wrap justify-center md:justify-between">
            <span className="mb-4 self-start text-2xl font-extrabold tracking-tight dark:text-white lg:text-3xl xl:text-4xl">My Structures</span>
            <div className="flex w-full justify-center pt-4 md:justify-start">
              {showType === type.DETAILS && (
                <button
                  type="submit"
                  onClick={() => {
                    setShowType(type.LISTING);
                  }}
                  className="inline-flex justify-center rounded-md border border-transparent 
                        bg-green-600 py-2 px-6 text-sm font-medium text-white shadow-sm 
                        focus:outline-none hover:bg-green-700"
                >
                  List of structures
                </button>
              )}
              {showType === type.LISTING && statusAccount !== "Banned" && (
                <button
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 
                            text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 
                            focus:ring-offset-2 hover:bg-indigo-700"
                  onClick={() => {
                    setIsCreateModalOpen(!isCreateModalOpen);
                  }}
                >
                  Create a structure
                </button>
              )}
            </div>
          </div>

          <DividerLine />

          {showType === type.LISTING && (
            <StructureListing setShowType={setShowType} structsArr={structsArr} setStructToDetail={setStructToDetail} deleteStruct={deleteStruct} setIsCreating={setIsCreating} />
          )}

          {showType === type.DETAILS && <StructureDetails structInfo={structToDetail} deleteStruct={deleteStruct} isCreating={isCreating} statusAccount={statusAccount} />}
        </div>
      )}
    </>
  );
};

export default StructureIndex;
