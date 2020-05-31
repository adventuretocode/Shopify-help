/**
 * ISO 8601 but not UTC time but in current time zone.
 *
 * @param   {Number} year  Add years to the time
 * @param   {Number} month Add months to time
 * @param   {Number} day   Add days to time
 * @param   {Number} min   Add mins to time
 * @returns {String}       The time in ISO 8601
 */

const isoTimeNow = function(year = 0, month = 0, day = 0, hour = 0, min = 0) {
  const localTime = new Date();
  const timeZone = localTime
    .toString()
    .match(/([-\+][0-9]+)\s/)[1]
    .split("");
  timeZone.splice(-2, 0, ":");

  const shopifyFormatedTimeZone = timeZone.join("");

  function pad(number) {
    if (number < 10) {
      return "0" + number;
    }
    return number;
  }

  function adjustMinute(minutes) {
    if (minutes > 59) {
      hour += 1;
      let leftOverMin = minutes % 59;
      return leftOverMin;
    } else {
      return minutes;
    }
  }

  function adjustHour(hr) {
    if (hr > 23) {
      day += 1;
      const leftOverHour = hr % 23;
      return leftOverHour;
    } else {
      return hr;
    }
  }

  const currentSecond = pad(localTime.getSeconds());
  let currentMinute = pad(adjustMinute(localTime.getMinutes() + min));
  let currentHour = pad(localTime.getHours() + hour);
  let currentDate = pad(localTime.getDate() + day);
  let currentMonth = pad(localTime.getMonth() + 1 + month);
  let currentYear = localTime.getFullYear() + year;

  return `${currentYear}-${currentMonth}-${currentDate}T${currentHour}:${currentMinute}:${currentSecond}${shopifyFormatedTimeZone}`;
};

module.exports = isoTimeNow;

console.log(isoTimeNow(0, 0, 0, 0, 10));

const newYork = new Date().toLocaleString("en-US", {
  timeZone: "America/New_York"
}); // "3/19/2020, 12:24:41 PM"

const newYorkTime = new Date().toLocaleTimeString("en-US", {
  timeZone: "America/New_York"
}); // '12:24:41 PM'

const losAngelsTime = new Date().toLocaleTimeString("en-US", {
  timeZone: "America/Los_Angeles"
}); // '9:36:36 AM'

let date = new Date("2020-05-13T04:10:02Z");

// request a weekday along with a long date
let options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
  timeZone: "America/New_York"
};

console.log(date.toLocaleString("en-US", options)); 
// Wednesday, May 13, 2020, 00:10:02

console.log(date.toLocaleString("en-US", { hour12: false, timeZone: "America/New_York" }));
// 5/13/2020, 00:10:02