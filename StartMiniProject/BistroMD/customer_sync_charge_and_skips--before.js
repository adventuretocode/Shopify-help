import dotenv from "dotenv";
import Recharge from "./ReCharge/Recharge.js";
import ORM from "./db/orm.js";
import { getNextDayOfWeek, isDateSameDayOfWeek } from "./helpers/moment.js";

dotenv.config();

const TABLE_NAME = "skips_next_charge_all";
const PRIMARY_KEY = "email";
const PROCESSING_BOOLEAN = "processed";
const FLAG_MODE = true;
const DRY_RUN = true;
const DEBUG_MODE = true;

const hasFailed = async (data, message) => {
  try {
    const updateObj = {
      message,
      has_failed: true,
    };
    await ORM.updateOneObj(
      TABLE_NAME,
      updateObj,
      `${PRIMARY_KEY} = '${data[`${PRIMARY_KEY}`]}'`
    );
    return "ok";
  } catch (error) {
    throw new Error("Failed to record failed");
  }
};

const updateFlag = async (data, columnName, bool = true) => {
  try {
    await ORM.updateOne(
      TABLE_NAME,
      columnName,
      bool,
      `${PRIMARY_KEY} = '${data[`${PRIMARY_KEY}`]}'`
    );
    return "ok";
  } catch (error) {
    console.log(error);
    throw new Error("Could not update flag");
  }
};

const processRowData = async (data) => {
  try {
    // Get ReCharge ID
    const { email } = data;
    let { recharge_number: re_customer_id } = data;
    let rechargeCustomer;

    if (DEBUG_MODE) {
      console.log(`==============================`);
      console.log(`Email: ${email}`);
      console.log(
        `https://bistro-md-sp.admin.rechargeapps.com/merchant/customers/${re_customer_id}`
      );
      console.log(`==============================`);
    }

    if (!re_customer_id) {
      const { customers } = await Recharge.Customers.findByEmail(email);
      rechargeCustomer = customers[0];
      re_customer_id = rechargeCustomer.id;
    }

    if (!re_customer_id) {
      await hasFailed(data, "Customer not found");
      return data;
    }

    // Get Subscription
    const { subscriptions } = await Recharge.Subscriptions.listByStatus(
      re_customer_id,
      "active"
    );

    if (subscriptions.length != 1) {
      if (subscriptions.length === 0) {
        await hasFailed(data, "No active subscription");
      } else if (subscriptions.length > 1) {
        await hasFailed(data, "More than 1 subscription");
      }
      return data;
    }

    const menuAdminSkipChargeDates = data.skips.length
      ? data.skips.split("|")
      : [];

    const [subscription] = subscriptions;
    const {
      next_charge_scheduled_at,
      id: subscription_id,
      address_id,
    } = subscription;

    let adjustSkipsRequired = false;
    let mismatchChargeDate = false;

    // Checks if if dates are the same day of the week
    const areSkipsSameDayCadence = menuAdminSkipChargeDates.every((date) =>
      isDateSameDayOfWeek(date, data.wday)
    );
    const isWarehouseDaySameDayCadence = isDateSameDayOfWeek(
      data.next_charge_date,
      data.wday
    );

    if(!next_charge_scheduled_at) {
      await updateFlag(data, "re_missing_next_charge_schedule", true);
    }

    if (!areSkipsSameDayCadence || !isWarehouseDaySameDayCadence) {
      await hasFailed(data, `Date are not aligned`);
      return data;
    }

    // Check if warehouse day falls in continuos

    let originalSkippedCharges = [];

    if (data.skips) {
      const { charges } = await Recharge.Charges.listByStatus(
        re_customer_id,
        "skipped"
      );
      originalSkippedCharges = charges;
    }

    // Next charge date
    if (next_charge_scheduled_at !== data.next_charge_date) {
      mismatchChargeDate = true;
      const nextChargeDate = getNextDayOfWeek(
        "2022-12-25",
        data.wday,
        "YYYY-MM-DD"
      );
      if (FLAG_MODE) {
        await updateFlag(data, "charge_date_has_adjusted", true);
        await ORM.updateOne(
          TABLE_NAME,
          `message_flag_mode`,
          `${nextChargeDate}: next Charge date`,
          `${PRIMARY_KEY} = '${data[`${PRIMARY_KEY}`]}'`
        );
      }
      if (!DRY_RUN) {
        await Recharge.Subscriptions.set_next_charge_date(
          subscription_id,
          nextChargeDate
        );
      }
    }

    if (mismatchChargeDate && data.skips.length) {
      adjustSkipsRequired = true;
    }

    const originalSkipChargeDates =
      Recharge.Helpers.retrieveReChargeQueueDescByDate(originalSkippedCharges);

    const { charges } = await Recharge.Charges.listByStatus(
      re_customer_id,
      "skipped"
    );
    const newSkipChargeDates =
      Recharge.Helpers.retrieveReChargeQueueDescByDate(charges);

    if (
      JSON.stringify(originalSkipChargeDates) !==
      JSON.stringify(menuAdminSkipChargeDates)
    ) {
      if (FLAG_MODE) {
        await updateFlag(data, "mismatch_skips", true);
      }
      adjustSkipsRequired = true;
    }

    if (
      JSON.stringify(newSkipChargeDates) !==
      JSON.stringify(menuAdminSkipChargeDates)
    ) {
      adjustSkipsRequired = true;
    }

    if (!adjustSkipsRequired) return data;

    const matchedSkips = menuAdminSkipChargeDates.filter((schedule_date) =>
      newSkipChargeDates.includes(schedule_date)
    );
    const skipsToAdd = menuAdminSkipChargeDates.filter(
      (schedule_date) => !newSkipChargeDates.includes(schedule_date)
    );
    const skipsToRemove = newSkipChargeDates.filter(
      (schedule_date) => !menuAdminSkipChargeDates.includes(schedule_date)
    );

    if (DEBUG_MODE) {
      console.log(`==============================`);
      console.log(`originalSkipChargeDates: ${originalSkipChargeDates}`);
      console.log(`newSkipChargeDates: ${newSkipChargeDates}`);
      console.log(`menuAdminSkipChargeDates: ${menuAdminSkipChargeDates}`);
      console.log(`==============================`);
      console.log(`matchedSkips: ${matchedSkips}`);
      console.log(`skipsToAdd: ${skipsToAdd}`);
      console.log(`skipsToRemove: ${skipsToRemove}`);
      console.log(`==============================`);
    }

    if (!skipsToAdd.length && !skipsToRemove.length) {
      if (DEBUG_MODE && !DRY_RUN) debugger;
      // Nothing to do;
      return data;
    }

    if (FLAG_MODE) {
      await updateFlag(data, "skips_has_adjusted", true);
      await ORM.updateOne(
        TABLE_NAME,
        `message_flag_mode`,
        JSON.stringify({ matchedSkips, skipsToAdd, skipsToRemove }),
        `${PRIMARY_KEY} = '${data[`${PRIMARY_KEY}`]}'`
      );
    }

    if (!DRY_RUN) {
      await Recharge.Charges.addSkips(
        menuAdminSkipChargeDates,
        address_id,
        subscription_id,
        charges
      );

      await Recharge.Charges.removeSkips(
        skipsToRemove,
        subscription_id,
        charges
      );
    }

    return data;
  } catch (error) {
    const respData = error?.response?.data;
    console.log(respData);
    await hasFailed(data, JSON.stringify(respData));
    throw error;
  }
};

const main = async (identifier) => {
  console.time();
  const continuous = !identifier;
  do {
    try {
      let query = identifier
        ? `${PRIMARY_KEY} = '${identifier}'`
        : `${PROCESSING_BOOLEAN} = false LIMIT 3`;
      const [record_1, record_2, record_3] = await ORM.findOne(
        TABLE_NAME,
        query
      );

      if (!record_1 && !record_2 && !record_3) return "Completed";

      const resultArr = [];
      if (record_1) {
        resultArr.push(processRowData(record_1));
      }

      if (record_2) {
        resultArr.push(processRowData(record_2));
      }

      if (record_3) {
        resultArr.push(processRowData(record_3));
      }

      const results = await Promise.all(resultArr);
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        await ORM.updateOne(
          TABLE_NAME,
          PROCESSING_BOOLEAN,
          true,
          `${PRIMARY_KEY} = '${result[`${PRIMARY_KEY}`]}'`
        );
        console.log(`${result[`${PRIMARY_KEY}`]}: Completed`);
      }
    } catch (error) {
      console.log("Error: ", error);
      throw error;
    }
  } while (continuous);
  return "completed successfully";
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
