import { buildOptions, networkRequest } from "./base.js";

const list = async (customer_id) => {
  try {
    const options = buildOptions(
      `/customers/${customer_id}/delivery_schedule`,
      "GET"
    );
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    console.log("Axios Error");
    throw error;
  }
};

const Customers = {
  list,
};

export default Customers;
