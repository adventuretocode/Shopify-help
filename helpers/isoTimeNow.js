/**
 * ISO 8601 but not UTC time but in current time zone.
 *
 */

const isoTimeNow = function() {
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

  const myTime = function() {
    return (
      localTime.getFullYear() +
      "-" +
      pad(localTime.getMonth() + 1) +
      "-" +
      pad(localTime.getDate()) +
      "T" +
      pad(localTime.getHours()) +
      ":" +
      pad(localTime.getMinutes()) +
      ":" +
      pad(localTime.getSeconds()) +
      shopifyFormatedTimeZone
    );
  };

  return myTime();
};

module.exports = isoTimeNow;
