import { ScrollToTopButton } from "../../../layout";
import constants from "../../../configs/constants";

/* GET ABBREVIATION FROM EVENT DATA */
function toMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1);

  return date.toLocaleString("en-US", {
    month: "short",
  });
}

const ItemList = (props) => {
  let events = props.values;
  let menu = props.status;

  return events.map((event, key) => {
    return (
      (event.status === menu || menu === "all") && (
        <div className="space-y-10" key={key}>
          <div key={"div" + event.eventId} className="space-y-10">
            <a href={`${constants.SERVER_URL}/app/organizer/event?eventId=${event.eventId}`}>
              <div
                id="ticketBanner"
                className={`flex min-h-fit w-full animate-fade-in-down flex-col 
                                rounded-md bg-cover bg-center p-0 text-left text-white duration-300 ease-in-out hover:scale-[1.01] hover:cursor-pointer sm:p-2 md:flex-row lg:p-5`}
                style={{ backgroundImage: `url(${constants.SERVER_URL + "/" + event.banner.replace(/\\/g, '/')})` }}
              >
                <div className="m-0 flex h-full flex-row space-x-10 rounded-md bg-black bg-opacity-70 p-5 align-middle sm:m-1 md:w-full lg:w-1/2">
                  <div className="b-0 grid min-h-fit w-1/5 content-center rounded-md bg-gray-500 bg-opacity-80 p-2 font-bold xl:text-center">
                    <p className="text-3xl text-black">
                      {toMonthName(event.datesInfo.startDate.dayMonthYear.split("-")[1])}
                    </p>
                    <p className="text-3xl text-black lg:text-5xl">
                      {event.datesInfo.startDate.dayMonthYear.split("-")[0]}
                    </p>
                  </div>

                  <div className="h-full w-4/5 space-y-5 p-5 font-bold">
                    <p className="text-center text-2xl text-white sm:text-left sm:text-4xl">
                      {event.eventName}
                    </p>
                    <p className="text-center text-xl text-white sm:text-left">
                      {event.location}
                    </p>
                  </div>
                </div>

                <div className="b-0 m-1 grid w-full content-center space-x-10 p-5 text-center md:w-1/2 md:text-right">
                  <p className="font-bold md:text-lg lg:text-2xl">
                    {event.category}
                  </p>
                </div>
              </div>
            </a>
            <ScrollToTopButton />
          </div>
        </div>
      )
    );
  });
};

export default ItemList;
