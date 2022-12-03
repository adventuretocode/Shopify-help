import dotenv from "dotenv";
import moment from "moment";
import say from "say";
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

    let warehouseDay = minusBusinessDays(dateOfWeek, 1);
    if(shipping_day.toLowerCase() === "monday") {
      warehouseDay = addBusinessDays(warehouseDay, 5);
    }
   
    return {
      scheduled_at_skips: warehouseDay,
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

  scheduleAtSkips = scheduleAtSkips.map((s) => s.scheduled_at_skips);
  return scheduleAtSkips;
};

const retrieveReChargeQueueDescByDate = async (charges) => {
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
  return charges;
};

const addSkips = async (
  skipsToAdd,
  address_id,
  subscriptionId,
  re_customer_id,
  charges
) => {
  if (!skipsToAdd.length) return;

  const [queuedCharge] = charges.filter((c) => c.status === "queued");

  for (let i = 0; i < skipsToAdd.length; i++) {
    const skipToAdd = skipsToAdd[i];
    try {
      if (queuedCharge.scheduled_at == skipToAdd) {
        // Use address skip
        const result = await Recharge.Charges.skip(queuedCharge.id, [
          subscriptionId,
        ]);
        // console.log(JSON.stringify(result));
      } else {
        // use charge skips
        const result = await Recharge.Addresses.skip_future_charge(
          address_id,
          skipToAdd,
          [subscriptionId]
        );
        // console.log(JSON.stringify(result));
      }
    } catch (error) {
      const errMsg = JSON.stringify(error?.response?.data?.errors);
      console.log(errMsg);
      if (errMsg.includes("must be within the charge interval schedule")) {
        continue;
      } else {
        throw error;
      }
    }
  }

  return "Success";
};

const removeSkips = async (skipsToRemove, subscriptionId, charges) => {
  if (!skipsToRemove.length) return;

  for (let i = 0; i < skipsToRemove.length; i++) {
    try {
      const skipToRemove = skipsToRemove[i];
      const [charge] = charges.filter((c) => c.scheduled_at == skipToRemove);
      const result = await Recharge.Charges.unskip(charge.id, [subscriptionId]);
      console.log(JSON.stringify(result));
    } catch (error) {
      console.log(JSON.stringify(error?.response?.data?.errors));
      throw error;
    }
  }

  return "Success";
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
      subscription_id,
    } = rechargeSubObj;

    const queryHolds = `leg_customer_id = ${leg_customer_id}`;
    const skipResults = await ORM.findOne("prod_hold_skips-remoedup", queryHolds);
    const customerSkips = await retrieveDescCustomerSkips(
      skipResults,
      shipping_day
    );
    console.log(customerSkips);

    let { charges } = await Recharge.Charges.list(re_customer_id);
    if(!charges) return;

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

    await addSkips(
      skipsToAdd,
      address_id,
      subscription_id,
      re_customer_id,
      charges
    );
    await removeSkips(skipsToRemove, subscription_id, charges);

    return "async";
  } catch (error) {
    throw error;
  }
};

const main = async () => {
  console.time();
  while (true) {
    try {
      let queryHold = `WHERE processed = false LIMIT 1`;
      const [simpleRecord] = await ORM.find(
        "customer_active_skip_monday",
        queryHold
      );
      if (!simpleRecord) return "Completed";

      let queryLegacy = `customer_id = ${simpleRecord.leg_customer_id}`;
      const [legacyCustomer] = await ORM.findOne(
        "prod_bistro_recharge_migration",
        queryLegacy
      );

      if(!legacyCustomer) {
        await ORM.updateOne(
          "customer_active_skip_monday",
          "processed",
          true,
          `leg_customer_id = ${simpleRecord.leg_customer_id}`
        );
        continue;
      }

      delete legacyCustomer.customer_id;

      let queryReSub = `customer_email = '${legacyCustomer.shipping_email}'`;
      const [rechargeSubObj] = await ORM.findOne(
        "Recharge_subscriptions",
        queryReSub
      );

      if(!rechargeSubObj) {
        await ORM.updateOne(
          "customer_active_skip_monday",
          "processed",
          true,
          `leg_customer_id = ${simpleRecord.leg_customer_id}`
        );
        continue;
      }

      const customerObj = Object.assign(
        simpleRecord,
        legacyCustomer,
        rechargeSubObj
      );

      console.log(
        `=============================================================`
      );
      console.log(
        `legacy Id: ${simpleRecord.leg_customer_id} - ${simpleRecord.customer_email}`
      );
      console.log(`Recharge Id: ${customerObj.customer_id}`);

      await processData(customerObj);

      await ORM.updateOne(
        "customer_active_skip_monday",
        "processed",
        true,
        `leg_customer_id = ${simpleRecord.leg_customer_id}`
      );

      console.log(
        `\u001b[38;5;${simpleRecord.leg_customer_id % 255}m${
          legacyCustomer.shipping_email
        }\u001b[0m`
      );
      console.log(
        `=============================================================`
      );
    } catch (error) {
      say.speak("BistroMD has exited with errors " + error.message);
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
