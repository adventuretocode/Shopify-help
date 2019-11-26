const axiosRequest = require("./axiosRequest.js");

const buildAxiosQuery = function(query, variables, shop, access_token, delay) {
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
      const {
        data,
        extensions: { cost }
      } = await axiosRequest(options, delay);
      
      const {
        throttleStatus: { currentlyAvailable }
      } = cost;
      
      if (currentlyAvailable < 1000) {
        console.log("currentlyAvailable: ", currentlyAvailable);
        setTimeout(() => {
          resolve(data);
        }, 2000);
      } else {
        resolve(data);
      }

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = buildAxiosQuery;
