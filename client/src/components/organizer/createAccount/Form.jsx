import { useState } from "react";
import { Stepper, StepperControl, AccountInformation, PersonalDetails, Documents, Final } from "../../index";
import { Toaster, toast, ToastBar } from "react-hot-toast";
import { HiX } from "react-icons/hi";
import { validateDate, validateEmail, validateOnlyNumbers } from "../../../helper/validations";

const Form = ({ setForm }) => {
  const formArray = [1, 2, 3];
  const [formNo, setFormNo] = useState(formArray[0]);
  const [state, setState] = useState({
    walletAddress: "",
    email: "",
    password: "",
    type: "Personal",
    name: "",
    dob: "",
    gender: "Male",
    nif: "",
    phoneNumber: "",
    address: "",
    country: "Portugal",
    addressProof: "",
    nifProof: "",
  });

  const inputHandle = (e) => {
    if (e.target.name !== "addressProof" && e.target.name !== "nifProof"){
      setState({
        ...state,
        [e.target.name]: e.target.value,
      });
    }else{
      console.log(e.target.files[0])
      console.log(e.target.value + "value")
      setState({
        ...state,
        [e.target.name]: e.target.files[0],
      });
    }
  };

  const [currentStep, setCurrentStep] = useState(1);

  const steps = ["Account Information", "Personal Details", "Documents", "Complete"];

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

  const handleClick = (direction) => {
    let newStep = currentStep,
      message = "";
    direction === "next" ? newStep++ : newStep--;

    if (direction === "next") {
      switch (formNo) {
        case 1:
          if (!(state.walletAddress && state.email && state.password)) {
            message = "Make sure all fields are filled";
          } else {
            if (!validateEmail(state.email)) {
              message = "Invalid email, insert a valid email";
            } else if (state.password.length < 8) {
              message = "Password should have at least 8 caracters";
            }
          }
          break;
        case 2:
          if (state.type === "Company") {
            if (!(state.name && state.nif && state.address && state.phoneNumber)) {
              message = "Make sure all fields are filled";
            } else {
              if (state.name.length < 3) {
                message = "Invalid company name, should have at least 3 caracters";
              }
            }
          } else {
            if (!(state.name && state.dob && state.nif && state.address && state.phoneNumber)) {
              message = "Make sure all fields are filled";
            } else {
              if (state.name.length < 3) {
                message = "Invalid name, should have at least 3 caracters";
              } else if (!validateDate(state.dob)) {
                message = "Invalid dob, insert in the format dd/mm/yyyy";
              }
            }
          }
          if (!validateOnlyNumbers(state.phoneNumber)) {
            console.log(state.phoneNumber)
            message = "Invalid cell phone";
          } else if (!validateOnlyNumbers(state.nif)) {
            message = "Invalid NIF";
          } else if (state.address.length < 10) {
            message = "Invalid Address, should have at least 10 caracters";
          }
          break;
        case 3:
          if (!(state.nifProof && state.addressProof)) {
            message = "Upload all the files";
          }
          break;
        default:
          break;
      }
      if (!message) {
        newStep > 0 && newStep <= steps.length && setCurrentStep(newStep);
        newStep > 0 && newStep <= steps.length && setFormNo(newStep);
      } else {
        tailwindToast(message);
      }
    } else {
      if (currentStep > 1) {
        setCurrentStep(formNo - 1);
        setFormNo(formNo - 1);
      } else {
        setForm(false);
      }
    }
  };

  return (
    <>
      <TailwindToaster />
      <div className="sm:mt-5 sm:p-3 sm:p-0">
        <div className="m-4">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>
        <div>
          <div className="mt-16">
            {formNo === 1 && <AccountInformation state={state} inputHandle={inputHandle} handleClick={handleClick} currentStep={currentStep} steps={steps} />}

            {formNo === 2 && <PersonalDetails state={state} inputHandle={inputHandle} />}

            {formNo === 3 && <Documents state={state} inputHandle={inputHandle} />}

            {formNo === 4 && <Final state={state} />}
          </div>
          {formNo < 4 && <StepperControl handleClick={handleClick} currentStep={currentStep} steps={steps} />}
        </div>
      </div>
    </>
  );
};

export default Form;
