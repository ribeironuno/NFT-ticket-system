/* GET ABBREVIATION FROM EVENT DATA */
export function toMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1);

  return date.toLocaleString("en-US", {
    month: "short",
  });
}

/**
 * Returns a string date in format: DD/MM/YYYY
 */
export function getActualDate_DayMonthYear() {
  const date = new Date();
  var day = date.getDate();
  if (Number(day) < 10) {
    day = "0" + day;
  }
  const strDate = day + "/" + (parseInt(date.getMonth()) + 1).toString() + "/" + date.getFullYear();
  return strDate;
}

/**
 * Returns a string date in format: DD-MM-YYYY
 */
export function getActualDate_DayMonthYearHifenFomart() {
  const date = new Date();
  var day = date.getDate();
  var month = date.getMonth();
  if (Number(day) < 10) {
    day = "0" + day;
  }
  if (Number(month + 1) < 10) {
    month = "0" + (month + 1);
  }
  const strDate = day + "-" + month + "-" + date.getFullYear();
  return strDate;
}

/**
 * Compares two STRING dates in the format : DD/MM/YYYY
 *
 * @returns     -1 : date1 is higher |
 *              0 : equal |
 *              1 : date2 is higher |
 *              2 : error
 *
 */
export function compareDates(date1, date2) {
  try {
    let date1Split = date1.split("/");
    let date2Split = date2.split("/");

    //pass to ISO string
    let ISOStringDate1 = Number(date1Split[2]) + "-" + Number(date1Split[1]) + "-" + Number(date1Split[0]);

    let ISOStringDate2 = Number(date2Split[2]) + "-" + Number(date2Split[1]) + "-" + Number(date2Split[0]);

    //create date object

    let ISODate1 = new Date(ISOStringDate1);
    let ISODate2 = new Date(ISOStringDate2);

    //compare and get return value
    let returnValue = 0;

    if (ISODate1 > ISODate2) {
      returnValue = -1;
    } else if (ISODate1 < ISODate2) {
      returnValue = 1;
    }
    return returnValue;
  } catch (e) {
    return 2;
  }
}
