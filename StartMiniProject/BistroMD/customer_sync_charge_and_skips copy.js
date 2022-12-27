import dotenv from "dotenv";
import Recharge from "./ReCharge/Recharge.js";
import ORM from "./db/orm.js";

dotenv.config();

const TABLE_NAME = "customer_skips";
const PRIMARY_KEY = "email";
const PROCESSING_BOOLEAN = "processed";

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

    let originalSkippedCharges = [];

    if (data.skips) {
      const { charges } = await Recharge.Charges.listByStatus(
        re_customer_id,
        "skipped"
      );
      originalSkippedCharges = charges;
    }

    const [subscription] = subscriptions;
    const {
      next_charge_scheduled_at,
      id: subscription_id,
      address_id,
    } = subscription;
    let isNeedSkipsAdded = false;

    // Check to see if the next charge date is next week
    // If its not this week then the lowest week array is it.
    const isNextChargeDateNextWeek = ["2022-12-21", "2022-12-22", "2022-12-23", "2022-12-26", ""]

    // Next charge date
    if (next_charge_scheduled_at !== data.next_charge_date && !data.skips) {
      await Recharge.Subscriptions.set_next_charge_date(
        subscription_id,
        data.next_charge_date
      );

      await updateFlag(data, "mismatch_charge_date", true);
      isNeedSkipsAdded = true;
    }

    const originalSkipChargeDates =
      Recharge.Helpers.retrieveReChargeQueueDescByDate(originalSkippedCharges);

    const { charges } = await Recharge.Charges.listByStatus(
      re_customer_id,
      "skipped"
    );
    const newSkipChargeDates =
      Recharge.Helpers.retrieveReChargeQueueDescByDate(charges);
    const menuAdminSkipChargeDates = data.skips.length
      ? data.skips.split("|")
      : [];

    if (
      JSON.stringify(originalSkipChargeDates) !==
      JSON.stringify(menuAdminSkipChargeDates)
    ) {
      await updateFlag(data, "mismatch_skips", true);
      isNeedSkipsAdded = true;
    }

    if (
      JSON.stringify(newSkipChargeDates) !==
      JSON.stringify(menuAdminSkipChargeDates)
    ) {
      isNeedSkipsAdded = true;
    }

    if (!isNeedSkipsAdded) return data;

    const matchedSkips = menuAdminSkipChargeDates.filter((schedule_date) =>
      newSkipChargeDates.includes(schedule_date)
    );
    const skipsToAdd = menuAdminSkipChargeDates.filter(
      (schedule_date) => !newSkipChargeDates.includes(schedule_date)
    );
    const skipsToRemove = newSkipChargeDates.filter(
      (schedule_date) => !menuAdminSkipChargeDates.includes(schedule_date)
    );

    console.log({ matchedSkips, skipsToAdd, skipsToRemove });
    if (!skipsToAdd.length && !skipsToRemove.length) {
      debugger;
      return "Nothing to do";
    }

    await Recharge.Charges.addSkips(
      menuAdminSkipChargeDates,
      address_id,
      subscription_id,
      charges
    );

    await Recharge.Charges.removeSkips(skipsToRemove, subscription_id, charges);

    return data;
  } catch (error) {
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
        : `${PROCESSING_BOOLEAN} = false LIMIT 1`;
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