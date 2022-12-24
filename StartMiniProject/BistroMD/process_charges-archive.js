import dotenv from "dotenv";
import Recharge from "./ReCharge/Recharge.js";
import ORM from "./db/orm.js";

dotenv.config();

const DATABASE = "charging_customers_one";
const PRIMARY_KEY = "email";
const PROCESSING_BOOLEAN = "checked";

const processChargeWithShopifyOrderId = async (
  rechargeCustomer,
  shopify_order_id
) => {
  try {
    const { id: re_customer_id } = rechargeCustomer;
    const charges = await Recharge.Charges.listWithShopifyOrderId(
      re_customer_id,
      shopify_order_id
    );

    if (charges.length != 1) {
      debugger;
      throw new Error("More than 1 charge");
    }

    const charge = charges;
    const { status, processor_name } = charge;
    if (processor_name === "authorize") {
      if (status === "SUCCESS") {
        // Do nothing;
      } else if (status === "PENDING") {
        // Capture Payment;
      }
    } else {
      debugger;
    }
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
      await processChargeWithShopifyOrderId(rechargeCustomer, shopify_order_id);
    }

    // If there is a shopify order look for shopify order

    return data;
  } catch (error) {
    throw error;
  }
};

const processRowDataCheck = async (data) => {
  try {
    const { email, shopify_order_id } = data;
    const { customers } = await Recharge.Customers.findByEmail(email);
    const [rechargeCustomer] = customers;

    if (!rechargeCustomer) {
      debugger;
      throw new Error("No Customer Found");
    }

    if (shopify_order_id) {
      // flags
      let has_already_processed = false,
        needs_capture = false;

      const { id: re_customer_id } = rechargeCustomer;
      const { charges } = await Recharge.Charges.listWithShopifyOrderId(
        re_customer_id,
        shopify_order_id
      );

      if (charges.length != 1) {
        debugger;
        throw new Error("More than 1 charge");
      }

      const [charge] = charges;
      let { status, payment_processor, external_transaction_id } = charge;
      status = status.toLowerCase();

      if (status === "success") {
        has_already_processed = true;
      } else if (status === "pending") {
        needs_capture = true;
      }

      const rowUpdate = {
        has_already_processed,
        needs_capture,
        transaction_id: external_transaction_id.payment_processor,
        payment_processor_name: payment_processor,
      };

      await ORM.updateOneObj(
        DATABASE,
        rowUpdate,
        `${PRIMARY_KEY} = '${data[`${PRIMARY_KEY}`]}'`
      );
    }
    else {
      // If not shopify Order ID
      debugger
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
        resultArr.push(processRowDataCheck(record_1));
      }

      if (record_2) {
        resultArr.push(processRowDataCheck(record_2));
      }

      if (record_3) {
        resultArr.push(processRowDataCheck(record_3));
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
