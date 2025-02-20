import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import constants from "../../../configs/constants";
import { Toaster, toast, ToastBar } from "react-hot-toast";
import { HiX } from "react-icons/hi";
import Toast, { ToastType } from "../../../components/generic/Toast";
import ReactLoading from "react-loading";
import { CreateUserBackOfficeModal, UpdateUserBackOfficeModal } from "../../../components";
import { validateEmail } from "../../../helper/validations";
import ErrorModel from "../../../components/generic/ErrorModal";

const ManageBackofficeUsers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  const [users, setUsers] = useState();
  const [user, setUser] = useState();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const dataFetchedRef = useRef(false);
  let nPages = 1;

  // ################################### HTTP REQUESTS ################################

  //GET all users
  const fetchData = () => {
    fetch(constants.URL_BACKOFFICE + "users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        console.log(data);
        setUsers(data);
        nPages = Math.ceil(data.length / recordsPerPage);
      })
      .catch((error) => {
        Toast("Error getting your data", "Try again later", ToastType.DANGER);
        console.log(error);
      });
  };

  //POST create account
  const createAccountRequest = async (nameCreate, emailCreate, passwordCreate, typeAccountCreate) => {
    const data = {
      name: nameCreate,
      email: emailCreate,
      password: passwordCreate,
      typeAccount: typeAccountCreate,
    };

    fetch(constants.URL_BACKOFFICE + "create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(data),
    })
      .then((data) => {
        data.json().then((json) => {
          switch (json.status) {
            case 200:
              Toast("Created sucessufly", "", ToastType.SUCCESS);
              setTimeout(() => {
                window.location.reload(false);
              }, 1500);
              break;
            case 409:
              Toast("Account wasn't created", "Already exist an account registered with that email", ToastType.DANGER);
              break;
            default:
              Toast("Error trying to create account", "Try again later", ToastType.DANGER);
          }
        });
      })
      .catch((err) => {
        Toast("Error trying to create account", "Try again later", ToastType.DANGER);
      });
  };

  //DELETE delete User account
  const deleteUser = () => {
    fetch(constants.URL_BACKOFFICE + "delete-user", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user.userId),
    })
      .then((data) => {
        console.log(data);
        data.json().then((json) => {
          switch (json.status) {
            case 200:
              Toast("User deleted", " ", ToastType.SUCCESS);
              setTimeout(() => {
                window.location.reload(false);
              }, 1500);
              break;
            case 409:
              console.log(json);
              console.log(json.message);
              Toast("User wasn't deleted", "At least one admin should exist", ToastType.DANGER);
              break;
            default:
              Toast("Error trying to delete user", "Try again later", ToastType.DANGER);
          }
        });
      })
      .catch((err) => {
        Toast("Error trying to delete user", "Try again later", ToastType.DANGER);
      });
  };

  //PUT update User account
  const updateUserRequest = (nameCreate, emailCreate, passwordCreate, typeAccountCreate, userId) => {
    let data = {
      userId: userId,
      name: nameCreate,
      email: emailCreate,
      typeAccount: typeAccountCreate,
    };
    if (passwordCreate !== "") {
      data.password = passwordCreate;
    }

    fetch(constants.URL_BACKOFFICE + "update-user", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((data) => {
        data.json().then((json) => {
          switch (json.status) {
            case 200:
              Toast("User updated", " ", ToastType.SUCCESS);
              setTimeout(() => {
                window.location.reload(false);
              }, 1500);
              break;
            case 409:
              Toast("User wasn't updated", json.message, ToastType.DANGER);
              break;
            default:
              Toast("Error trying to update user", "Try again later", ToastType.DANGER);
          }
        });
      })
      .catch((err) => {
        Toast("Error trying to update user", "Try again later", ToastType.DANGER);
      });
  };

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetchData();
  }, []);

  // ###########################################################################################

  function createUser(name, email, password, typeAccount) {
    let message = "";
    if (!validateEmail(email)) {
      message = "Invalid email, insert a valid email";
    } else if (password.length < 8) {
      message = "Password should have at least 8 caracters!";
    } else if (name.length < 3) {
      message = "Name should have at least 3 caracters!";
    }
    if (message) {
      Toast("Error data validation", message, ToastType.DANGER);
    } else {
      setIsCreateModalOpen(false);
      createAccountRequest(name, email, password, typeAccount);
    }
  }

  function updateUser(name, email, password, typeAccount, userId) {
    let message = "";
    if (!validateEmail(email)) {
      message = "Invalid email, insert a valid email";
    } else if (password !== "" && password.length < 8) {
      message = "Password should have at least 8 caracters!!!";
    } else if (name.length < 3) {
      message = "Name should have at least 3 caracters!";
    }
    if (message) {
      Toast("Error data validation", message, ToastType.DANGER);
    } else {
      setIsUpdateModalOpen(false);
      updateUserRequest(name, email, password, typeAccount, userId);
    }
  }

  const pageNumbers = [...Array(nPages + 1).keys()].slice(1);

  const nextPage = () => {
    if (currentPage !== nPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage !== 1) setCurrentPage(currentPage - 1);
  };

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  function toggleDeleteModal() {
    setIsDeleteModalOpen(!isDeleteModalOpen);
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
      {isDeleteModalOpen && (
        <ErrorModel
          tittle={"Delete user"}
          message={"Do you want to delete this account? \n This action is irreversible"}
          onClick={() => {
            deleteUser();
          }}
          cancelBtnName={"Cancel"}
          submitBtnName={"Delete"}
          toggleModal={toggleDeleteModal}
        />
      )}
      {isCreateModalOpen && <CreateUserBackOfficeModal setOpen={setIsCreateModalOpen} createUser={createUser} />}
      {isUpdateModalOpen && <UpdateUserBackOfficeModal setOpen={setIsUpdateModalOpen} userData={user} updateUser={updateUser} />}
      <div className="flex min-h-[calc(100vh-425px)] flex-col space-y-7 sm:min-h-[calc(100vh-377px)] md:min-h-[calc(100vh-286px)]">
        <TailwindToaster />
        <div className="flex flex-wrap justify-center md:justify-between">
          <span className="font-extrabold tracking-tight dark:text-white xxs:text-lg lg:text-3xl xl:text-4xl">Users</span>
          <div className="flex w-full justify-center pt-8 md:justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center rounded-md border border-transparent 
                        bg-green-600 py-2 px-6 text-sm font-medium text-white shadow-sm 
                        focus:outline-none hover:bg-green-700"
              onClick={() => {
                setIsCreateModalOpen(!isCreateModalOpen);
              }}
            >
              Add user
            </button>
          </div>
        </div>
        <div className="grid overflow-auto lg:col-span-3 lg:row-span-2 lg:mt-8">
          {!users && (
            <div className="flex flex-wrap items-center justify-center pt-24 ">
              <ReactLoading type={"bubbles"} height={100} width={120} color={"#5b2bab"} />
              <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">Loading</span>
            </div>
          )}

          {users && users.length > 0 && (
            <div className="mt-2 flex flex-col">
              <div className="overflow-x-auto">
                <div className="inline-block w-full align-middle">
                  <div className="overflow-hidden rounded-lg border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                            Edit
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                            Remove
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((user, key) => (
                          <tr className="dark:bg-gray-800" key={key}>
                            <td className="px-6 py-4 text-sm font-medium text-black dark:text-white ">{user.email}</td>
                            <td className="truncate px-6 py-4 text-sm text-black dark:text-white">{user.name}</td>
                            <td className="truncate px-6 py-4 text-sm text-black dark:text-white">{user.typeAccount === "Admin" ? ( "Administrator"): ("Moderator")}</td>
                            <td className="px-6 py-4 text-sm text-black dark:text-white ">
                              <FaPencilAlt
                                size={25}
                                onClick={() => {
                                  setUser(user);
                                  setIsUpdateModalOpen(!isUpdateModalOpen);
                                }}
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-black dark:text-white ">
                              <FaTrashAlt
                                size={25}
                                onClick={() => {
                                  setIsDeleteModalOpen(true);
                                  toggleModal();
                                  setUser(user);
                                }}
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
          {users && users.length === 0 && (
            <div className="m-5 flex items-center justify-center">
              <span className="tracking-tight dark:text-white xxs:text-lg lg:text-xl xl:text-2xl">No users</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageBackofficeUsers;
