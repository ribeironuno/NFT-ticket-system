import { useState, useEffect } from "react";
import moment from "moment/moment";

const Timer = (event) => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  let eventData = event.event;
  let deadline;

  var startDateTime = eventData.datesInfo.startDate.dayMonthYear + " " + eventData.datesInfo.startDate.startTime.replace("h", ":") + ":00";
  const currentDate = moment();
  const formattedDate = currentDate.format("DD-MM-YYYY HH:mm:ss");
  var current = moment(formattedDate, "DD-MM-YYYY HH:mm:ss");
  var startDateTotal = moment(startDateTime, "DD-MM-YYYY HH:mm:ss");
  var creationDateTotal = moment(eventData.statusDates.created, "DD-MM-YYYY HH:mm:ss");

  var duration = moment.duration(creationDateTotal.diff(startDateTotal));

  //check if the event was created 2 days before start event date
  if (duration.asDays() >= -2) {
    //if true than the deadline is 2h until the start of event
    deadline = moment(startDateTotal, "DD-MM-YYYY HH:mm:ss").subtract(2, "hours");
    if (deadline.isBefore(current)) {
      deadline = null;
    }
  } else {
    deadline = moment(eventData.statusDates.created, "DD-MM-YYYY HH:mm:ss").add(48, "hours");
    if (deadline.isBefore(current)) {
      deadline = null;
    }
  }

  const getTime = () => {
    const time = Date.parse(deadline) - Date.now();
    setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((time / 1000 / 60) % 60));
    setSeconds(Math.floor((time / 1000) % 60));
  };

  useEffect(() => {
    const interval = setInterval(() => getTime(deadline), 1000);

    return () => clearInterval(interval);
  });

  return (
    <>
      {deadline && (
        <div className=" mb-4 flex scale-75 items-center justify-center sm:scale-100" x-data="beer()" x-init="start()">
          <div className="text-black dark:text-white">
            <h1 className="mb-3 text-center text-2xl font-extralight">Time to mint</h1>
            <div className="flex w-full items-center justify-center text-center text-3xl">
              <div className="w-24 rounded-lg border-2 border-black bg-white p-2 text-black sm:mx-1">
                <div className="font-mono leading-none" x-text="days">
                  {days < 10 ? "0" + days : days}
                </div>
                <div className="font-mono text-sm uppercase leading-none">Days</div>
              </div>
              <div className="w-24 rounded-lg border-2 border-black bg-white p-2 text-black sm:mx-1">
                <div className="font-mono leading-none" x-text="hours">
                  {hours < 10 ? "0" + hours : hours}
                </div>
                <div className="font-mono text-sm uppercase leading-none">Hours</div>
              </div>
              <div className="w-24 rounded-lg border-2 border-black bg-white p-2 text-black sm:mx-1">
                <div className="font-mono leading-none" x-text="minutes">
                  {minutes < 10 ? "0" + minutes : minutes}
                </div>
                <div className="font-mono text-sm uppercase leading-none">Minutes</div>
              </div>
              <div className="w-24 rounded-lg border-2 border-black bg-white p-2 text-black sm:mx-1">
                <div className="font-mono leading-none" x-text="seconds">
                  {seconds < 10 ? "0" + seconds : seconds}
                </div>
                <div className="font-mono text-sm uppercase leading-none">Seconds</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Timer;
