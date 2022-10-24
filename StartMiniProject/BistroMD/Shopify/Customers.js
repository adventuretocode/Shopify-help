import { buildOptions, networkRequest } from "./base.js";

const remove = async (customer_id) => {
  try {
    const options = buildOptions(`/customers/${customer_id}`, "DELETE");
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw new Error("Network Request Error");
  }
}

const Customers = {
  remove,
};

export default Customers;
