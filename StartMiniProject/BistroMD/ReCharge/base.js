import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: `./.env` });

const {
  RECHARGE_TOKEN_0,
  RECHARGE_TOKEN_1,
  RECHARGE_TOKEN_2,
  RECHARGE_TOKEN_3,
} = process.env;

let keyNum = 1;

// TODO: Write docs
const buildOptions = (url, method, params, data) => {
  try {
    const options = {
      url: url,
      method: method,
      params: params,
      data: data,
      baseURL: `https://api.rechargeapps.com`,
      headers: {
        "Content-Type": "application/json",
        "X-Recharge-Version": "2021-11",
        "X-Recharge-Access-Token": process.env[`RECHARGE_TOKEN_${keyNum % 4}`],
      },
    };

    if (!data) delete options.data;
    if (!params) delete options.params;

    return options;
  } catch (error) {
    throw error;
  }
};

const networkRequest = async (options) => {
  while (true) {
    try {
      const result = await axios(options);
      return result.data;
    } catch (error) {
      if (error?.response?.data?.warning === "too many requests") {
        keyNum += 1;
      } else {
        throw error;
      }
    }
  }
};

export { buildOptions, networkRequest };
