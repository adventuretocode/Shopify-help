// Check for each row differences or update the whole thing?
// Find all the updated
// Check if customer exist
// If they do exist then just do an update.

import dotenv from "dotenv";

import ORM from "./db/orm.js";
import compareSpecificKey from "./helpers/compareSpecificKey.js";

import ReChargeCustom from "./ReCharge/Recharge.js";
import isStateProvinceAbv from "./helpers/isStateProvinceAbv.js";

const DEBUG_MODE = true;

const BISTRO_ENV = "prod";
const BISTRO_DAY = "monday";

dotenv.config();

const CUSTOMER_TABLE = `${BISTRO_ENV}_bistro_recharge_migration`;
const TRACK_CUSTOMER_UPDATE = `b-${BISTRO_DAY}-ship`;
const CUSTOMER_SHIP_DAY = `${BISTRO_ENV}_logistic_day`;

const sleep = async (timeInMillieSec) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeInMillieSec);
  });
};


const updateReChargeSubscription = async (rechargeCustomer, localCustomer) => {
  try {
    const rechargeCustomerId = rechargeCustomer.id;

    const { subscriptions } = await ReChargeCustom.Subscriptions.list(
      rechargeCustomerId
    );

    let subscription;
    let isJustAdd;

    if(subscriptions.length === 0 && localCustomer.status === "active") {
      const { addresses } = await ReChargeCustom.Addresses.list(rechargeCustomerId);
      subscription = {
        address_id: addresses[0].id,
        next_charge_scheduled_at: localCustomer.next_charge_date,
        external_variant_id: { ecommerce: localCustomer.external_variant_id },
        status: "active"
      }
      isJustAdd = true;
    }
    else {
      subscription = subscriptions[0];
    }

    if (subscriptions.length > 1) {
      debugger;
      throw new Error("More than 1 subscription");
    }

    const {
      address_id,
      next_charge_scheduled_at,
      external_variant_id: { ecommerce: external_variant_id },
      status,
    } = subscription;

    let { id: subscription_id } = subscription;

    const hasPlanChanged =
      external_variant_id != localCustomer.external_variant_id;

    let hasReactivated;
    let hasChargeDateChanged;
    let hasStatusChanged = status != localCustomer.status;

    if (
      (next_charge_scheduled_at == "" || next_charge_scheduled_at == null) &&
      (localCustomer.next_charge_date == "" ||
        localCustomer.next_charge_date == null)
    ) {
      hasChargeDateChanged = false;
    }
    if (hasChargeDateChanged == undefined) {
      hasChargeDateChanged =
        next_charge_scheduled_at != localCustomer.next_charge_date;
    }

    if (!hasPlanChanged && !hasChargeDateChanged && !hasStatusChanged && !isJustAdd) {
      return "Subscription has not changed";
    }

    if(isJustAdd) {
      const body = {
        address_id: subscription.address_id,
        charge_interval_frequency: "1",
        next_charge_scheduled_at: next_charge_scheduled_at,
        order_interval_frequency: "1",
        order_interval_unit: "week",
        external_variant_id: {
          ecommerce: `${subscription.external_variant_id.ecommerce}`,
        },
        quantity: 1,
      };

      const result = await ReChargeCustom.Subscriptions.create(body);
      subscription_id = result.subscription.id;
      if (DEBUG_MODE) {
        console.log(result);
      }
    }

    if (hasPlanChanged) {
      await ReChargeCustom.Subscriptions.remove(subscription_id);

      let nextChargeScheduledAt =
        localCustomer.next_charge_date || next_charge_scheduled_at;
      if (!nextChargeScheduledAt) {
        const query = `day_of_week = '${localCustomer.shipping_day}'`;
        const [ship_day_profile] = await ORM.findOne(CUSTOMER_SHIP_DAY, query);
        nextChargeScheduledAt = ship_day_profile.warehouse_date;
      }

      const body = {
        address_id: address_id,
        charge_interval_frequency: "1",
        // Customer could have cancelled, leaving no next date on local
        next_charge_scheduled_at: nextChargeScheduledAt,
        order_interval_frequency: "1",
        order_interval_unit: "week",
        external_variant_id: {
          ecommerce: `${localCustomer.external_variant_id}`,
        },
        quantity: 1,
      };

      const result = await ReChargeCustom.Subscriptions.create(body);
      subscription_id = result.subscription.id;
      if (DEBUG_MODE) {
        console.log(result.subscription.variant_title);
      }
    }

    if (hasStatusChanged) {
      let result;
      if (status === "active" && localCustomer.status === "cancelled") {
        // cancel subscription
        result = await ReChargeCustom.Subscriptions.cancel(subscription_id);
      } else if (status === "cancelled" && localCustomer.status === "active") {
        // activate subscription
        const subActivate = await ReChargeCustom.Subscriptions.activate(
          subscription_id
        );
        if (
          subActivate.subscription.next_charge_scheduled_at !=
          localCustomer.next_charge_date
        ) {
          result = await ReChargeCustom.Subscriptions.set_next_charge_date(
            subscription_id,
            localCustomer.next_charge_date
          );
        }
        hasReactivated = true;
        if (DEBUG_MODE) {
          console.log(subActivate);
          console.log(result);
        }
      }
    }

    if (
      hasChargeDateChanged &&
      !hasReactivated &&
      localCustomer.status != "cancelled"
    ) {
      const result = await ReChargeCustom.Subscriptions.set_next_charge_date(
        subscription_id,
        localCustomer.next_charge_date
      );

      if (DEBUG_MODE) {
        console.log(result);
      }
    }

    if (DEBUG_MODE) {
      console.log(
        `\u001b[38;5;${rechargeCustomerId % 255}m${
          rechargeCustomer.email
        } Subscription Update\u001b[0m`
      );
      console.log(
        `\u001b[38;5;${(rechargeCustomerId + 2) % 255}m${
          rechargeCustomer.email
        }\nhasPlanChanged => ${hasPlanChanged}\nhasReactivated => ${hasReactivated}\nhasChargeDateChanged => ${hasChargeDateChanged}\nhasStatusChanged => ${hasStatusChanged} \u001b[0m`
      );
    }

    return "Completed";
  } catch (error) {
    console.log("Recharge Subscription update error");
    if (
      error?.response?.data?.errors?.subscription[0].length == 1 &&
      error?.response?.data?.errors?.subscription[0] ===
        "item already set to active"
    ) {
      return "";
    }
    throw error;
  }
};

const processCustomer = async (localCustomer) => {
  try {
    const results = await ReChargeCustom.Customers.findByEmail(
      localCustomer.shipping_email
    );

    const { customers: rechargeCustomer } = results;

    if (rechargeCustomer.length == 0) {
      debugger
      throw new Error("No customer");
    } else if (rechargeCustomer.length == 1) {
      // Update the customers

      await updateReCustomerController(updateReChargeSubscription[0], localCustomer);

      await ORM.updateOne(
        CUSTOMER_TABLE,
        "reprocessing",
        true,
        `id = '${localCustomer.id}'`
      );
    }

    if (DEBUG_MODE)
      console.log(
        `\u001b[38;5;${localCustomer.customer_id % 255}m${
          localCustomer.shipping_email
        }\u001b[0m`
      );

    return localCustomer.shipping_email;
  } catch (error) {
    console.log(error?.response?.data);
    if (error?.response?.data?.warning === "too many requests") {
      console.log("too many requests sleep for 2sec");
      await sleep(2000);
    } else {
      console.log("Error: ", error);
      console.log(error?.response?.data?.errors);
      if ((error.errno == -3008)) {
        return;
      } else {
        debugger;
        throw "";
      }
    }
  }
};

const runMany = async (customerId) => {
  const continuous = !customerId;
  do {
    try {
      // let query = customerId ? `customer_id = ${customerId}` : `reprocessing = false AND status = 'active' LIMIT 3`;
      let query = `has_update_next_charge = 0 LIMIT 1`;
      const [customerOne, customerTwo, customerThree] = await ORM.findOne(
        CUSTOMER_TABLE,
        query
      );

      if (!customerOne && !customerTwo && !customerThree) return "Completed";

      let resultOne, resultTwo, resultThree;
      if (customerOne) {
        resultOne = processCustomer(customerOne);
      }

      if (customerTwo) {
        resultTwo = processCustomer(customerTwo);
      }

      if (customerThree) {
        resultThree = processCustomer(customerThree);
      }

      const resultArr = [];

      if (resultOne) {
        resultArr.push(resultOne);
      }

      if (resultTwo) {
        resultArr.push(resultTwo);
      }

      if (resultThree) {
        resultArr.push(resultThree);
      }

      const resultFinal = await Promise.all(resultArr);
      console.log(resultFinal);
    } catch (error) {
      throw error;
    }
  } while (continuous);
  process.exit();
};

runMany()
  .then((success) => {
    console.log("==========================================");
    console.log(success);
    console.log("==========================================");
    console.timeEnd();
    console.log("==========================================");
    console.log("BistroMD has completed successfully");
    process.exit();
  })
  .catch((err) => {
    console.log("==========================================");
    console.log(err);
    console.log("==========================================");
    console.timeEnd();
    console.log("==========================================");
    console.log("BistroMD has exited with errors " + err.message);
    process.exit();
  });

