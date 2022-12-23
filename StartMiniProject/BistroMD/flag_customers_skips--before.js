import dotenv from "dotenv";
import Recharge from "./ReCharge/Recharge.js";
import ORM from "./db/orm.js";

dotenv.config();

const TABLE_NAME = "skips_next_22";
const PRIMARY_KEY = "email";
const PROCESSING_BOOLEAN = "processed";
const SKIPPED_DATE = "2022-12-22";

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
    console.log(data);
    // Get ReCharge ID
    const { email } = data;
    let { recharge_number: re_customer_id } = data;
    let rechargeCustomer;

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
        await updateFlag(data, 'no_active_subscription', true);
      } else if (subscriptions.length > 1) {
        await hasFailed(data, "More than 1 subscription");
      }
      return data;
    }

    const { charges } = await Recharge.Charges.listByStatus(
      re_customer_id,
      "skipped"
    );

    const doesSkipWeekExist = charges.some(charge => charge.scheduled_at === SKIPPED_DATE);

    if(!doesSkipWeekExist) {
      // Does not need to skip
      await updateFlag(data, 'requires_skip', true);
    }



    if (data.failed) {
      await hasFailed(data, "Row data has failed");
      return data;
    }

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
        : `${PROCESSING_BOOLEAN} = false LIMIT 3`;
      const [record_1, record_2, record_3] = await ORM.findOne(TABLE_NAME, query);

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
