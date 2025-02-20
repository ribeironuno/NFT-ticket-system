const PersonalDetails = ({ state, inputHandle }) => {
  return (
    <div className="flex flex-col ">
      {state.type === "Personal" && (
        <>
          <div className="w-full flex-1">
            <div className="mt-3 mb-2 h-6 text-xs font-bold uppercase leading-8 text-gray-500">Full name</div>
            <input
              type="text"
              name="name"
              value={state.name}
              onChange={inputHandle}
              className="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="w-full flex-1">
            <div className="grid grid-cols-2 grid-rows-1 content-center gap-4">
              <div className="col-span-1 rows-span-1 mt-1 mb-2 h-6 text-xs font-bold uppercase leading-8 text-gray-500">Date of birth</div>
              <div className="col-span-1 rows-span-1 mt-1 h-6 text-xs font-bold uppercase leading-8 text-gray-500">Gender</div>
            </div>
          </div>

          <div className="w-full flex-1">
            <div className="grid grid-cols-2 content-center gap-4 ">
              <input
                type="text"
                name="dob"
                value={state.dob}
                onChange={inputHandle}
                className="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              />
              <select
                name="gender"
                className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                value={state.gender}
                onChange={inputHandle}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </>
      )}

      {state.type === "Company" && (
        <>
          <div className="w-full flex-1">
            <div className="mt-3 mb-2 h-6 text-xs font-bold uppercase leading-8 text-gray-500">Company name</div>
            <input
              type="text"
              name="name"
              value={state.name}
              onChange={inputHandle}
              className="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </>
      )}
      <div className="w-full flex-1">
        <div className="grid grid-cols-2 grid-rows-1 content-center gap-4">
          <div className="cols-span-1 rows-span-1 mt-1 mb-2 h-6 text-xs font-bold uppercase leading-8 text-gray-500">Phone number</div>
          <div className="cols-span-1 rows-span-1 mt-1 mb-2 h-6 text-xs font-bold uppercase leading-8 text-gray-500">NIF</div>
        </div>
      </div>

      <div className="w-full flex-1">
        <div className="grid grid-cols-2 content-center gap-3 ">
          <input
            type="tel"
            name="phoneNumber"
            value={state.phoneNumber}
            onChange={inputHandle}
            className="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
          />
          <input
            type="text"
            name="nif"
            value={state.nif}
            onChange={inputHandle}
            className="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="w-full flex-1">
        <div className="mt-2 mb-2 h-6 text-xs font-bold uppercase leading-8 text-gray-500">Address</div>
        <input
          type="text"
          name="address"
          value={state.address}
          onChange={inputHandle}
          className="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
        />
      </div>
      <div className="w-full flex-1">
        <div className="mt-2 mb - 2h-6 text-xs font-bold uppercase leading-8 text-gray-500">Country</div>
        <select
          name="country"
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          value={state.country}
          onChange={inputHandle}
        >
          <option value="Portugal">Portugal</option>
          <option value="Spain">Spain</option>
          <option value="France">France</option>
        </select>
      </div>
    </div>
  );
};

export default PersonalDetails;
