export default function StepperControl({ handleClick, currentStep, steps }) {
  return (
    <div className="container mt-7 mb-5 flex justify-around">
      <a
        href="#_"
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-yellow-400 xxs:p-4 xxs:px-6 xxs:py-3 font-medium text-indigo-600 shadow-md transition duration-300 ease-out"
        onClick={() => handleClick()}
      >
        <span className="ease absolute inset-0 flex -translate-x-full items-center justify-center bg-yellow-400 text-white duration-300 group-hover:translate-x-0">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </span>
        <span className="ease absolute flex transform items-center justify-center font-semibold text-yellow-400 transition-all duration-300 group-hover:translate-x-full">Back</span>
        <span className="invisible relative">Button Text</span>
      </a>

      <a
        href="#_"
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-green-500 xxs:p-4 px-6 py-3 font-medium text-indigo-600 shadow-md transition duration-300 ease-out"
        onClick={() => handleClick("next")}
        type="submit"
      >
        <span className="ease absolute inset-0 flex -translate-x-full items-center justify-center bg-green-500 text-white duration-300 group-hover:translate-x-0">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </span>
        <span className="ease absolute flex transform items-center justify-center font-semibold text-green-500 transition-all duration-300 group-hover:translate-x-full">
          {currentStep === steps.length - 1 ? "Confirm" : "Next"}
        </span>
        <span className="invisible relative">Button Text</span>
      </a>
    </div>
  );
}
