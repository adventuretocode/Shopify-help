import { buildOptions, networkRequest } from "./base.js";

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
 * @string address_id
 * @string date
 * @array  items
 */
const skip = async (charge_id, items) => {
  try {
    const options = buildOptions(
      `/charges/${charge_id}/skip`,
      "POST",
      null,
      {
        purchase_item_ids: items,
      }
    );
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    console.log("Axios Error");
    throw error;
  }
};


/**
 * @string address_id
 * @string date
 * @array  items
 */
 const unskip = async (charge_id, items) => {
  try {
    const options = buildOptions(
      `/charges/${charge_id}/unskip`,
      "POST",
      null,
      {
        purchase_item_ids: items,
      }
    );
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const Address = {
  list,
  skip,
  unskip,
  listByStatus,
};

export default Address;
