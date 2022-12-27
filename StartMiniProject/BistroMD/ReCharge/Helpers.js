import moment from "moment";

const retrieveReChargeQueueDescByDate = (charges) => {
  charges = charges.filter((charge) => {
    return charge.status === "skipped";
  });
  charges = charges.map((charge) => {
    return {
      id: charge.id,
      scheduled_at: charge.scheduled_at,
      momentDate: moment(charge.scheduled_at, "YYYY-MM-DD"),
    };
  });

  charges = charges.sort((a, b) => {
    if (moment(a.momentDate).isBefore(b.momentDate)) {
      return 1;
    }
    if (moment(b.momentDate).isBefore(a.momentDate)) {
      return -1;
    }
  });

  charges = charges.map((c) => c.scheduled_at);
  // Drop anything before today;
  charges = charges.filter((c) => moment(c, "YYYY-MM-DD") >= moment());
  return charges;
};

const Helpers = {
  retrieveReChargeQueueDescByDate,
};

export default Helpers;
