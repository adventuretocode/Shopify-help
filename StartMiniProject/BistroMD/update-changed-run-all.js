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
const BISTRO_DAY = "tuesday";
//

dotenv.config();

const CUSTOMER_TABLE = `${BISTRO_ENV}_bistro_recharge_migration`;
const TRACK_CUSTOMER_UPDATE = `${BISTRO_ENV}_track_${BISTRO_DAY}_customer`;
const CUSTOMER_SHIP_DAY = `${BISTRO_ENV}_logistic_day`;

const logChanges = (
  topic,
  rechargeCustomer,
  updateObj,
  obj1,
  obj2,
  keysToUpdate
) => {
  console.log(
    `\u001b[38;5;${rechargeCustomer.id % 255}m${
      rechargeCustomer.email
    } ${topic}\u001b[0m`
  );
  console.log(
    `\u001b[38;5;${(rechargeCustomer.id + 2) % 255}m${Object.keys(
      updateObj
    )}\u001b[0m`
  );
  keysToUpdate.forEach(({ recharge, local }) => {
    console.log(`${obj1[recharge]} => ${obj2[local]}`);
  });
};

const sleep = async (timeInMillieSec) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeInMillieSec);
  });
};

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

    if (DEBUG_MODE) {
      logChanges(
        "Customer Profile",
        rechargeCustomer,
        updateObj,
        rechargeCustomer,
        localCustomer,
        keysToUpdate
      );
    }
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
      debugger;
      throw new Error("Payment method not found");
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

    const provinceChanged = keysToUpdate.find(({ recharge: reKey }) =>
      reKey.includes("province")
    );

    if (provinceChanged && Object.keys(provinceChanged).length) {
      const { recharge: reKey, local: localKey } = provinceChanged;
      const stateIsSame = isStateProvinceAbv(
        payment_method.billing_address[reKey],
        localCustomer[localKey]
      );
      if (stateIsSame) {
        keysToUpdate.splice(
          keysToUpdate.findIndex(
            (a) => a.recharge === provinceChanged.recharge
          ),
          1
        );
      }
    }

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

    if (DEBUG_MODE) {
      logChanges(
        "Billing Address",
        rechargeCustomer,
        updateObj,
        payment_method.billing_address,
        localCustomer,
        keysToUpdate
      );
    }
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
      debugger;
      throw new Error("Address not found");
    } else if (addresses.length > 1) {
      debugger;
      throw new Error("More than 1 address");
    }

    const address = addresses[0];

    const keysToUpdate = compareSpecificKey(address, localCustomer, keys);

    const provinceChanged = keysToUpdate.find(({ recharge: reKey }) =>
      reKey.includes("province")
    );

    if (provinceChanged && Object.keys(provinceChanged).length) {
      const { recharge: reKey, local: localKey } = provinceChanged;
      const stateIsSame = isStateProvinceAbv(
        address[reKey],
        localCustomer[localKey]
      );
      if (stateIsSame) {
        keysToUpdate.splice(
          keysToUpdate.findIndex(
            (a) => a.recharge === provinceChanged.recharge
          ),
          1
        );
      }
    }

    if (keysToUpdate.length === 0) return "Nothing to update";

    const updateObj = {};

    for (let i = 0; i < keysToUpdate.length; i++) {
      const key = keysToUpdate[i];
      updateObj[key.recharge] = localCustomer[key.local];
    }

    const result = await ReChargeCustom.Addresses.update(address.id, updateObj);

    if (DEBUG_MODE) {
      logChanges(
        "Shipping",
        rechargeCustomer,
        updateObj,
        address,
        localCustomer,
        keysToUpdate
      );
    }
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

const updateReCustomerController = async (rechargeCustomer, localCustomer) => {
  try {
    await updateReChargeCustomerProfile(rechargeCustomer, localCustomer);
    await updateReChargeBillingAddress(rechargeCustomer, localCustomer);
    await updateReChargeShipping(rechargeCustomer, localCustomer);
    await updateReChargeSubscription(rechargeCustomer, localCustomer);
    return "Completed";
  } catch (error) {
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

      await updateReCustomerController(rechargeCustomer[0], localCustomer);

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

const runMany = async () => {
  while (true) {
    try {
      let query = `reprocessing = false AND status = 'active' LIMIT 3`;
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
  }
};

const runOne = async (customerId) => {
  const continuous = !customerId;
  do {
    try {
      let query = customerId ? `customer_id = ${customerId}` : `reprocessing = false AND status = 'active' LIMIT 1`;
      const [localCustomer] = await ORM.findOne(CUSTOMER_TABLE, query);

			if(!localCustomer) return "Completed";
			
      const results = await ReChargeCustom.Customers.findByEmail(
        localCustomer.shipping_email
      );

      const { customers: rechargeCustomer } = results;

      if (rechargeCustomer.length == 0) {
        debugger
        throw new Error("No customer");
      } else if (rechargeCustomer.length == 1) {
        
        await updateReCustomerController(rechargeCustomer[0], localCustomer);

        await ORM.updateOne(
          CUSTOMER_TABLE,
          "reprocessing",
          true,
          `id = '${localCustomer.id}'`
        );
      }
    } catch (error) {
      console.log(error?.response?.data);
      if (error?.response?.data?.warning === "too many requests") {
        console.log("too many requests sleep for 5sec");
        await sleep(5000);
      } 
      else if (error?.response?.data?.errors?.subscription[0] == 'item already set to active') {
        await sleep(1000);
      }
      else {
        console.log("Error: ", error);
        console.log(error?.response?.data?.errors);
        debugger;
        throw "";
      }
    }
  } while (continuous);
  process.exit();
};

// runOne()
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