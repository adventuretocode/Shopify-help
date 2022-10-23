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

const activate = async (subscription_id) => {
  try {
    const options = buildOptions(
      `/subscriptions/${subscription_id}/activate`,
      "POST",
      null,
      {}
    );
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

const set_next_charge_date = async (subscription_id, date) => {
  try {
    const options = buildOptions(
      `/subscriptions/${subscription_id}/set_next_charge_date`,
      "POST",
      null,
      { date }
    );
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw new Error("Axios Error");
  }
};

const cancel = async (subscription_id) => {
  try {
    const options = buildOptions(
      `/subscriptions/${subscription_id}/cancel`,
      "POST",
      null,
      { cancellation_reason: "Cancel on Shopify import" }
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
  activate,
  set_next_charge_date,
  update,
  list,
  cancel,
  remove,
};

export default Subscriptions;
