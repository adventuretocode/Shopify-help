import { buildOptions, networkRequest } from "./base.js";

const update = async (customerId, data) => {
  try {
    const options = buildOptions(`/customers/${customerId}`, "PUT", null, data);
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    console.log("Axios Error");
    throw error;
  }
};

/**
 * 
 * @return list of customers
 */
const findByEmail = async (email) => {
  try {
    const options = buildOptions(`/customers`, "GET", { email });
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    console.log("Axios Error");
    throw error;
  }
};

const listAnyCustomer = async () => {
  try {
    const options = buildOptions(`/customers`, "GET");
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    console.log("Axios Error");
    throw error;
  }
};

const remove = async (customer_id) => {
  try {
    const options = buildOptions(`/customers/${customer_id}`, "DELETE");
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    console.log("Axios Error");
    throw error;
  }
}

const Customers = {
  update,
  findByEmail,
  listAnyCustomer,
  remove,
};

export default Customers;
