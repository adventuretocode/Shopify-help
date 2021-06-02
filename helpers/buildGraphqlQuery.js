require("../config.js");
const { SHOP, ACCESS_TOKEN, SHOP_API_V } = process.env; 
const axiosRequest = require("./axiosRequest.js");

/**
 * Post request to shopify
 * DEPRECIATING Moving to buildAxiosQuery
 */

const buildGraphqlQuery = function(query, variables, delay) {
  return new Promise(async function(resolve, reject) {
    try {
      const options = {
        url: `https://${SHOP}.myshopify.com/admin/api/${SHOP_API_V}/graphql.json`,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ACCESS_TOKEN
        },
        method: "POST",
        data: {
          query: query,
          variables: variables
        }
      };
      const response = await axiosRequest(options, delay);
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = buildGraphqlQuery;
