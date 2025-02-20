const SeatedSeats = ({ sections, eventStatus }) => {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="inline-block w-full align-middle sm:p-1.5">
          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                    Row
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                    Total tickets
                  </th>
                  {eventStatus !== "notMinted" && (
                    <th scope="col" className="px-3 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                      Available tickets
                    </th>
                  )}
                  <th scope="col" className="px-3 py-3 text-left text-xs font-bold uppercase text-gray-500 ">
                    Price for each
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sections.subSections.map((section, key) => (
                  <tr className="dark:bg-gray-800" key={key}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-black dark:text-white">{section.row}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-black dark:text-white">{section.numTickets}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-black dark:text-white">{section.availableTickets.length}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-black dark:text-white">{section.numTickets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatedSeats;