import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import constants from "../../../configs/constants";
import { ExclamationCircleIcon } from "@heroicons/react/solid";
import Toast, { ToastType } from "../../../components/generic/Toast";
import { Toaster, toast, ToastBar } from "react-hot-toast";
import { HiX } from "react-icons/hi";
import ReactLoading from "react-loading";

const LOGIN_URL = constants.URL_AUTH + "organizer";

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

export default function Final({ state }) {
  const navigate = useNavigate(); 
  let progress = useMotionValue(90);

  const [inserted, setInserted] = useState("Waiting");

  const url = constants.URL_ORGANIZERS;

  const dataFetchedRef = useRef(false);

  const makeLogin = (async) => {
    let email = state.email,
      password = state.password;
    fetch(LOGIN_URL, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((json) => {
            localStorage.setItem("token", json.token);
            navigate("/app/organizer/");
          });
        } else {
          response.json().then((json) => {
            Toast(json.title, json.errors[0], ToastType.DANGER);
          });
        }
      })
      .catch((err) => {
        Toast("Error trying to login", "Try again later", ToastType.DANGER);
      });
  };

  const fetchData = () => {
    let formData = new FormData();
    formData.append("walletAddress", state.walletAddress);
    formData.append("email", state.email);
    formData.append("password", state.password);
    formData.append("type", state.type);
    formData.append("name", state.name);
    formData.append("dob", state.dob);
    formData.append("gender", state.gender);
    formData.append("nif", state.nif);
    formData.append("phoneNumber", state.phoneNumber);
    formData.append("address", state.address);
    formData.append("country", state.country);
    formData.append("addressProof", state.addressProof);
    formData.append("nifProof", state.nifProof);

    fetch(url + "create-account", {
      method: "POST",
      body: formData,
    })
      .then((data) => {
        data.json().then((json) => {
          switch (json.status) {
            case 200:
              setInserted("Inserted");
              setTimeout(() => {
                makeLogin();
              }, 5000);
              break;
            case 409:
              setInserted("Duplicated");
              break;
            default:
              setInserted("Error");
          }
          console.log(json);
        });
      })
      .catch((err) => {
        setInserted("Error");
        console.log(err.message);
      });
  };

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetchData();
  }, []);

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
    <div className="container mb-10 md:mt-3">
      <div className="flex flex-col items-center">
        <TailwindToaster />
        {inserted === "Waiting" && (
          <div className="flex flex-wrap items-center justify-center pt-24 ">
            <div className="mb-10">
              <ReactLoading type={"spin"} height={100} width={120} color={"#3fe847"} />
            </div>
            <span className="mb-4 w-full self-start text-center text-xl font-semibold text-gray-500">Processing your account</span>
          </div>
        )}
        {(inserted === "Error" || inserted === "Duplicated") && (
          <>
            <ExclamationCircleIcon
              size={20}
              className={`} h-20
                w-20 text-red-700 text-red-600`}
            />
            <div className="mt-3 text-xl font-semibold uppercase text-red-500">We're sorry!</div>
            <div className="mt-3 mb-1 text-lg font-semibold text-gray-500">{inserted === "Error" ? "Some error occured on trying to creating your account" : "Your data was already recorded"}</div>
            <div className="mt-2 mb-10 text-base font-semibold text-gray-500">Try again later or contact us to know more details</div>
          </>
        )}
        {inserted === "Inserted" && (
          <>
            <motion.div initial={{ x: 0 }} animate={{ x: 100 }} style={{ x: progress }} transition={{ duration: 1 }} />
            <Confirmed progress={progress} />

            <div className="mt-3 text-xl font-semibold uppercase text-green-500">Congratulations</div>
            <div className="mt-3 mb-1 text-lg font-semibold text-gray-500">Your account has been created</div>
            <div className="mt-2 mb-10 text-base font-semibold text-gray-500">The verification should occur in a few days</div>
          </>
        )}
      </div>
    </div>
  );
}
