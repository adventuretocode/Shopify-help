// Check for each row differences or update the whole thing?
// Find all the updated
// Check if customer exist
// If they do exist then just do an update.

import dotenv from "dotenv";

import ORM from "./db/orm.js";
import compareSpecificKey from "./helpers/compareSpecificKey.js";

import ReChargeCustom from "./ReCharge/Recharge.js";
import isStateProvinceAbv from "./helpers/isStateProvinceAbv.js";
import Recharge from "./ReCharge/Recharge.js";
import { getDayOfTheWeek, minusBusinessDays } from "./helpers/moment.js";

const DEBUG_MODE = true;

const BISTRO_ENV = "prod";
const BISTRO_DAY = "monday";
//

dotenv.config();

// const CUSTOMER_TABLE = `${BISTRO_ENV}_bistro_recharge_migration`;
// const CUSTOMER_TABLE = `b-${BISTRO_DAY}-ship-full`;
const CUSTOMER_TABLE = `grand-father-price-full`;
const TRACK_CUSTOMER_UPDATE = `${BISTRO_ENV}_track_${BISTRO_DAY}_customer`;
const CUSTOMER_SHIP_DAY = `${BISTRO_ENV}_logistic_day`;
const PRODUCT_TABLE = `${BISTRO_ENV}_prices_from_cart_new`;
const PROCESSING_BOOLEAN = "reprocessed";

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

const updateFlag = async (localCustomer, flag) => {
  try {
    if (localCustomer.id) {
      await ORM.updateOne(
        CUSTOMER_TABLE,
        flag,
        true,
        `id = '${localCustomer.id}'`
      );
    } else if (localCustomer.Email) {
      await ORM.updateOne(
        CUSTOMER_TABLE,
        flag,
        true,
        `Email = '${localCustomer.Email}'`
      );
    } else {
      throw new Error("Could Not Flag, No identifier");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Could Not Flag");
  }
};

const retrieveProductInfo = async (Program_Type, Program_Snack_Type) => {
  try {
    let snackQuery, product;

    try {
      if (!Program_Snack_Type) {
        snackQuery = `(snack_type IS NULL OR snack_type = '')`;
      } else {
        snackQuery = `snack_type = '${Program_Snack_Type}'`;
      }
      product = await ORM.findOne(
        PRODUCT_TABLE,
        `product_type = '${Program_Type}' AND ${snackQuery}`
      );

      if (product.length == 0) {
        product = await ORM.findOne(
          PRODUCT_TABLE,
          `shopify_sku = '${Program_Type}' AND ${snackQuery}`
        );
      }
    } catch (error) {
      console.log(error);
      throw error;
    }

    if (product.length > 1) throw new Error("More than 1 product");

    if (product.length == 0) {
      debugger;
      return;
    }

    const {
      external_product_name,
      external_product_id,
      external_variant_id,
      recurring_price,
    } = product[0];

    return {
      external_product_name,
      external_product_id,
      external_variant_id,
      recurring_price,
    };
  } catch (error) {
    console.log(error);
    console.log(new Error("Unable to get product"));
    throw error;
  }
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

const updateReChargeSubscription = async (
  rechargeCustomer,
  localCustomer,
  isPerformStates
) => {
  try {
    const rechargeCustomerId = rechargeCustomer.id;

    const { subscriptions } = await ReChargeCustom.Subscriptions.list(
      rechargeCustomerId
    );

    let subscription;
    let isJustAdd;

    if (subscriptions.length === 0 && localCustomer.status === "active") {
      const { addresses } = await ReChargeCustom.Addresses.list(
        rechargeCustomerId
      );
      subscription = {
        address_id: addresses[0].id,
        next_charge_scheduled_at: localCustomer.next_charge_date,
        external_variant_id: { ecommerce: localCustomer.external_variant_id },
        status: "active",
      };
      isJustAdd = true;
    } else {
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

    let hasPlanChanged =
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

    if (
      !hasPlanChanged &&
      !hasChargeDateChanged &&
      !hasStatusChanged &&
      !isJustAdd
    ) {
      await updateFlag(localCustomer, "subscription_has_not_changed");
      return "Subscription has not changed";
    }

    // Preserve skips
    const { charges } = await Recharge.Charges.list(rechargeCustomerId);
    let reChargeCharges =
      Recharge.Helpers.retrieveReChargeQueueDescByDate(charges);
    console.log(reChargeCharges);
    if (!reChargeCharges.includes(localCustomer.next_charge_date)) {
      reChargeCharges = reChargeCharges.map((date) =>
        minusBusinessDays(date, 5)
      );
      console.log(reChargeCharges);
    } else {
      // So that we don't process theme again
      await updateFlag(localCustomer, "has_cancelled");
      return "Completed";
    }

    const nextChargeDay = getDayOfTheWeek(localCustomer.next_charge_date);
    const allSkipMatchDayOfWeek = reChargeCharges.every(
      (day) => getDayOfTheWeek(day) === nextChargeDay
    );
    if (!allSkipMatchDayOfWeek) {
      debugger;
    }

    if (isJustAdd && !isPerformStates) {
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
    } else if (isJustAdd && isPerformStates) {
      await updateFlag(localCustomer, "is_just_add");
    }

    if (hasPlanChanged && !isPerformStates) {
      // await ReChargeCustom.Subscriptions.remove(subscription_id);
      // let nextChargeScheduledAt =
      //   localCustomer.next_charge_date || next_charge_scheduled_at;
      // if (!nextChargeScheduledAt) {
      //   const query = `day_of_week = '${localCustomer.shipping_day}'`;
      //   const [ship_day_profile] = await ORM.findOne(CUSTOMER_SHIP_DAY, query);
      //   nextChargeScheduledAt = ship_day_profile.warehouse_date;
      // }
      // const body = {
      //   address_id: address_id,
      //   charge_interval_frequency: "1",
      //   // Customer could have cancelled, leaving no next date on local
      //   next_charge_scheduled_at: nextChargeScheduledAt,
      //   order_interval_frequency: "1",
      //   order_interval_unit: "week",
      //   external_variant_id: {
      //     ecommerce: `${localCustomer.external_variant_id}`,
      //   },
      //   quantity: 1,
      // };
      // const result = await ReChargeCustom.Subscriptions.create(body);
      // subscription_id = result.subscription.id;
      // if (DEBUG_MODE) {
      //   console.log(result.subscription.variant_title);
      // }
    } else if (hasPlanChanged && isPerformStates) {
      await updateFlag(localCustomer, "has_plan_changed");
    }

    if (hasStatusChanged && !isPerformStates) {
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
    } else if (hasStatusChanged && isPerformStates) {
      await updateFlag(localCustomer, "has_status_changed");
    }

    if (
      hasChargeDateChanged &&
      !hasReactivated &&
      localCustomer.status != "cancelled" &&
      !isPerformStates
    ) {
      const result = await ReChargeCustom.Subscriptions.set_next_charge_date(
        subscription_id,
        localCustomer.next_charge_date
      );

      if (DEBUG_MODE) {
        console.log(result);
      }
    } else if (
      hasChargeDateChanged &&
      !hasReactivated &&
      localCustomer.status != "cancelled" &&
      isPerformStates
    ) {
      await updateFlag(localCustomer, "has_charge_date_changed");
    }

    if (status === "cancelled") {
      await updateFlag(localCustomer, "has_cancelled");
    }

    if (reChargeCharges.length && !isPerformStates) {
      const { charges } = await Recharge.Charges.list(rechargeCustomerId);
      await Recharge.Charges.addSkips(
        reChargeCharges,
        subscription.address_id,
        subscription.id,
        charges
      );
    } else if (reChargeCharges.length && isPerformStates) {
      await updateFlag(localCustomer, "has_skips");
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

const updateReChargePrice = async (
  rechargeCustomer,
  localCustomer,
  isPerformStates
) => {
  try {
    // Get subscription
    const { subscriptions } = await Recharge.Subscriptions.list(
      rechargeCustomer.id
    );
    const activeSubscriptions = subscriptions.filter(
      (sub) => sub.status === "active"
    );

    if (activeSubscriptions.length > 1) {
      console.log(`=========================================================================`);
      console.log(
        `https://bistro-md-sp.admin.rechargeapps.com/merchant/customers/${rechargeCustomer.id}`
      );
      debugger;
      return;
    }

    if (!activeSubscriptions.length) {
      console.log("has_cancelled");
      await updateFlag(localCustomer, "has_cancelled");
      return;
    }

    const subscription = activeSubscriptions[0];

    const {
      id: subscription_id,
      status,
      external_variant_id,
      price,
    } = subscription;

    console.log(
      `======= ${localCustomer.shipping_email} ======== ${localCustomer.Program} === ${localCustomer.Snacks} ==== ${price} ======================`
    );

    // make sure it is active.
    if (status != "active") {
      console.log("has_cancelled");
      await updateFlag(localCustomer, "has_cancelled");
      return;
    }

    const isSamePrice = +localCustomer.OldPrice == +price;
    if (isSamePrice) {
      console.log("is_same_price");
      await updateFlag(localCustomer, "is_same_price");
      return;
    }

    const productData = await retrieveProductInfo(
      localCustomer.Program,
      localCustomer.Snacks
    );
    const isOldPriceHigher = +localCustomer.OldPrice > +price;
    const hasProductChanged =
      external_variant_id.ecommerce != productData.external_variant_id;

    // Compare price.
    if (isOldPriceHigher) {
      console.log("current_price_is_lower");
      await updateFlag(localCustomer, "current_price_is_lower");
      return;
    }

    // make sure the product is the same
    if (hasProductChanged) {
      console.log("has_product_changed");
      await updateFlag(localCustomer, "has_product_changed");
      return;
    }

    // Preserve skips
    const { charges } = await Recharge.Charges.list(rechargeCustomer.id);
    let reChargeCharges =
      Recharge.Helpers.retrieveReChargeQueueDescByDate(charges);
    console.log(reChargeCharges);

    const result = await Recharge.Subscriptions.update(subscription_id, {
      price: localCustomer.OldPrice,
    });
    console.log(result.subscription.price, price);

    if (reChargeCharges.length) {
      const { charges } = await Recharge.Charges.list(rechargeCustomer.id);
      let reChargeChargesNew =
        Recharge.Helpers.retrieveReChargeQueueDescByDate(charges);
      if (
        JSON.stringify(reChargeCharges) != JSON.stringify(reChargeChargesNew)
      ) {
        debugger;
        await Recharge.Charges.addSkips(
          reChargeCharges,
          subscription.address_id,
          subscription.id,
          charges
        );
      }
    }
    return "complete";
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateReCustomerController = async (
  rechargeCustomer,
  localCustomer,
  isPerformStates
) => {
  try {
    // await updateReChargeCustomerProfile(rechargeCustomer, localCustomer);
    // await updateReChargeBillingAddress(rechargeCustomer, localCustomer);
    // await updateReChargeShipping(rechargeCustomer, localCustomer);
    // await updateReChargeSubscription(
    //   rechargeCustomer,
    //   localCustomer,
    //   isPerformStates
    // );
    await updateReChargePrice(rechargeCustomer, localCustomer);
    return "Completed";
  } catch (error) {
    console.log(error?.response?.data);
    if (
      error?.response?.data?.error ===
      "Subscription cannot be modified when it has a pending charge."
    ) {
      await updateFlag(localCustomer, `has_pending_charge`);
      return;
    }
    throw error;
  }
};

const processCustomer = async (localCustomer) => {
  try {
    const results = await ReChargeCustom.Customers.findByEmail(
      localCustomer.shipping_email || localCustomer.Email
    );

    const { customers: rechargeCustomer } = results;

    if (rechargeCustomer.length == 0) {
      debugger;
      throw new Error("No customer");
    } else if (rechargeCustomer.length == 1) {
      console.log(
        `https://bistro-md-sp.admin.rechargeapps.com/merchant/customers/${rechargeCustomer[0].id}`
      );

      // Update the customers

      await updateReCustomerController(
        rechargeCustomer[0],
        localCustomer,
        false
      );

      if (localCustomer.id) {
        await ORM.updateOne(
          CUSTOMER_TABLE,
          PROCESSING_BOOLEAN,
          true,
          `id = '${localCustomer.id}'`
        );
      } else if (localCustomer.Email) {
        await ORM.updateOne(
          CUSTOMER_TABLE,
          PROCESSING_BOOLEAN,
          true,
          `Email = '${localCustomer.Email}'`
        );
      }
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
    } else if (
      error?.response?.data?.error ===
      "A call to this route is already in progress."
    ) {
      console.log("too many requests sleep for 2sec");
      await sleep(2000);
    } else {
      console.log("Error: ", error);
      console.log(error?.response?.data?.errors);
      if (error.errno == -3008) {
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
      let query = customerId
        ? `customer_id = ${customerId}`
        : `${PROCESSING_BOOLEAN} = false LIMIT 3`;
      // `has_charge_date_changed = true AND has_skips = 0 AND has_cancelled = 0 AND ${PROCESSING_BOOLEAN} = false LIMIT 1`;
      const [customerOne, customerTwo, customerThree] = await ORM.findOne(
        CUSTOMER_TABLE,
        query
      );

      if (!customerOne && !customerTwo && !customerThree) return "Completed";

      const resultArr = [];
      if (customerOne) {
        resultArr.push(processCustomer(customerOne));
      }

      if (customerTwo) {
        resultArr.push(processCustomer(customerTwo));
      }

      if (customerThree) {
        resultArr.push(processCustomer(customerThree));
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
