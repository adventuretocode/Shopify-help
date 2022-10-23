import { buildOptions, networkRequest } from "./base.js";

const update = async (customerId, data) => {
  try {
    const options = buildOptions(`/customers/${customerId}`, "PUT", null, data);
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw new Error("Axios Error");
  }
};

const list = async (email) => {
  try {
    const options = buildOptions(`/customers`, "GET", { email });
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw new Error("Axios Error");
  }
};

const Customers = {
  update,
  list,
};

export default Customers;
