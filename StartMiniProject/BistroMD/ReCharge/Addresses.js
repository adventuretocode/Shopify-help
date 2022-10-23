import { buildOptions, networkRequest } from "./base.js";

const update = async (address_id, body) => {
  try {
    const options = buildOptions(
      `/addresses/${address_id}`,
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

const list = async (customer_id) => {
  try {
    const options = buildOptions(`/addresses`, "GET", {
      customer_id: customer_id,
    });
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw new Error("Axios Error");
  }
};

// curl 'https://api.rechargeapps.com/addresses/91977136/charges/skip' \ 
//  -H 'X-Recharge-Version: 2021-11' \ 
//  -H 'Content-Type: application/json' \ 
//  -H 'X-Recharge-Access-Token: your_api_token' \ 
//  -d '{"date": "2022-09-15", "purchase_item_ids": [27363808, 27363809]}'

const Address = {
  update,
  list,
};

export default Address;
