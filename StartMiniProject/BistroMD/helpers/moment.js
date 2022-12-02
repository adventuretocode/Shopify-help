import moment from "moment";

export const formatDate = (date) => {
  return moment(date, "MM-DD-YYYY").format("YYYY-MM-DD");
}

export const isBefore = (startDate, migrationDate,format) => {
  const startD = moment(startDate, format);
	const migrationD = moment(migrationDate, format);
  return moment(startD).isBefore(migrationD);
};

export const getNextDayOfWeek = (startDate, dayOfWeek) => {
  let cutOverDay = moment(startDate, "MM-DD-YYYY");
  let nextDayOfWeek = moment(startDate, "MM-DD-YYYY").day(
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

const addBusinessDays = (originalDate, numDaysToAdd) => {
  const date = moment(originalDate, "YYYY-MM-DD");

  const Sunday = 0;
  const Saturday = 6;
  let daysRemaining = numDaysToAdd;

  const newDate = date.clone();

  while (daysRemaining > 0) {
    newDate.add(1, "days");
    if (newDate.day() !== Sunday && newDate.day() !== Saturday) {
      daysRemaining--;
    }
  }

  const formattedDate = moment(newDate).format("YYYY-MM-DD");
  return formattedDate;
};

export const processingDates = (nextChargeDate, shipZoneDay = 1) => {
  const warehouse_date = nextChargeDate;
  const date = moment(nextChargeDate, "YYYY-MM-DD");
  const cut_off_date = date.subtract(1, "day");
  const ship_date = addBusinessDays(warehouse_date, 1);
  const arrival_date = addBusinessDays(ship_date, shipZoneDay);
  return {
    cut_off_date,
    ship_date,
    arrival_date,
  };
};
