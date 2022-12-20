import dotenv from "dotenv";
import Recharge from "./ReCharge/Recharge.js";
import ORM from "./db/orm.js";
import Shopify from "./Shopify/Shopify.js";

dotenv.config();

const DATABASE = "charging_customers_many";
const PRIMARY_KEY = "email";
const PROCESSING_BOOLEAN = "checked";

const processPendingCharges = async (charges) => {
  try {
    for (let i = 0; i < charges.length; i++) {
      const charge = charges[i];
      let {
        payment_processor,
        id,
        external_order_id,
        external_transaction_id,
        customer,
      } = charge;

      const updateObj = {
        transaction_id: external_transaction_id.payment_processor,
        payment_processor_name: payment_processor,
      };
      await ORM.updateOneObj(
        DATABASE,
        updateObj,
        `${PRIMARY_KEY} = '${customer.email}'`
      );

      if (payment_processor === "authorize") {
        const result = await Recharge.Charges.capturePayment(id);
        console.log(result);
      }
      // else if (payment_processor === "Shopify Payment") {}
      else {
        debugger;
        const transactionId = await Shopify.Orders.retrieveTransactionId(
          external_order_id
        );
      }
    }
  } catch (error) {
    throw error;
  }
};

const processRowData = async (data) => {
  try {
    const { email } = data;
    const { customers } = await Recharge.Customers.findByEmail(email);
    const [rechargeCustomer] = customers;

    if (!rechargeCustomer) {
      const updateObj = {
        message: "Customer not found",
        has_failed: true,
      };
      await ORM.updateOneObj(
        DATABASE,
        updateObj,
        `${PRIMARY_KEY} = '${data[`${PRIMARY_KEY}`]}'`
      );
      return data;
    }

    const { id: re_customer_id } = rechargeCustomer;
    const { charges } = await Recharge.Charges.listByStatus(
      re_customer_id,
      "PENDING"
    );

    if (charges.length == 0) {
      await ORM.updateOne(
        DATABASE,
        `has_already_processed`,
        true,
        `${PRIMARY_KEY} = '${data[`${PRIMARY_KEY}`]}'`
      );
      return data;
    }

    try {
      await processPendingCharges(charges);
    } catch (error) {
      const updateObj = {
        message: JSON.stringify(error?.response?.data?.errors),
        has_failed: true,
      };
      await ORM.updateOneObj(
        DATABASE,
        updateObj,
        `${PRIMARY_KEY} = '${data[`${PRIMARY_KEY}`]}'`
      );
    }

    // If there is a shopify order look for shopify order

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
