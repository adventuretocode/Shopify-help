const axiosRequest = require("./axiosRequest.js");

const buildGraphqlQuery = function(query, variables, shop, access_token, delay) {
  return new Promise(async function(resolve, reject) {
    try {
      const options = {
        url: `https://${shop}.myshopify.com/admin/api/2019-10/graphql.json`,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": access_token
        },
        method: "post",
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
