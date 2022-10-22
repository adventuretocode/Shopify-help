// Check for each row differences or update the whole thing?
// Find all the updated
// Check if customer exist
// If they do exist then just do an update.

import dotenv from "dotenv";
import Recharge from "recharge-api-node"; // npm i --save-dev @types/recharge-api-node

import ORM from "./db/orm.js";
import compareObjects from "./helpers/compareObjects.js";
import compareSpecificKey from "./helpers/compareSpecificKey.js";
import findAllChangesKeys from "./helpers/findAllChangesKeys.js";

import ReChargeCustom from "./ReCharge/Recharge.js";

const DEBUG_MODE = false;

const BISTRO_ENV = "dev";
const BISTRO_DAY = "monday";

dotenv.config({ path: `./.env.${BISTRO_ENV}` });

const { RECHARGE_TOKEN, RECHARGE_SECRET } = process.env;

const recharge_search = new Recharge({
  apiKey: RECHARGE_TOKEN,
  secrete: RECHARGE_SECRET,
});

// const recharge_update = new Recharge({
//   apiKey: RECHARGE_TOKEN,
//   secrete: RECHARGE_SECRET,
// });

const CUSTOMER_TABLE = `${BISTRO_ENV}_bistro_recharge_migration`;
const CUSTOMER_TABLE_SOURCE = `${BISTRO_ENV}_source_bistro_recharge_migration`;
const PRODUCT_TABLE = `${BISTRO_ENV}_prices_from_cart`;
const TRACK_CUSTOMER_UPDATE = `${BISTRO_ENV}_track_${BISTRO_DAY}_customer`;

const updateCustomerProfile = async (rechargeCustomer, localCustomer) => {
  try {
    // update the billing on the customer object
    const keys = [
      { recharge: "email", local: "shipping_email" },
      { recharge: "first_name", local: "billing_first_name" },
      { recharge: "last_name", local: "billing_last_name" },
      { recharge: "phone", local: "shipping_phone" },
    ];

    const keysToUpdate = compareSpecificKey(
      rechargeCustomer,
      localCustomer,
      keys
    );

    const rechargeCustomerId = rechargeCustomer.id;

    const updateObj = {};

    for (let i = 0; i < keysToUpdate.length; i++) {
      const key = keysToUpdate[i];
      updateObj[key.recharge] = localCustomer[key.local];
    }

    const updateResult = await ReChargeCustom.Customers.update(
      rechargeCustomerId,
      updateObj
    );
    if (DEBUG_MODE)
      console.log(
        `\u001b[38;5;${rechargeCustomerId % 255}m${
          rechargeCustomer.email
        } Update Customer Profile\u001b[0m`
      );
  } catch (error) {
    console.log("Recharge Error updating customer profile");
    throw error;
  }
};

const updateReCustomerController = async (rechargeCustomer, localCustomer) => {
	// await updateCustomerProfile(rechargeCustomer, localCustomer)
  try {
    // Update billing
    const keys = [
      { recharge: "billing_address1", local: "billing_address_1" },
      { recharge: "billing_address2", local: "billing_address_2" },
      { recharge: "billing_city", local: "billing_city" },
      { recharge: "billing_country", local: "billing_country" },
      { recharge: "billing_province", local: "billing_province_state" },
      { recharge: "billing_zip", local: "billing_postalcode" },
    ];

    // Get payment method first
    // Check if there is one. There should just be one for now.
    // Update payment

    ReChargeCustom.PaymentMethods.list();
  } catch (error) {
    console.log("Recharge shipping update error");
    throw error;
  }

  try {
    // update the shipping
  } catch (error) {
    console.log("Recharge shipping update error");
    throw error;
  }
};

const main = (async () => {
  while (true) {
    try {
      let query = `action = 'UPDATED' LIMIT 1`;
      const [foundOne] = await ORM.findOne(TRACK_CUSTOMER_UPDATE, query);
      const rechargeCustomer = await recharge_search.customer.list({
        // email: foundOne.new_email
        email: "janet.cheringalgmail.com@example.com",
      });

      if (rechargeCustomer.length == 0) {
        // Add customer to recharge
        // Mark as `TO_ADD` for the export
        await ORM.updateOne(
          TRACK_CUSTOMER_UPDATE,
          "status",
          "TO_ADD",
          `WHERE id = '${foundOne.id}'`
        );
        if (DEBUG_MODE)
          console.log(
            `\u001b[38;5;${foundOne.customer_id % 255}m${
              foundOne.new_email
            } -- status: TO_ADD\u001b[0m`
          );
      } else if (rechargeCustomer.length == 1) {
        // Update the customers
        let findCustomerQuery = `customer_id = ${foundOne.customer_id}`;
        const [localCustomer] = await ORM.findOne(
          CUSTOMER_TABLE,
          findCustomerQuery
        );

        await updateReCustomerController(rechargeCustomer[0], localCustomer);

        const { shopify_customer_id } = rechargeCustomer[0];
        // TODO: Update Shopify as well
      }
    } catch (error) {
      debugger;
      console.log("Error: ", error);
    }
  }
})();
