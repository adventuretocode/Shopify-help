import moment from "moment";

export const isBefore = (startDate) => {
  const startD = moment(startDate, "MM/DD/YYYY");
  return moment(startD).isBefore();
};

export const getNextDayOfWeek = (startDate, dayOfWeek) => {
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

export const getDayOfTheWeek = (date) => {
  const d = moment(moment(date, "YYYY-MM-DD"));
  const day = moment.weekdays(d.day());
  return day;
};

export const getAmountOfDaysPassed = (startDate, endDate) => {
  const dateOne = moment(startDate, "MM/DD/YYYY");
  const dateTwo = moment(endDate, "MM/DD/YYYY");
  const days = moment(dateTwo).diff(moment(dateOne), "days");
  return days;
};
