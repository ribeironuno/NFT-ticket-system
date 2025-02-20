import { useState } from "react";
import { Modal, ModalBackground, PaginationTable, DynamicForm } from "../../../components";
import { TrashIcon, PlusIcon, PencilIcon, UserGroupIcon, ExclamationIcon } from "@heroicons/react/outline";
import { Accordion, AccordionHeader, AccordionBody } from "@material-tailwind/react";
import { UserAddIcon } from "@heroicons/react/solid";
import constants from "../../../configs/constants";
import jwt_decode from "jwt-decode";
import Toast, { ToastType } from "../../../components/generic/Toast";
import { useEffect } from "react";
import ReactLoading from "react-loading";
import { Toaster, toast, ToastBar } from "react-hot-toast";
import { HiX } from "react-icons/hi";
import { validateEmail } from "../../../helper/validations";

const ValidatorGroups = () => {
  //const urlParams = useParams();
  const [open, setOpen] = useState(-1);
  const [filter, setFilter] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [groups, setGroups] = useState([]);
  const [validators, setValidators] = useState([]);
  const [tmpData, setTmpData] = useState();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [groupNameInput, setGroupNameInput] = useState("");
  const [submitStatus, setSubmitStatus] = useState({});
  const [modalContent, setModalContent] = useState("");
  const [groupToDelete, setGroupToDelete] = useState({
    groupId: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statusAccount, setStatusAccount] = useState();

  // ################## HTTP REQUEST ########################3
  const url = constants.URL_VALIDATORSGROUP;
  const validatorsUrl = constants.URL_VALIDATORS;
  const organizersUrl = constants.URL_ORGANIZERS;

  //decode the token and get id
  var decodedJwt = jwt_decode(localStorage.getItem("token"));
  var organizerId = decodedJwt[constants.ID_DECODE];

  //############################### HTTP REQUESTS #####################################
  useEffect(() => {
    setIsLoading(true);
    fetch(url + `getAll?organizerId=${organizerId}`, {
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
        setGroups(data);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err.message);
      });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetch(validatorsUrl + `getAll`, {
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
        setValidators(data);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err.message);
      });
    fetch(constants.URL_ORGANIZERS + "information-account", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        if (data.statusAccount === "Banned") {
          Toast("Your account was banned!", "Validators groups information are read-only", ToastType.DANGER);
        }
        setStatusAccount(data.statusAccount);
      })
      .catch((error) => {
        Toast("Error getting your data", "Try again later", ToastType.DANGER);
        console.log(error);
      });
  }, []);

  //DELETE delete validator group by ID
  function deleteGroupRequest() {
    fetch(url + `delete?groupId=${groupToDelete.groupId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        else {
          Toast("Validators Group deleted", "Validators Group was deleted successfully", ToastType.SUCCESS);
          deleteGroup(groupToDelete.name);
        }
      })
      .catch((err) => {
        Toast("Operation failed", "It was not possible to operate the task", ToastType.DANGER);
        console.log(err.message);
      });
  }

  //POST create a validator group
  function createGroupRequest(groupToAdd) {
    fetch(url + "create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groupToAdd),
    })
      .then((res) => {
        console.log("res", res);
        if (res.status !== 200) throw new Error(res.status);
        else {
          Toast("Validators Group created", "", ToastType.SUCCESS);
          setTimeout(() => {
            window.location.reload(false);
          }, 1500);
        }
      })
      .catch((err) => {
        Toast("Operation failed", "It was not possible to operate the task", ToastType.DANGER);
        console.log(err.message);
      });
  }

  //PUT update validator group information (validators in it)
  function updateGroupRequest(bodyToSend) {
    fetch(url + "update", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyToSend),
    })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        else {
          Toast("Validators Group edited", "", ToastType.SUCCESS);
        }
      })
      .catch((err) => {
        Toast("Operation failed", "It was not possible to operate the task", ToastType.DANGER);
        console.log(err);
      });
  }

  /**
   * Function to handle the accordion open/close
   *
   * @param {int} value the accordion index to open
   */
  const handleOpen = (value) => {
    setItemsPerPage(5);
    setEditMode(false);
    setTmpData(undefined);
    setFilter("");
    setOpen(open === value ? -1 : value);
  };

  /**
   * Function to set the filter string
   *
   * @param {Event} event
   */
  const handleFilter = (event) => {
    setFilter(event.target.value);
  };

  /**
   * Function to set the number of validators per page
   *
   * @param {Event} event
   */
  const handleItemsPerPage = (event) => {
    setItemsPerPage(event.target.value);
  };

  /**
   * Function to handle changes on the temp. data
   *
   * @param {string} type the type of change
   * @param {string} email the validator where the change is to be made
   */
  const handleTmpDataChanges = (type, email) => {
    if (type === "delete") {
      const filtered = tmpData.filter((validator) => validator.email !== email);
      setTmpData(filtered);
    } else {
      const currentTmpData = [...tmpData];
      for (let i = 0; i < validators.length; i++) {
        if (validators[i].email === email) {
          currentTmpData.unshift({ name: validators[i].name, email: email });
        }
      }
      setTmpData(currentTmpData);
    }
  };

  /**
   * Function to save the changes done
   *
   * @param {string} validatorsGroupName the group which will be affected by the changes
   */
  const saveChanges = (validatorsGroupName) => {
    const currentGroups = groups;

    currentGroups.forEach((group) => {
      if (group.validatorsGroupName === validatorsGroupName) {
        group.validators = tmpData;
      }
    });
    setGroups(currentGroups);
    setTmpData(undefined);
  };

  /**
   * Function to toggle the modal
   */
  const toggleModal = () => {
    setGroupNameInput("");
    setEmailInput("");
    setSubmitStatus({});
    setModalIsOpen(!modalIsOpen);
  };

  /**
   * Function that updates the state of the emailInput and validates
   *
   * @param {Event} event
   */
  const handleEmail = (event) => {
    var email = event.target.value;
    setEmailInput(email);

    if (!validateEmail(email)) {
      setSubmitStatus({
        status: false,
        error: "",
      });
    } else if (tmpData.some((validator) => validator.email === email)) {
      setSubmitStatus({
        status: false,
        error: "E-mail already added to this group",
      });
    } else {
      for (let i = 0; i < validators.length; i++) {
        if (validators[i].email === email) {
          setSubmitStatus({ status: true });
          break;
        } else {
          setSubmitStatus({ status: false });
        }
      }
    }
  };

  /**
   * Function that updates the state of the groupNameInput and validates
   *
   * @param {Event} event
   */
  const handleGroupName = (event) => {
    var validatorsGroupName = event.target.value;
    setGroupNameInput(validatorsGroupName);

    if (groups.some((group) => group.validatorsGroupName === validatorsGroupName)) {
      setSubmitStatus({
        status: false,
        error: "Group already exists",
      });
    } else {
      setSubmitStatus({ status: true });
    }
  };

  /**
   * Function that adds a new group
   *
   * @param {string} validatorsGroupName the name of the new group
   */
  const addGroup = (validatorsGroupName) => {
    const currentGroups = [...groups];
    currentGroups.unshift({ validatorsGroupName: validatorsGroupName, validators: [] });
    setGroups(currentGroups);
  };

  /**
   * Function that deletes a group
   *
   * @param {string} validatorsGroupName the name of the group to be deleted
   */
  const deleteGroup = (validatorsGroupName) => {
    const filtered = groups.filter((group) => group.validatorsGroupName !== validatorsGroupName);
    setOpen(-1);
    setGroups(filtered);
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
      {isLoading && (
        <div className="flex flex-wrap items-center justify-center pt-24 ">
          <ReactLoading type={"bubbles"} height={100} width={120} color={"#5b2bab"} />
          <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">Loading</span>
        </div>
      )}

      {!isLoading && (
        <div className="flex h-full w-full flex-col items-center justify-center space-y-4 align-middle">
          <span className="mb-4 self-start font-extrabold tracking-tight dark:text-white xxs:text-lg lg:text-3xl xl:text-4xl">My Groups</span>
          {statusAccount !== "Banned" && (
            <button
              onClick={() => {
                setModalContent("ADD-GROUP");
                toggleModal();
              }}
              className="self-start rounded-md border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-indigo-700"
            >
              Create new group
            </button>
          )}
          {/* PAGE MODAL */}

          <div>
            <Modal
              modalIsOpen={modalIsOpen}
              toggleModal={toggleModal}
              modalContent={
                modalContent === "ADD-VALIDATOR-FORM" ? (
                  /* FORM TO ADD A NEW VALIDATOR */
                  <DynamicForm
                    width={"md:w-96 w-full"}
                    submitText="Add validator"
                    inputs={[
                      {
                        label: "E-mail",
                        type: "text",
                        placeholder: "johndoe@gmail.com",
                        onChange: handleEmail,
                        value: emailInput,
                      },
                    ]}
                    submitStatus={submitStatus}
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleTmpDataChanges("add", emailInput);
                      toggleModal();
                    }}
                  />
                ) : modalContent === "DELETE-GROUP" ? (
                  /* POPUP TO DELETE GROUP */
                  <div className="flex flex-col items-center justify-center space-y-5 align-middle">
                    <span className="font-medium dark:text-white">Are you sure you want to delete {groupToDelete.name}?</span>
                    <div className="flex flex-row items-center justify-center space-x-5 align-middle">
                      <button
                        onClick={() => {
                          toggleModal();
                          deleteGroupRequest();
                        }}
                        className="rounded-lg border bg-green-700 py-1 px-4 text-white hover:bg-green-800 dark:border-gray-700"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => {
                          toggleModal();
                          setGroupToDelete({ groupId: "", name: "" });
                        }}
                        className="rounded-lg border bg-red-700 py-1 px-4 text-white hover:bg-red-800 dark:border-gray-700"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : modalContent === "ADD-GROUP" ? (
                  /* FORM TO ADD A NEW GROUP */
                  <DynamicForm
                    width={"md:w-96 w-full"}
                    submitText="Create group"
                    inputs={[
                      {
                        label: "Group name",
                        type: "text",
                        placeholder: "group xyz",
                        onChange: handleGroupName,
                        value: groupNameInput,
                      },
                    ]}
                    submitStatus={submitStatus}
                    onSubmit={(event) => {
                      event.preventDefault();

                      var groupToAdd = {
                        validatorsGroupName: groupNameInput,
                        validators: [],
                      };

                      createGroupRequest(groupToAdd);
                      toggleModal();
                    }}
                  />
                ) : null
              }
              icon={
                modalContent === "ADD-VALIDATOR-FORM" ? (
                  <UserAddIcon className="h-9 w-9 text-green-700 dark:text-white" />
                ) : modalContent === "ADD-GROUP" ? (
                  <UserGroupIcon className="h-9 w-9 text-green-700 dark:text-white" />
                ) : modalContent === "DELETE-GROUP" ? (
                  <ExclamationIcon className="h-9 w-9 text-yellow-400" />
                ) : null
              }
            />

            {/* PAGE BACKGROUND MODAL */}

            <ModalBackground modalIsOpen={modalIsOpen} toggleModal={toggleModal} />
          </div>

          <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-2">
            {groups.map((group, index) => (
              /* GROUP ACCORDION */

              <Accordion open={open === index} key={index} style={{ margin: 0 }} className="animate-fade-in dark:text-white">
                <div className="mx-auto h-fit w-full items-center rounded-lg border bg-white shadow-md hover:shadow-lg dark:border-gray-700 dark:bg-gray-700">
                  {/* ACCORDION HEADER */}

                  <AccordionHeader
                    className={`rounded-lg py-3 transition-opacity duration-300 dark:text-white ${open === index ? "" : "hover:bg-gray-50 dark:hover:bg-gray-600"}`}
                    onClick={() => {
                      handleOpen(index);
                    }}
                  >
                    <div className="flex h-fit w-full flex-col items-center justify-center space-y-4 px-10 align-middle lg:flex-row lg:justify-between lg:space-y-0">
                      {/* GROUP NAME */}

                      <span className="font-bold text-gray-700 dark:text-white">{group.validatorsGroupName}</span>
                      {open === index ? (
                        <div className="flex flex-col items-center justify-center space-y-5 align-middle transition duration-300 md:flex-row md:flex-wrap md:space-y-0">
                          <div className="flex flex-row items-center justify-center space-x-1 align-middle">
                            {/* INPUT TO FILTER VALIDATORS */}
                            <input
                              placeholder="Type to filter..."
                              type="text"
                              className="h-full w-48 rounded-lg border border-gray-300 p-1 text-sm font-light text-gray-600 transition duration-300 focus:ring-indigo-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-600 dark:text-white dark:placeholder:text-gray-400 dark:hover:bg-gray-800"
                              onClick={(event) => {
                                event.stopPropagation();
                              }}
                              onChange={handleFilter}
                            />
                            {/* SELECTOR FOR NUMBER OF VALIDATOR PER PAGE */}

                            <select
                              onChange={handleItemsPerPage}
                              onClick={(event) => {
                                event.stopPropagation();
                              }}
                              id="countries"
                              className="w-12 rounded-lg border border-gray-300 bg-white p-1 text-sm text-gray-900 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-600 dark:text-white dark:focus:border-indigo-500"
                            >
                              <option value={5}>5</option>
                              <option value={7}>7</option>
                              <option value={10}>10</option>
                            </select>
                          </div>

                          <div className="flex flex-row items-center justify-center space-x-1 align-middle">
                            {/* DISCARD CHANGES BUTTON */}
                            <button
                              className={
                                editMode && open === index
                                  ? "ml-1 h-full w-fit translate-y-0 rounded-md border bg-white p-1 text-sm text-black transition duration-300 hover:bg-black hover:text-white dark:border-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-black"
                                  : "absolute h-0 w-0 -translate-y-1"
                              }
                              onClick={(event) => {
                                setEditMode(false);
                                setTmpData(undefined);
                                event.stopPropagation();
                              }}
                            >
                              {editMode ? "Discard" : ""}
                            </button>
                            {/* SAVE CHANGES BUTTON */}

                            <button
                              className={
                                editMode && open === index
                                  ? "h-full w-fit translate-y-0 rounded-md border bg-white p-1 text-sm text-black transition duration-300 hover:bg-green-900 hover:text-white dark:border-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-green-900"
                                  : "absolute h-0 w-0 -translate-y-2"
                              }
                              onClick={(event) => {
                                if (statusAccount === "Banned") {
                                  Toast("Your account was banned!", "Validators groups information are read-only", ToastType.DANGER);
                                } else {
                                  saveChanges(group.validatorsGroupName);

                                  var bodyToSend = {
                                    newValidatorsGroup: {
                                      organizerId: organizerId,
                                      validatorsGroupName: group.validatorsGroupName,
                                      validators: tmpData,
                                    },
                                    groupId: group.groupId,
                                  };

                                  updateGroupRequest(bodyToSend);
                                  setEditMode(false);
                                  event.stopPropagation();
                                }
                              }}
                            >
                              {editMode ? "Save" : ""}
                            </button>
                            {/* ADD AN NEW VALIDATOR BUTTON*/}

                            <button
                              className={
                                editMode && open === index
                                  ? "h-full w-fit translate-y-0 rounded-full border bg-white p-1 text-black transition duration-300 hover:bg-blue-800 hover:text-white dark:border-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-blue-800"
                                  : "absolute h-0 w-0 -translate-y-3"
                              }
                              onClick={(event) => {
                                setModalContent("ADD-VALIDATOR-FORM");
                                toggleModal();
                                event.stopPropagation();
                              }}
                            >
                              <PlusIcon className={`${editMode ? "h-5 w-5" : ""}`} />
                            </button>
                            {/* EDIT MODE BUTTON*/}

                            <button
                              onClick={(event) => {
                                if (statusAccount === "Banned") {
                                  Toast("Your account was banned!", "Validators groups information are read-only", ToastType.DANGER);
                                } else {
                                  setTmpData(group.validators);
                                  setEditMode(true);
                                  event.stopPropagation();
                                }
                              }}
                              className={
                                editMode && open === index
                                  ? "absolute h-0 w-0 -translate-y-1"
                                  : "flex translate-y-0 items-center justify-center rounded-lg border bg-white p-1 align-middle text-black transition duration-300 hover:scale-105 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                              }
                            >
                              <PencilIcon className={`${editMode ? "" : "h-5 w-5"}`} />
                            </button>
                            {/*DELETE GROUP BUTTON*/}

                            <button
                              onClick={(event) => {
                                if (statusAccount === "Banned") {
                                  Toast("Your account was banned!", "Validators groups information are read-only", ToastType.DANGER);
                                } else {
                                  setModalContent("DELETE-GROUP");
                                  setGroupToDelete({ groupId: group.groupId, name: group.validatorsGroupName });
                                  toggleModal();
                                  event.stopPropagation();
                                }
                              }}
                              className="flex items-center justify-center rounded-lg border bg-red-600 p-1 align-middle text-white transition duration-300 hover:bg-red-800 dark:border-gray-700"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </AccordionHeader>

                  <AccordionBody
                    id="accordion-body"
                    className="h-64 overflow-y-auto bg-white py-0 scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-gray-400 scrollbar-track-rounded-full scrollbar-thumb-rounded-full dark:bg-gray-700"
                  >
                    {/* PAGINATION TABLE WITH VALIDATORS */}

                    <PaginationTable
                      headerValues={["Name", "Email"]}
                      items={tmpData === undefined ? group.validators : tmpData}
                      itemsPerPage={itemsPerPage}
                      filter={filter}
                      editMode={editMode}
                      primaryKey={"email"}
                      handleDataUpdate={handleTmpDataChanges}
                    />
                  </AccordionBody>
                </div>
              </Accordion>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ValidatorGroups;
