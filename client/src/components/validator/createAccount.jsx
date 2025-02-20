const CreateAccount = ({ setForm, validate, state, inputHandle }) => {  
  return (
    <div className="max-x-md x-full mx-auto w-full max-w-md overflow-hidden rounded-lg bg-white">
      <div className="px-4 py-8 sm:px-10">
        <div>
          <div className="mt-1 space-y-6">
            <div>
              <div className="mb-2 h-6 text-xs font-bold uppercase leading-8 text-gray-500">Name</div>
              <input
                type="text"
                name="name"
                value={state.name}
                onChange={inputHandle}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

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
                value={state.password}
                onChange={inputHandle}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 content-center gap-4">
              <button
                type="submit"
                className="flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-indigo-700"
                onClick={() => {
                  setForm(false);
                }}
              >
                Back
              </button>
              <button
                type="submit"
                className="flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-indigo-700"
                onClick={validate}
              >
                Create account
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t-2 border-gray-200 bg-gray-50 px-4 py-6  sm:px-10">
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
  );
};

export default CreateAccount;
