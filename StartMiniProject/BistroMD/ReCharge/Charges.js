import { buildOptions, networkRequest } from "./base.js";
import Recharge from "./Recharge.js";

const list = async (customer_id) => {
  try {
    const options = buildOptions(`/charges`, "GET", {
      customer_id: customer_id,
    });
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    console.log("Axios Error");
    throw error;
  }
};

const listByStatus = async (customer_id, status) => {
  // QUEUED, refund, partially_refunded, PENDING, SUCCESS
  try {
    const options = buildOptions(`/charges`, "GET", {
      customer_id: customer_id,
      status: status,
    });
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    console.log("Axios Error");
    throw error;
  }
};

/**
 * @string date
 * @array  items
 */
const skip = async (charge_id, items) => {
  try {
    const options = buildOptions(`/charges/${charge_id}/skip`, "POST", null, {
      purchase_item_ids: items,
    });
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    console.log("Axios Error");
    throw error;
  }
};

/**
 * @string date
 * @array  items
 */
const unskip = async (charge_id, items) => {
  try {
    const options = buildOptions(`/charges/${charge_id}/unskip`, "POST", null, {
      purchase_item_ids: items,
    });
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const removeDiscount = async (charge_id) => {
  try {
    const options = buildOptions(
      `/charges/${charge_id}/remove_discount`,
      "POST",
      null,
      {}
    );
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const applyDiscount = async (charge_id, discount_code) => {
  try {
    const options = buildOptions(
      `/charges/${charge_id}/apply_discount`,
      "POST",
      null,
      {
        discount_code: discount_code,
      }
    );
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const addSkips = async (skipsToAdd, addressId, subscriptionId, charges) => {
  if (!skipsToAdd.length) return;

  const [queuedCharge] = charges.filter((c) => c.status === "queued");
  if (!queuedCharge) {
    return;
  }

  for (let i = 0; i < skipsToAdd.length; i++) {
    const skipToAdd = skipsToAdd[i];
    try {
      if (queuedCharge.scheduled_at == skipToAdd) {
        // Use address skip
        const result = await skip(queuedCharge.id, [subscriptionId]);
        // console.log(JSON.stringify(result));
      } else {
        // use charge skips
        const result = await Recharge.Addresses.skip_future_charge(
          addressId,
          skipToAdd,
          [subscriptionId]
        );
        // console.log(JSON.stringify(result));
      }
    } catch (error) {
      const errMsg = JSON.stringify(error?.response?.data?.errors);
      console.log(errMsg);
      // if (errMsg?.includes("must be within the charge interval schedule")) {
      //   continue;
      // } else {
        console.log(error?.response?.data);
        throw error;
      // }
    }
  }

  return "Success";
};

const Charges = {
  list,
  skip,
  unskip,
  listByStatus,
  removeDiscount,
  applyDiscount,
  // 
  addSkips,
};

export default Charges;
