import moment from "moment";

const getNextDayOfWeek = (startDate, dayOfWeek) => {
  let cutOverDay = moment(moment(startDate).format("YYYY-MM-DD"));
  let nextDayOfWeek = moment(moment(startDate).format("YYYY-MM-DD")).day(
    dayOfWeek
  );

  if (nextDayOfWeek < cutOverDay || nextDayOfWeek.day() === cutOverDay.day()) {
    nextDayOfWeek.add(7, "day");
  }

  nextDayOfWeek.day(dayOfWeek);
  return nextDayOfWeek.format("YYYY-MM-DD");
};

// console.log(getNextDayOfWeek("2022-10-01", "Monday"));

export default {
  getNextDayOfWeek,
};