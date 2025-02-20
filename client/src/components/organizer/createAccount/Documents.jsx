const Documents = ({ state, inputHandle }) => {
  return (
    <div className="mb-16">
      <div className="mx-2 mb-4 flex rounded-lg bg-blue-100 p-4 text-sm text-blue-700" role="alert">
        <svg aria-hidden="true" className="mr-3 inline h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"></path>
        </svg>
        <span className="sr-only">Info</span>
        <div>
          <span className="font-medium">Ensure that these requirements are met:</span>
          <ul className="mt-1.5 ml-4 list-inside list-disc text-blue-700">
            <li>The document is visible and valid</li>
            <li>The previous data match the document data</li>
          </ul>
        </div>
      </div>
      <div className="mx-2 w-full flex-1">
        <div className="text-md mt-2 mb-2 h-6 font-bold uppercase leading-8 text-gray-500">Address Proof</div>
          <input
            type="file"
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:py-1 file:px-4 file:text-sm file:font-semibold"
            value={state.addressProofUrl}
            onChange={inputHandle}
            name="addressProof"
          />
      </div>
      <div className="mx-2 w-full flex-1">
        <div className="text-md mt-2 mb-2 h-6 font-bold uppercase leading-8 text-gray-500">NIF Proof</div>
        <input
            type="file"
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:py-1 file:px-4 file:text-sm file:font-semibold"
            value={state.nifProofUrl}
            onChange={inputHandle}
            name="nifProof"
          />
      </div>
    </div>
  );
};

export default Documents;
