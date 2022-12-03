import dotenv from "dotenv";
import moment from "moment";
import Recharge from "./ReCharge/Recharge.js";
import ORM from "./db/orm.js";
import {
  skipsGetDateOfWeek,
  formatDate,
  minusBusinessDays,
} from "./helpers/moment.js";

dotenv.config();

const retrieveDescCustomerSkips = async (customerSkips, shipping_day) => {
  let scheduleAtSkips = customerSkips.map((row) => {
    const dateOfWeek = skipsGetDateOfWeek(
      row.start_hold_date,
      "MM/DD/YYYY",
      shipping_day
    );

    const warehouseDay = minusBusinessDays(dateOfWeek, 1);
    return {
      schedule_at_skips: warehouseDay,
      momentDate: moment(warehouseDay),
    };
  });

  scheduleAtSkips = scheduleAtSkips.sort((a, b) => {
    if (moment(a.momentDate).isBefore(b.momentDate)) {
      return 1;
    }
    if (moment(b.momentDate).isBefore(a.momentDate)) {
      return -1;
    }
  });

  scheduleAtSkips = scheduleAtSkips.map((s) => s.schedule_at_skips);
  return scheduleAtSkips;
};

const retrieveReChargeQueueDescByDate = async (charges) => {
  charges = charges.filter((charge) => {
    return charge.status === "skipped";
  });
  charges = charges.map((charge) => {
    return {
      id: charge.id,
      schedule_at: charge.scheduled_at,
      momentDate: moment(charge.schedule_at, "YYYY-MM-DD"),
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

  charges = charges.map((c) => c.schedule_at);
  return charges;
};

const processData = async (rechargeSubObj) => {
  try {
    // get charges
    const {
      customer_id: re_customer_id,
      customer_email,
      leg_customer_id,
      shipping_day,
      address_id,
    } = rechargeSubObj;

    const queryHolds = `leg_customer_id = ${leg_customer_id}`;
    const skipResults = await ORM.findOne("prod_hold_skips", queryHolds);
    const customerSkips = await retrieveDescCustomerSkips(
      skipResults,
      shipping_day
    );
    console.log(customerSkips);

    let { charges } = await Recharge.Charges.list(re_customer_id);
    const reChargeCharges = await retrieveReChargeQueueDescByDate(charges);
    console.log(reChargeCharges);

    const matchedSkips = customerSkips.filter((schedule_date) =>
      reChargeCharges.includes(schedule_date)
    );
    const skipsToAdd = customerSkips.filter(
      (schedule_date) => !reChargeCharges.includes(schedule_date)
    );
    const skipsToRemove = reChargeCharges.filter(
      (schedule_date) => !customerSkips.includes(schedule_date)
    );

    console.log({ matchedSkips, skipsToAdd, skipsToRemove });
    if (!skipsToAdd.length && !skipsToRemove.length) {
      return "Nothing to do";
    }

    // customerSkips (sort by date) Latest
    // charges       (sort by date) Latest

    // match (do nothing)
    // missing (skip)
    // extra (unskip)
    

    return "async";
  } catch (error) {
    throw error;
  }
};

const main = async () => {
  console.time();
  while (true) {
    try {
      let queryHold = `processed = false LIMIT 1`;
      const [simpleRecord] = await ORM.findOne(
        "prod_holds_customers",
        queryHold
      );
      if (!simpleRecord) return "Completed";

      let queryLegacy = `customer_id = ${simpleRecord.leg_customer_id}`;
      const [legacyCustomer] = await ORM.findOne(
        "prod_bistro_recharge_migration",
        queryLegacy
      );
      delete legacyCustomer.customer_id;

      let queryReSub = `customer_email = '${legacyCustomer.shipping_email}'`;
      const [rechargeSubObj] = await ORM.findOne(
        "Recharge_subscriptions",
        queryReSub
      );

      const customerObj = Object.assign(
        simpleRecord,
        legacyCustomer,
        rechargeSubObj
      );

      await processData(customerObj);

      await ORM.updateOne(
        "prod_holds_customers",
        "processed",
        true,
        `leg_customer_id = ${simpleRecord.leg_customer_id}`
      );

      console.log(
        `\u001b[38;5;${simpleRecord.leg_customer_id % 255}m${
          legacyCustomer.shipping_email
        }\u001b[0m`
      );
    } catch (error) {
      console.log("Error: ", error);
      throw error;
    }
  }
};

main()
  .then((success) => {
    console.log("==========================================");
    console.log(success);
    console.log("==========================================");
    console.timeEnd();
    console.log("==========================================");
    process.exit();
  })
  .catch((err) => {
    console.log("==========================================");
    console.log(err);
    console.log("==========================================");
    console.timeEnd();
    console.log("==========================================");
    process.exit();
  });
