import { buildOptions, networkRequest } from "./base.js";

const update = async (customerId, data) => {
  try {
    const options = buildOptions(`/customers/${customerId}`, "PUT", null, data);
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw new Error("Network Request Error");
  }
};

const findByEmail = async (email) => {
  try {
    const options = buildOptions(`/customers`, "GET", { email });
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw new Error("Network Request Error");
  }
};

const listAnyCustomer = async () => {
  try {
    const options = buildOptions(`/customers`, "GET");
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw new Error("Network Request Error");
  }
};

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
  update,
  findByEmail,
  listAnyCustomer,
  remove,
};

export default Customers;
