import dotenv from "dotenv";
import Recharge from "./ReCharge/Recharge.js";
import ORM from "./db/orm.js";

dotenv.config();

const DATABASE = "shipping_orders";
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

const processChargeWithShopifyOrderId = async (data, shopify_order_id) => {
  try {
    const { charges } = await Recharge.Charges.retrieveByShopifyOrderId(
      shopify_order_id
    );

    if (charges.length != 1) {
      if (charges.length === 0) {
        await hasFailed(data, "No Charge found for Shopify Order Id");
      } else if (charges.length > 1) {
        await hasFailed(data, "More than 1 Charge");
      }
      return data;
    }

    const [charge] = charges;
    const { id: charge_id, transaction_id } = charge;
    let { status } = charge;
    status = charge.status.toLowerCase();

    await ORM.updateOne(
      TABLE_NAME,
      "transaction_id",
      transaction_id,
      `${PRIMARY_KEY} = '${data[`${PRIMARY_KEY}`]}'`
    );

    if (status === "success") {
      await updateFlag(data, "charge_already_success");
      return data;
    }

    if (status !== "pending") {
      await hasFailed(data, "No Pending Charge Found");
      return data;
    }

    // Capture
    const result = await Recharge.Charges.capturePayment(charge_id);
    console.log(result);

    return "complete";
  } catch (error) {
    throw error;
  }
};

const processAllPendingCharges = async (data, rechargeCustomer) => {
  try {
    const { id: re_customer_id } = rechargeCustomer;
    const { charges } = await Recharge.Charges.listByStatus(
      re_customer_id,
      "PENDING"
    );

    for (let i = 0; i < charges.length; i++) {
      const charge = charges[i];
      const { id: charge_id } = charge;

      await ORM.updateByConcat(
        TABLE_NAME,
        "transaction_id",
        `,${transaction_id}`,
        `${PRIMARY_KEY} = '${data[`${PRIMARY_KEY}`]}'`
      );

      try {
        const result = await Recharge.Charges.capturePayment(charge_id);
        console.log(result);
      } catch (error) {
        const errMsg = error?.response?.data.errors;
        console.log(errMsg);
        debugger;
        await hasFailed(data, JSON.stringify(errMsg));
      }
    }
    return "complete";
  } catch (error) {
    throw error;
  }
};

const processRowData = async (data) => {
  try {
    console.log(data);
    const { email, shopify_order_id } = data;
    const [rechargeCustomer] = await Recharge.Customers.findByEmail(email);

    if (!rechargeCustomer) {
      debugger;
      throw new Error("No Customer Found");
    }

    if (shopify_order_id) {
      await processChargeWithShopifyOrderId(data, shopify_order_id);
      return data;
    } else {
      // No shopify order id, charging them all
      await processAllPendingCharges(data, rechargeCustomer);
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
        : `${PROCESSING_BOOLEAN} = false LIMIT 1`;
      const [record_1, record_2, record_3] = await ORM.findOne(DATABASE, query);

      if (!record_1 && !record_2 && !record_3) return "Completed Many";

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
          DATABASE,
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
  return "Completed One";
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
