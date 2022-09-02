require("../config.js");
const axios = require("axios");
const { SHOP, ACCESS_TOKEN, API_VERSION } = process.env;

/********************************
const SHOP = "";
const ACCESS_TOKEN = "";
const exampleQuery = {
  url: `https://${SHOP}.myshopify.com/admin/api/2019-10/graphql.json`,
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': ACCESS_TOKEN,
  },
  method: 'POST',
  data: {
    query: query,
    variables: variables,
  },
}
*******************************/

const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const buildGraphqlQuery = async (query, variables) => {
  try {
    const options = {
      url: `https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json`,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ACCESS_TOKEN,
      },
      method: "POST",
      data: {
        query: query,
        variables: variables,
      },
    };

    const result = await axios(options);
    const { data, extensions, errors } = result.data;

    if (errors) { throw errors; }

    const { cost } = extensions;

    const {
      throttleStatus: { currentlyAvailable },
    } = cost;

    if (currentlyAvailable < 1000) {
      console.log("currentlyAvailable: ", currentlyAvailable);
      await sleep(2000);
    }
    return data;
  } catch (error) {
    throw error;
  }
};

module.exports = buildGraphqlQuery;
