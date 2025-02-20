import { ConnectWalletButton } from "../..";

const AccountInformation = ({ state, inputHandle }) => {
  return (
    <>
      <div className="w-full flex-1">
        <div className="mt-3  mb-3 h-6 text-xs font-bold uppercase leading-8 text-gray-500">You represent a</div>
        <ul className="grid grid-cols-2 content-center gap-4">
          <li>
            {state.type === "Company" && <input className="peer sr-only" type="radio" value="Personal" name="type" onChange={inputHandle} id="Personal" />}
            {state.type === "Personal" && <input className="peer sr-only" type="radio" value="Personal" name="type" onChange={inputHandle} checked="checked" id="Personal" />}
            <label
              className="flex cursor-pointer rounded-lg border border-gray-300 bg-white p-2 focus:outline-none peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-gray-800 hover:bg-gray-50"
              htmlFor="Personal"
            >
              Personal
            </label>
          </li>
          <li>
            {state.type === "Personal" && <input className="peer sr-only" type="radio" value="Company" name="type" onChange={inputHandle} id="Company" />}

            {state.type === "Company" && <input className="peer sr-only" type="radio" value="Company" name="type" onChange={inputHandle} checked="checked" id="Company" />}
            <label
              className="flex cursor-pointer rounded-lg border border-gray-300 bg-white p-2 focus:outline-none peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-gray-800 hover:bg-gray-50"
              htmlFor="Company"
            >
              Company
            </label>
          </li>
        </ul>
      </div>

      <div className="w-full flex-1">
        <div className="mt-3 mb-2 h-6 text-xs font-bold uppercase leading-8 text-gray-500">Wallet address</div>
        <ConnectWalletButton inputHandle={inputHandle} walletAddress={state.walletAddress} />
      </div>
      <div className="w-full flex-1">
        <div className="mt-1 mb-2 h-6 text-xs font-bold uppercase leading-8 text-gray-500">Email</div>
        <input
          type="email"
          value={state.email}
          onChange={inputHandle}
          name="email"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="w-full flex-1">
        <div className="mt-3 mb-2 h-6 text-xs font-bold uppercase leading-8 text-gray-500">Password</div>
        <input
          type="password"
          value={state.password}
          onChange={inputHandle}
          name="password"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
    </>
  );
};

export default AccountInformation;
