import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form } from "../../../components";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import ReactLoading from "react-loading";
import constants from "../../../configs/constants";
import Toast, { ToastType } from "../../../components/generic/Toast";
import { Toaster, toast, ToastBar } from "react-hot-toast";
import { HiX } from "react-icons/hi";

const LOGIN_URL = constants.URL_AUTH + "organizer";

export default function Login() {
  const [form, setForm] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginLoading, setLoadingLogin] = useState(false);

  const handleSubmit = async (e) => {
    setLoadingLogin(true)
    e.preventDefault();
    fetch(LOGIN_URL, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        setLoadingLogin(true)
        if (response.ok) {
          response.json().then((json) => {
            localStorage.setItem("token", json.token);
            navigate("/app/organizer/");
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
              <div className="sm:px-6 sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:flex lg:items-center lg:text-left">
                <div>
                  <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-indigo-900 sm:mt-5 sm:leading-none lg:mt-6 lg:text-4xl xl:text-5xl">
                    <span className="md:block">Upgrade your events</span> <span className="text-indigo-700 md:block">to the latest technology</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">Inspired by your needs. Create an account and start managing all events in one place.</p>
                  <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-black sm:mt-10">Used by</p>
                  <div className="mt-5 w-full sm:mx-auto sm:max-w-lg lg:ml-0">
                    <div className="flex flex-wrap items-start justify-between">
                      <div className="flex justify-center px-1">
                        <img className="h-9 sm:h-10" src={require("../../../assets/images/alticelogo.png")} alt="Tuple" />
                      </div>
                      <div className="flex justify-center px-1">
                        <img className="h-9 sm:h-10" src={require("../../../assets/images/riologo.png")} alt="Workcation" />
                      </div>
                      <div className="flex justify-center px-1">
                        <img className="h-9 sm:h-10" src={require("../../../assets/images/superbocklogo.png")} alt="StaticKit" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="xxs:mt-4 sm:mt-24 sm:p-4 lg:col-span-6 lg:mt-0">
                {!form && (
                  <div className="max-x-md x-full mx-auto w-full max-w-md overflow-hidden rounded-lg bg-white">
                    <div className="px-4 py-8 sm:px-10">
                      <div>
                        <div className="mt-1">
                          <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                              <div className="mb-2 h-6 text-xs font-bold uppercase leading-8 text-gray-500">Email</div>
                              <input
                                type="text"
                                name="mobile-or-email"
                                id="mobile-or-email"
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                required
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>

                            <div>
                              <div className="mb-2 h-6 text-xs font-bold uppercase leading-8 text-gray-500">Password</div>
                              <input
                                id="password"
                                name="password"
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                required
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>

                            <div>
                              <button className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-indigo-700">
                                {loginLoading &&
                                  <ReactLoading type={"spin"} height={25} width={25} />
                                }
                                {!loginLoading &&
                                  <>
                                    Sign in
                                  </>
                                }
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
                          Create your account now
                        </button>
                      </div>
                    </div>
                    <div className="border-t-2 border-gray-200 bg-gray-50 px-4 py-6 sm:px-10">
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
                {form && (
                  <div className="max-x-md x-full mx-auto w-full max-w-xl overflow-hidden rounded-lg bg-white">
                    <div className="px-1 py-2 sm:px-10">
                      <Form setForm={setForm}></Form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
