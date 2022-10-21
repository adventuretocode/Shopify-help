import axios from "axios";

const { RECHARGE_TOKEN } = process.env;

const update = async (customerId, data) => {
  try {
    const options = {
      url: `https://api.rechargeapps.com/customers/${customerId}`,
      headers: {
        "Content-Type": "application/json",
        "X-Recharge-Version": "2021-11",
        "X-Recharge-Access-Token": RECHARGE_TOKEN,
      },
      method: "PUT",
      data: data,
    };
    const result = await axios(options);
    return result;
  } catch (error) {
    throw new Error("Axios Error");
  }
};

const Customers = {
  update,
};

export default Customers;
