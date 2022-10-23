// Check for each row differences or update the whole thing?
// Find all the updated
// Check if customer exist
// If they do exist then just do an update.

import dotenv from "dotenv";
import Recharge from "recharge-api-node"; // npm i --save-dev @types/recharge-api-node

import ORM from "./db/orm.js";
import compareSpecificKey from "./helpers/compareSpecificKey.js";

import ReChargeCustom from "./ReCharge/Recharge.js";

const DEBUG_MODE = false;

const BISTRO_ENV = "dev";
const BISTRO_DAY = "monday";

dotenv.config({ path: `./.env` });

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
const TRACK_CUSTOMER_UPDATE = `${BISTRO_ENV}_track_${BISTRO_DAY}_customer`;

const updateReChargeCustomerProfile = async (
  rechargeCustomer,
  localCustomer
) => {
  try {
    const rechargeCustomerId = rechargeCustomer.id;
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

    if (keysToUpdate.length === 0) return "Nothing to update";

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
        } Updated Customer Profile\u001b[0m`
      );
  } catch (error) {
    console.log("Recharge Error updating customer profile");
    throw error;
  }
};

const updateReChargeBillingAddress = async (
  rechargeCustomer,
  localCustomer
) => {
  try {
    const rechargeCustomerId = rechargeCustomer.id;
    const keys = [
      { recharge: "address1", local: "billing_address_1" },
      { recharge: "address2", local: "billing_address_2" },
      { recharge: "city", local: "billing_city" },
      // { recharge: "country", local: "billing_country" },
      { recharge: "province", local: "billing_province_state" },
      { recharge: "zip", local: "billing_postalcode" },
      { recharge: "phone", local: "billing_phone" },
      { recharge: "first_name", local: "billing_first_name" },
      { recharge: "last_name", local: "billing_last_name" },
    ];

    const { payment_methods } = await ReChargeCustom.PaymentMethods.list(
      rechargeCustomerId
    );

    if (payment_methods.length == 0) {
      return "Payment method not found";
    } else if (payment_methods.length > 1) {
      debugger;
      throw new Error("More than 1 payment method");
    }

    const payment_method = payment_methods[0];

    const keysToUpdate = compareSpecificKey(
      payment_method.billing_address,
      localCustomer,
      keys
    );

    if (keysToUpdate.length === 0) return "Nothing to update";

    const updateObj = {};

    for (let i = 0; i < keysToUpdate.length; i++) {
      const key = keysToUpdate[i];
      updateObj[key.recharge] = localCustomer[key.local];
    }

    const finalObj = {
      billing_address: {
        ...updateObj,
      },
    };

    const result = await ReChargeCustom.PaymentMethods.update(
      payment_method.id,
      finalObj
    );

    if (DEBUG_MODE)
      console.log(
        `\u001b[38;5;${rechargeCustomerId % 255}m${
          rechargeCustomer.email
        } Updated Billing Address\u001b[0m`
      );
  } catch (error) {
    console.log("Recharge Billing update error");
    throw error;
  }
};

const updateReChargeShipping = async (rechargeCustomer, localCustomer) => {
  try {
    const rechargeCustomerId = rechargeCustomer.id;
    const keys = [
      { recharge: "address1", local: "shipping_address_1" },
      { recharge: "address2", local: "shipping_address_2" },
      { recharge: "city", local: "shipping_city" },
      { recharge: "province", local: "shipping_province" },
      { recharge: "zip", local: "shipping_zip" },
      // { recharge: "country", local: "shipping_country" },
      { recharge: "phone", local: "shipping_phone" },
      { recharge: "first_name", local: "shipping_first_name" },
      { recharge: "last_name", local: "shipping_last_name" },
    ];

    const { addresses } = await ReChargeCustom.Addresses.list(
      rechargeCustomerId
    );

    if (addresses.length == 0) {
      return "Address not found";
    } else if (addresses.length > 1) {
      debugger;
      throw new Error("More than 1 address");
    }

    const address = addresses[0];

    const keysToUpdate = compareSpecificKey(address, localCustomer, keys);

    if (keysToUpdate.length === 0) return "Nothing to update";

    const updateObj = {};

    for (let i = 0; i < keysToUpdate.length; i++) {
      const key = keysToUpdate[i];
      updateObj[key.recharge] = localCustomer[key.local];
    }

    const result = await ReChargeCustom.Addresses.update(address.id, updateObj);

    if (DEBUG_MODE)
      console.log(
        `\u001b[38;5;${rechargeCustomerId % 255}m${
          rechargeCustomer.email
        } Updated Billing Address\u001b[0m`
      );
  } catch (error) {
    console.log("Recharge Address update error");
    throw error;
  }
};

const updateReChargeSubscription = async (rechargeCustomer, localCustomer) => {
  try {
    const rechargeCustomerId = rechargeCustomer.id;

    const { subscriptions } = await ReChargeCustom.Subscriptions.list(
      rechargeCustomerId
    );

    if (subscriptions.length > 1) {
      debugger;
      throw new Error("More than 1 subscription");
    }

    const subscription = subscriptions[0];

    const {
      address_id,
      next_charge_scheduled_at,
      external_variant_id: { ecommerce: external_variant_id },
      status,
    } = subscription;

    let { id: subscription_id } = subscription;

    const hasPlanChanged =
      external_variant_id != localCustomer.external_variant_id;
    const hasChargeDateChanged =
      next_charge_scheduled_at != localCustomer.next_charge_date;

    if (!hasPlanChanged && !hasChargeDateChanged) {
      return "Subscription has not changed";
    }

    if (hasPlanChanged) {
      await ReChargeCustom.Subscriptions.remove(subscription_id);

      const body = {
        address_id: address_id,
        charge_interval_frequency: "1",
        // Customer could have cancelled, leaving no next date on local
        next_charge_scheduled_at:
          localCustomer.next_charge_date || next_charge_scheduled_at,
        order_interval_frequency: "1",
        order_interval_unit: "week",
        external_variant_id: {
          ecommerce: external_variant_id,
        },
        quantity: 1,
      };

      const result = await ReChargeCustom.Subscriptions.create(body);
      subscription_id = result.subscription.id;
      if (DEBUG_MODE) {
        console.log(result);
      }
    }

    if (hasChargeDateChanged) {
      // cancel
      // update the charge date
      const updateObj = {};

      updateObj.status = status;
      updateObj.next_charge_scheduled_at = localCustomer.next_charge_date;

      const result = await ReChargeCustom.Subscriptions.update(
        subscription_id,
        updateObj
      );
    }

    // Look out for skips?
  } catch (error) {
    console.log("Recharge Subscription update error");
    throw error;
  }
};

const updateReCustomerController = async (rechargeCustomer, localCustomer) => {
  try {
    // await updateReChargeCustomerProfile(rechargeCustomer, localCustomer);
    // await updateReChargeBillingAddress(rechargeCustomer, localCustomer);
    // await updateReChargeShipping(rechargeCustomer, localCustomer);
    await updateReChargeSubscription(rechargeCustomer, localCustomer);
  } catch (error) {
    throw error;
  }
};

(async () => {
  while (true) {
    try {
      let query = `status = 'UPDATE' LIMIT 1`;
      const [foundOne] = await ORM.findOne(TRACK_CUSTOMER_UPDATE, query);
      const rechargeCustomer = await recharge_search.customer.list({
        // email: foundOne.new_email
        email: "jfaltzgmail.com@example.com",
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

        // TODO: Mark update to
        // await ORM.updateOne(
        //   TRACK_CUSTOMER_UPDATE,
        //   "status",
        //   "COMPLETED",
        //   `WHERE id = '${foundOne.id}'`
        // );
      }
    } catch (error) {
      debugger;
      console.log("Error: ", error);
      throw "";
    }
  }
})();
