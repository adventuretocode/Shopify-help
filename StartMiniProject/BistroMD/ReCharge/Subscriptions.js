import { buildOptions, networkRequest } from "./base.js";

const create = async (body) => {
  try {
    const options = buildOptions(`/subscriptions`, "POST", null, body);
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw new Error("Axios Error");
  }
};

const list = async (customer_id) => {
  try {
    const options = buildOptions(`/subscriptions`, "GET", {
      customer_id: customer_id,
    });
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw new Error("Axios Error");
  }
};

const update = async (subscription_id, body) => {
  try {
    const options = buildOptions(
      `/subscriptions/${subscription_id}`,
      "PUT",
      null,
      body
    );
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw new Error("Axios Error");
  }
};

const remove = async (subscription_id) => {
  try {
    const options = buildOptions(`/subscriptions/${subscription_id}`, "DELETE");
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw new Error("Axios Error");
  }
};

const Subscriptions = {
  create,
  update,
  list,
  remove,
};

export default Subscriptions;
