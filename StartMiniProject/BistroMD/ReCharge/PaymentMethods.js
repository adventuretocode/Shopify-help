import axios from "axios";

const { RECHARGE_TOKEN } = process.env;

const update = async (payment_method_id, data) => {
  try {
    const options = {
      url: `https://api.rechargeapps.com/payment_methods/${payment_method_id}`,
      headers: {
        "Content-Type": "application/json",
        "X-Recharge-Version": "2021-11",
        "X-Recharge-Access-Token": RECHARGE_TOKEN,
      },
      method: "PUT",
      data: data,
    };
    const result = await axios(options);
    return result.data;
  } catch (error) {
    throw new Error("Axios Error");
  }
};

const list = async (customer_id) => {
  try {
    const options = {
      baseURL: "https://api.rechargeapps.com",
      url: `/payment_methods`,
      params: { customer_id },
      headers: {
        "Content-Type": "application/json",
        "X-Recharge-Version": "2021-11",
        "X-Recharge-Access-Token": RECHARGE_TOKEN,
      },
      method: "GET",
    };
    const result = await axios(options);
    return result.data;
  } catch (error) {
    throw new Error("Axios Error");
  }
};

const PaymentMethods = {
  update,
  list,
};

export default PaymentMethods;
