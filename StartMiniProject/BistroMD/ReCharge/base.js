import axios from "axios";

const { RECHARGE_TOKEN } = process.env;

// TODO: Write docs
export const buildOptions = (url, method, params, data) => {
  // TODO: throw errors if url, method, or data is missing
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
        "X-Recharge-Access-Token": RECHARGE_TOKEN,
      },
    };

    if (!data) delete options.data;
    if (!params) delete options.params;

    return options;
  } catch (error) {
    throw error;
  }
};

export const networkRequest = async (options) => {
  try {
    const result = await axios(options);
    return result.data;
  } catch (error) {
    throw error;
  }
};
