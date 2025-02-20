import { useState, useEffect, useRef } from "react";
import { ConnectWalletButton } from "../../../components";
import { Toaster, toast, ToastBar } from "react-hot-toast";
import { HiX } from "react-icons/hi";
import Toast, { ToastType } from "../../../components/generic/Toast";
import { validateDate, validateEmail, validateOnlyNumbers } from "../../../helper/validations";
import ReactLoading from "react-loading";
import constants from "../../../configs/constants";

const InformationAccount = () => {
  // ######################## HTTP REQUESTS #######################
  const dataFetchedRef = useRef(false);

  const [organizer, setOrganizer] = useState();
  const [nifProofUrl, setNifProofUrl] = useState("");
  const [addressProofUrl, setAddressProofUrl] = useState("");

  //GET information account of organizer
  const fetchData = () => {
    fetch(constants.URL_ORGANIZERS + "information-account", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        data.walletAddress.push("");
        data.password = "";
        console.log(data);
        setOrganizer(data);
      })
      .catch((error) => {
        Toast("Error getting your data", "Try again later", ToastType.DANGER);
        console.log(error);
      });
  };

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetchData();
  }, []);

  const updateData = () => {
    let formData = new FormData();
    organizer.walletAddress.pop();
    console.log(JSON.stringify(organizer.walletAddress));
    formData.append("walletAddress", JSON.stringify(organizer.walletAddress));
    formData.append("email", organizer.email);
    formData.append("password", organizer.password);
    formData.append("name", organizer.name);
    formData.append("nif", organizer.nif);
    formData.append("phoneNumber", organizer.phoneNumber);
    formData.append("address", organizer.address);
    formData.append("country", organizer.country);
    formData.append("addressProof", organizer.addressProof);
    formData.append("nifProof", organizer.nifProof);
    //If account is personal then the dob and gender should be sent
    if (organizer.type === "Personal") {
      formData.append("dob", organizer.dob);
      formData.append("gender", organizer.gender);
    }

    fetch(constants.URL_ORGANIZERS + "update-account", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    })
      .then((res) => {
        if (res.ok) {
          Toast("Data updated", " ", ToastType.SUCCESS);
          setTimeout(() => {
            window.location.reload(false);
          }, 3000);
        } else {
          Toast("Error trying to update your data", "Try again later", ToastType.DANGER);
          organizer.walletAddress.push("");
        }
      })
      .catch((err) => {
        Toast("Error trying to update your data", "Try again later", ToastType.DANGER);
        organizer.walletAddress.push("");
      });
  };

  // ###########################################################################
  const inputHandle = (e) => {
    if (e.target.name === "walletAddress") {
      let previousOrganizer = organizer.walletAddress;
      //if is gonna be removed
      if (e.target.previous) {
        //remove the sellected account
        e.target.value = previousOrganizer.filter(function (letter) {
          return letter !== e.target.previous;
        });
        //add a option to connect a another wallet if was not there
        if (e.target.value.indexOf("") === -1) {
          e.target.value.push("");
        }
      } else {
        // check if the account was already on the list
        if (previousOrganizer.indexOf(e.target.value) === -1) {
          previousOrganizer.push(e.target.value);
        }
        //remove the option to add another account
        e.target.value = previousOrganizer.filter(function (letter) {
          return letter !== "";
        });
        //remove the option to add another account
        e.target.value.push("");
      }
    }

    if (e.target.name === "addressProof" || e.target.name === "nifProof") {
      if (e.target.name === "addressProof") {
        setAddressProofUrl(e.target.value);
      } else {
        setNifProofUrl(e.target.value);
      }
      setOrganizer({
        ...organizer,
        [e.target.name]: e.target.files[0],
      });
    } else {
      setOrganizer({
        ...organizer,
        [e.target.name]: e.target.value,
      });
    }
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

  const handleClick = () => {
    let message = "";
    if (organizer.walletAddress.length === 1) {
      message = "Login at least one metamask account!";
    } else if (!validateOnlyNumbers(organizer.phoneNumber)) {
      message = "Invalid cell phone";
    } else if (!validateOnlyNumbers(organizer.nif)) {
      message = "Invalid NIF";
    } else if (organizer.address.length < 10) {
      message = "Invalid Address, should have at least 10 caracters";
    } else if (!validateEmail(organizer.email)) {
      message = "Invalid email, insert a valid email";
    } else if (organizer.password !== "" && organizer.password.length < 8) {
      message = "Password should have at least 8 caracters";
    } else if (organizer.name.length < 3) {
      message = "Invalid name, should have at least 3 caracters";
    } else if (organizer.type === "Personal" && !validateDate(organizer.dob)) {
      message = "Invalid dob, insert in the format dd/mm/yyyy";
    } else if ((organizer.addressProof && !organizer.nifProof) || (!organizer.addressProof && organizer.nifProof)) {
      message = "If you want a review account, insert both documents proofs";
    }

    if (message !== "") {
      Toast("Error validating your data", message, ToastType.DANGER);
    } else {
      updateData();
    }
  };

  return (
    <div>
      <div className=" justify-start pb-0">
        <h1 className="inline-block font-extrabold tracking-tight dark:text-white xxs:text-lg lg:text-3xl xl:text-4xl">My Account</h1>
      </div>

      {!organizer && (
        <div className="flex flex-wrap items-center justify-center pt-24 ">
          <ReactLoading type={"bubbles"} height={100} width={120} color={"#5b2bab"} />
          <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">Loading</span>
        </div>
      )}
      {organizer && (
        <div className="mt-4 justify-center">
          <TailwindToaster />
          <div className="space-y-6">
            {/* WEB3 ACCOUNTS*/}
            <div className="rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-700 sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6 ">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">Web3 Account</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Handle the transactions in your accounts.</p>
                </div>
                <div className="mt-5 md:col-span-2 md:mt-0">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="xxxs:col-span-3 sm:col-span-2">
                      <label className="text-md mb-2 mr-3 block font-medium text-gray-700 dark:text-gray-200">Wallet Address</label>

                      {organizer.walletAddress.map((walletAddress, key) => (
                        <div key={key}>
                          <ConnectWalletButton inputHandle={inputHandle} walletAddress={walletAddress} />
                        </div>
                      ))}
                      {organizer.walletAddress.length === 0 && <ConnectWalletButton inputHandle={inputHandle} walletAddress="" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PERSONAL/COMPANY INFORMATION */}
            <div className="rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-700 sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">{organizer.type} Information</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your personal data and credentials access.</p>
                </div>
                <div className="mt-5 md:col-span-2 md:mt-0">
                  <div className="mb-4 sm:col-span-6">
                    <label className="inline-block text-sm font-medium text-gray-700 dark:text-gray-200">Status Account</label>
                    {organizer.statusAccount === "WaitingValidation" && (
                      <label className="ml-3 inline-block rounded-md border border-gray-400 bg-cyan-700 px-2 text-sm font-medium text-gray-700 text-gray-200 shadow-sm">Waiting Review</label>
                    )}
                    {organizer.statusAccount === "Active" && (
                      <label className="color:green ml-3 inline-block rounded-md border border-gray-400 bg-green-800 px-4 text-sm font-medium text-gray-700 text-gray-200 shadow-sm">Ative</label>
                    )}
                    {organizer.statusAccount === "NotValid" && (
                      <label className="ml-3 inline-block rounded-md border border-gray-400 bg-yellow-500 px-4 text-sm  font-medium text-gray-700 text-gray-200 shadow-sm">Validation Rejected</label>
                    )}
                    {organizer.statusAccount === "Banned" && (
                      <label className="ml-3 inline-block rounded-md border border-gray-400  bg-red-800 px-4 text-sm font-medium text-gray-700 text-gray-200 shadow-sm">Banned</label>
                    )}
                  </div>
                  <div className="grid gap-6 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{organizer.type === "Company" ? "Company name" : "Full name"}</label>
                      <input
                        type="text"
                        name="name"
                        value={organizer.name}
                        onChange={inputHandle}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">NIF</label>
                      <input
                        type="text"
                        name="nif"
                        value={organizer.nif}
                        onChange={inputHandle}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                        disabled
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Cell phone number</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={organizer.phoneNumber}
                        onChange={inputHandle}
                        autoComplete="family-name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                    {organizer.type === "Personal" && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Date of birth</label>
                        <input
                          type="text"
                          name="dob"
                          value={organizer.dob}
                          onChange={inputHandle}
                          autoComplete="family-name"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                        />
                      </div>
                    )}
                    {organizer.type === "Personal" && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Gender</label>
                        <select
                          name="gender"
                          value={organizer.gender}
                          onChange={inputHandle}
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    )}
                    <div className="sm:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Full address</label>
                      <input
                        type="text"
                        name="address"
                        value={organizer.address}
                        onChange={inputHandle}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Country</label>
                      <select
                        name="country"
                        value={organizer.country}
                        onChange={inputHandle}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                      >
                        <option>Portugal</option>
                        <option>Spain</option>
                        <option>France</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                      <input
                        type="email"
                        value={organizer.email}
                        onChange={inputHandle}
                        name="email"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={organizer.password}
                        onChange={inputHandle}
                        autoComplete="street-address"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PROOF DOCUMENTS */}
            <div className="rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-700 sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">Documents</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Files proofing your data for the validation process. Only upload your documents again if you want a review of your account situation.
                  </p>
                </div>
                <div className="mt-5 md:col-span-2 md:mt-0">
                  <div className="grid gap-6 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Address document</label>
                      <input
                        type="file"
                        className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:text-sm file:font-semibold dark:text-white"
                        value={addressProofUrl}
                        onChange={inputHandle}
                        name="addressProof"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">NIF document</label>
                      <input
                        type="file"
                        className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:text-sm file:font-semibold dark:text-white"
                        value={nifProofUrl}
                        onChange={inputHandle}
                        name="nifProof"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              {organizer.statusAccount !== "Banned" && (
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-indigo-700"
                  onClick={handleClick}
                >
                  Edit account
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default InformationAccount;
