import { buildOptions, networkRequest } from "./base.js";

const update = async (address_id, body) => {
  try {
    const options = buildOptions(`/addresses/${address_id}`, "PUT", null, body);
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    console.log("Axios Error");
    throw error;
  }
};

const list = async (customer_id) => {
  try {
    const options = buildOptions(`/addresses`, "GET", {
      customer_id: customer_id,
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
const skip_future_charge = async (address_id, date, items) => {
  try {
    const options = buildOptions(
      `/addresses/${address_id}/charges/skip`,
      "POST",
      null,
      {
        date,
        subscription_ids: items,
      }
    );
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const Address = {
  update,
  list,
  skip_future_charge,
};

export default Address;
