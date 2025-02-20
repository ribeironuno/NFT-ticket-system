import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiX } from "react-icons/hi";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import Toast, { ToastType } from "../../components/generic/Toast";
import { Toaster, toast, ToastBar } from "react-hot-toast";
import constants from "../../configs/constants";
import { validateEmail } from "../../helper/validations";
import ReactLoading from "react-loading";

const LOGIN_URL = constants.URL_AUTH + "back-office";

const Login = () => {
  const navigate = useNavigate();
  const [loginLoading, setLoadingLogin] = useState(false);

  const [state, setState] = useState({
    email: "",
    password: "",
  });

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingLogin(true)
    let message = "";
    if (!validateEmail(state.email)) {
      message = "Invalid email, insert a valid email";
    } else if (state.password.length < 8) {
      message = "Password should have at least 8 caracters!";
    }

    if (message) {
      Toast("Error trying to login", message, ToastType.DANGER);
    } else {
      fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain",
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({ email: state.email, password: state.password }),
      })
        .then((response) => {
          setLoadingLogin(true)
          if (response.ok) {
            response.json().then((json) => {
              localStorage.setItem("token", json.token);
              if (json.type === "Admin") {
                navigate("/app/back-office/admin");
              } else {
                navigate("/app/back-office/moderator/");
              }
            });
          } else {
            setLoadingLogin(false)
            response.json().then((json) => {
              Toast(json.title, json.errors[0], ToastType.DANGER);
            });
          }
        })
        .catch((err) => {
          setLoadingLogin(false)
          Toast("Error trying to login", "Try again later", ToastType.DANGER);
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

  return (
    <div className="overflow-hidden">
      <button onClick={() => navigate("/")} className="absolute top-0 left-0 m-1 rounded-full bg-indigo-600 p-3 md:m-3 lg:m-6">
        <ArrowLeftIcon className="w-4 text-white" />
      </button>
      <TailwindToaster />
      <div className="sm:pt-8 sm:pb-8">
        <main className="sm:mt-16">
          <div className="mx-auto max-w-7xl">
            <div className="lg:grid lg:grid-cols-12 lg:gap-3">
              <div className="px-4 sm:px-6 sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:flex lg:items-center lg:text-left">
                <div>
                  <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-indigo-900 sm:mt-5 sm:leading-none lg:mt-6 lg:text-4xl xl:text-5xl">
                    <span className="md:block">Follow all events in</span> <span className="text-indigo-700 md:block">one place</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                    This page is reserved for authorized persons only. Make sure you have the correct permissions for this.
                  </p>
                </div>
              </div>
              <div className="mt-8 sm:mt-24 lg:col-span-6 lg:mt-0 ">
                <div className="max-x-md x-full mx-auto w-full max-w-md overflow-hidden rounded-lg bg-white">
                  <div className="px-4 py-8 sm:px-10">
                    <div>
                      <form onSubmit={handleSubmit} className="mt-1 space-y-6">
                        <div>
                          <div className="mb-2 h-6 text-xs font-bold uppercase leading-8 text-gray-500">Email</div>
                          <input
                            type="email"
                            name="email"
                            value={state.email}
                            onChange={inputHandle}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <div className="mb-2 h-6 text-xs font-bold uppercase leading-8 text-gray-500">Password</div>
                          <input
                            name="password"
                            type="password"
                            onChange={inputHandle}
                            value={state.password}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <button className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-indigo-700">
                            {loginLoading && <ReactLoading type={"spin"} height={25} width={25} />}
                            {!loginLoading && <>Sign in</>}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="bg-gray-250 border-t-2 border-gray-300 px-4 py-6 sm:px-10">
                    <p className="text-xs leading-5 text-gray-500">
                      By signing up, you agree to our{" "}
                      <a href="_#" className="font-medium text-gray-900 hover:underline">
                        Terms
                      </a>
                      ,{" "}
                      <a href="_#" className="font-medium text-gray-900 hover:underline">
                        Data Policy
                      </a>{" "}
                      and{" "}
                      <a href="_#" className="font-medium text-gray-900 hover:underline">
                        Cookies Policy
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
