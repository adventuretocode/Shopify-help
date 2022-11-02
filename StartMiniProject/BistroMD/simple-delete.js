// Is not really working
import dotenv from "dotenv";
import Recharge from "./ReCharge/Recharge.js";
import Shopify from "shopify-api-node";

dotenv.config();

const DEBUG_MODE = true;
const { SHOP, SHOPIFY_KEY, SHOPIFY_TOKEN } = process.env;

const shopify = new Shopify({
  shopName: SHOP,
  apiKey: SHOPIFY_KEY,
  password: SHOPIFY_TOKEN,
});

const sleep = async (timeInMillieSec) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeInMillieSec);
  });
};

const main = async () => {
  console.time();
  try {
    while (true) {
      // List recharge customers
      const { customers: rechargeCustomers } =
        await Recharge.Customers.listAnyCustomer();

      if (rechargeCustomers.length == 0) {
        return "Completed";
      }

      const length = rechargeCustomers.length;
      for (let i = 0; i < length; i++) {
        const customer = rechargeCustomers[i];
        const {
          id,
          email,
          external_customer_id: { ecommerce: shopify_id },
        } = customer;

        try {
          await Recharge.Customers.remove(id);
        } catch (error) {
          console.log("Recharge Delete error");
          console.log(error);
        }

        try {
          await shopify.customer.delete(shopify_id);
        } catch (error) {
          console.log("Shopify Delete error");
          console.log(error);
        }

        if (DEBUG_MODE) {
          console.log(`\u001b[38;5;${id % 255}m${email}\u001b[0m`);
        }

        await sleep(50);
      }
    }
  } catch (error) {
    throw error;
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
