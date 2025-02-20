import { useState } from "react";
import { CreateAccount } from "../../../components";
import { useNavigate } from "react-router-dom";
import { Toaster, toast, ToastBar } from "react-hot-toast";
import { HiX } from "react-icons/hi";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import Toast, { ToastType } from "../../../components/generic/Toast";
import constants from "../../../configs/constants";
import { validateEmail } from "../../../helper/validations";
import ReactLoading from "react-loading";

const LOGIN_URL_ACCOUNT = constants.URL_AUTH + "validator";
const LOGIN_URL_HASH = LOGIN_URL_ACCOUNT + "-hash";
const URL_CREATE_ACCOUNT = constants.URL_VALIDATORS + "create-account";

const LoginValidator = () => {
  const [form, setForm] = useState(false);
  const [typeLogin, setTypeLogin] = useState("Account");

  const navigate = useNavigate();

  const changeLoginType = (e) => {
    setTypeLogin(e.target.name);
  };

  const [loginLoading, setLoadingLogin] = useState(false);

  const [state, setState] = useState({
    name: "",
    email: "",
    password: "",
    hash: "",
  });

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const makeLogin = (async) => {
    setLoadingLogin(true);
    if (typeLogin === "Account") {
      fetch(LOGIN_URL_ACCOUNT, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain",
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({ email: state.email, password: state.password }),
      })
        .then((response) => {
          setLoadingLogin(false);
          if (response.ok) {
            response.json().then((json) => {
              localStorage.setItem("token", json.token);
              navigate("/app/validator/");
            });
          } else {
            response.json().then((json) => {
              Toast(json.title, json.errors[0], ToastType.DANGER);
            });
          }
        })
        .catch((err) => {
          setLoadingLogin(false);
          Toast("Error trying to login", "Try again later", ToastType.DANGER);
        });
    } else {
      fetch(LOGIN_URL_HASH, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain",
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(state.hash),
      })
        .then((response) => {
          setLoadingLogin(false);
          if (response.ok) {
            response.json().then((json) => {
              Toast("Sucessfuly logged in", "Start validating event", ToastType.SUCCESS);
              localStorage.setItem("token", json.message.token);
              setTimeout(() => {
                navigate(`/app/validator/validate-tickets?eventId=${json.message.eventId}`);
              }, 1000);
            });
          } else {
            Toast("Error trying to login", "The given hash doesn't match any event", ToastType.DANGER);
          }
        })
        .catch((err) => {
          setLoadingLogin(false);
          Toast("Error trying to login", "Try again later", ToastType.DANGER);
        });
    }
  };

  const validate = (e) => {
    e.preventDefault();
    let message = "";
    if (form || typeLogin === "Account") {
      if (!validateEmail(state.email)) {
        message = "Invalid email, insert a valid email";
      } else if (state.password.length < 8) {
        message = "Password should have at least 8 caracters!";
      } else if (form && state.name.length < 3) {
        message = "Name should have at least 3 caracters!";
      }
    } else {
      if (state.hash.length < 8) {
        message = "Hash should have at least 8 caracters!";
      }
    }

    if (message) {
      Toast("Error data validation", message, ToastType.DANGER);
    } else {
      //create account
      if (form) {
        fetch(URL_CREATE_ACCOUNT, {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain",
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: JSON.stringify({ name: state.name, email: state.email, password: state.password }),
        })
          .then((response) => {
            setLoadingLogin(true);
            response.json().then((json) => {
              switch (json.status) {
                case 200:
                  Toast("Account created successfully", "Start validating your events", ToastType.SUCCESS);
                  setTimeout(() => {
                    makeLogin();
                  }, 4000);
                  break;
                case 409:
                  Toast("Your email is already in use", "Try again later, or contact us", ToastType.DANGER);
                  break;
                default:
                  Toast("Error creating account", "Try again later, or contact us", ToastType.DANGER);
              }
            });
          })
          .catch((err) => {
            setLoadingLogin(false);
            Toast("Error creating account", "Try again later, or contact us", ToastType.DANGER);
          });
      } else if (typeLogin === "Account" || typeLogin === "Hash") {
        makeLogin();
      }
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
                    <span className="md:block">Validate your events</span> <span className="text-indigo-700 md:block">easily</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">Authorized members only. Check the FAQ to understand all the available functionalities.</p>
                </div>
              </div>
              <div className="mt-16 sm:mt-24 lg:col-span-6 lg:mt-0 ">
                {!form && (
                  <div className="max-x-md x-full mx-auto w-full max-w-md overflow-hidden rounded-lg bg-white">
                    <div className="px-4 py-8 sm:px-10">
                      <div>
                        <div className="mt-1 space-y-6">
                          <form onSubmit={validate} className="space-y-6">
                            <ul className="grid grid-cols-2 content-center gap-4">
                              <li>
                                {typeLogin === "Hash" && <input className="peer sr-only" type="radio" name="Account" onChange={changeLoginType} id="Account" />}
                                {typeLogin === "Account" && <input className="peer sr-only" type="radio" name="Account" onChange={changeLoginType} checked="checked" id="Account" />}
                                <label
                                  className="flex cursor-pointer rounded-lg border border-gray-300 bg-white p-2 focus:outline-none peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-gray-800 hover:bg-gray-50"
                                  htmlFor="Account"
                                >
                                  Account
                                </label>
                              </li>
                              <li>
                                {typeLogin === "Account" && <input className="peer sr-only" type="radio" name="Hash" onChange={changeLoginType} id="Hash" />}

                                {typeLogin === "Hash" && <input className="peer sr-only" type="radio" name="Hash" onChange={changeLoginType} checked="checked" id="Hash" />}
                                <label
                                  className="flex cursor-pointer rounded-lg border border-gray-300 bg-white p-2 focus:outline-none peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-gray-800 hover:bg-gray-50"
                                  htmlFor="Hash"
                                >
                                  Hash
                                </label>
                              </li>
                            </ul>
                            {typeLogin === "Account" && (
                              <>
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
                              </>
                            )}

                            {typeLogin === "Hash" && (
                              <div>
                                <div className="mb-2 h-6 text-xs font-bold uppercase leading-8 text-gray-500">Hash</div>
                                <input
                                  name="hash"
                                  type="text"
                                  onChange={inputHandle}
                                  value={state.hash}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                              </div>
                            )}

                            <div>
                              <button
                                type="submit"
                                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-indigo-700"
                              >
                                {loginLoading && <ReactLoading type={"spin"} height={25} width={25} />}
                                {!loginLoading && <>Sign in</>}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>

                      <div className="relative mt-6 mb-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm ">
                          <span className="bg-white px-2 text-gray-500">Or</span>
                        </div>
                      </div>

                      <div>
                        <button
                          type="submit"
                          className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-indigo-700"
                          onClick={() => {
                            setForm(true);
                          }}
                        >
                          Create your account
                        </button>
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
                )}
                {form && <CreateAccount setForm={setForm} validate={validate} state={state} inputHandle={inputHandle} />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginValidator;
