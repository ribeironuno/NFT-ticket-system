import { FaPhoneAlt, FaMailBulk, FaUsers } from "react-icons/fa";

const Details = ({ event, atualDate, alreadyHappened}) => {
  return (
    <div className="p-2 pt-6">
      <div className="px-3">
        <ol className="relative mb-3 border-l border-gray-200 dark:border-gray-700">
          {/* Event acctualy occured */}
          {event.status === "Minted" && alreadyHappened && (
            <li className="mb-10 ml-6">
              <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 ring-8 ring-white dark:bg-blue-900 dark:ring-gray-900">
                <svg aria-hidden="true" className="h-3 w-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </span>
              <h3 className="mb-1 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                Event occured<span className="mr-2 ml-3 rounded bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:bg-blue-200 dark:text-blue-800">Latest</span>
              </h3>
              <time className="mb-2 block text-sm font-normal leading-none text-gray-400 dark:text-gray-500">On {event.datesInfo.startDate.dayMonthYear.replaceAll("-","/")} {event.datesInfo.startDate.startTime.replace("h", ":")}</time>
              <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">The event occured was planned.</p>
            </li>
          )}
          {/* Canceled process */}
          {event.statusDates.canceled && (
            <li className="mb-10 ml-6">
              <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 ring-8 ring-white dark:bg-blue-900 dark:ring-gray-900">
                <svg aria-hidden="true" className="h-3 w-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </span>
              <h3 className="mb-1 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                Event were canceled<span className="mr-2 ml-3 rounded bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:bg-blue-200 dark:text-blue-800">Latest</span>
              </h3>
              <time className="mb-2 block text-sm font-normal leading-none text-gray-400 dark:text-gray-500">On {event.statusDates.canceled.substring(0, 16)}</time>
              <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">The event was canceled by your demand.</p>
            </li>
          )}
          {/* Minted process */}
          {event.statusDates.minted && (
            <li className="mb-10 ml-6">
              <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 ring-8 ring-white dark:bg-blue-900 dark:ring-gray-900">
                <svg aria-hidden="true" className="h-3 w-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </span>
              <h3 className="mb-1 inline-block text-lg font-semibold text-gray-900 dark:text-white">Tickets minted</h3>{" "}
              {!event.statusDates.canceled && atualDate < event.date && (
                <span className="mr-2 ml-3 rounded bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:bg-blue-200 dark:text-blue-800">Latest</span>
              )}
              <time className="mb-2 block text-sm font-normal leading-none text-gray-400 dark:text-gray-500">On {event.statusDates.minted.substring(0, 16)}</time>
              <p className="text-base font-normal text-gray-500 dark:text-gray-400">NFT's tickets were minted and available to be bought.</p>
            </li>
          )}
          {/* Creation of event */}
          <li className="ml-6">
            <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 ring-8 ring-white dark:bg-blue-900 dark:ring-gray-900">
              <svg aria-hidden="true" className="h-3 w-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </span>
            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Event created</h3>
            <time className="mb-2 block text-sm font-normal leading-none text-gray-400 dark:text-gray-500">On {event.statusDates.created.substring(0, 16)}</time>
            <p className="text-base font-normal text-gray-500 dark:text-gray-400">Event was created and ready to be minted.</p>
          </li>
        </ol>
      </div>

      <div className="md:grid-rows-1lg:grid-cols-4 grid gap-2 sm:grid-cols-2 sm:grid-rows-2 md:grid-cols-3 lg:grid-rows-2 xl:grid-cols-6 xl:grid-rows-1">
        <div className="mb-4 shrink-0 grow-0 basis-auto p-6 lg:col-span-2 lg:row-span-2 xl:col-span-2 xl:row-span-1">
          <div className="flex items-start">
            <div className="shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-blue-600 p-4 shadow-md">
                <FaPhoneAlt size={40} />
              </div>
            </div>
            <div className="ml-6 grow">
              <p className="mb-1 font-bold text-gray-700 dark:text-gray-400">My contacts</p>
              {event.contacts.map((contact, key) => (
                <p className="text-gray-500" key={key}>
                  {contact}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-4 w-full shrink-0 grow-0 basis-auto p-6 lg:col-span-2 lg:row-span-2 xl:col-span-2 xl:row-span-1">
          <div className="flex items-start">
            <div className="shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-blue-600 p-4 shadow-md">
                <FaMailBulk size={40} />
              </div>
            </div>
            <div className="ml-6 grow">
              <p className="mb-1 font-bold text-gray-700 dark:text-gray-400">My emails</p>
              {event.emails.map((email, key) => (
                <p className="text-gray-500" key={key}>
                  {email}
                </p>
              ))}
            </div>
          </div>
        </div>
        {event.validation.validationType !== "hash" && (
          <div className="mb-4 w-full shrink-0 grow-0 basis-auto p-6 lg:col-span-2 lg:row-span-2 xl:col-span-2 xl:row-span-1">
            <div className="align-start flex">
              <div className="shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-blue-600 p-4 shadow-md">
                  <FaUsers size={40} />
                </div>
              </div>
              <div className="ml-6 grow">
                <p className="mb-1 font-bold text-gray-700 dark:text-gray-400">Validators group</p>
                {event.validation.validators.map((group) => (
                  <p className="text-gray-500">{group.validatorsGroupName}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Details;
