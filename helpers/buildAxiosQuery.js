require("../config");
const axiosRequest = require("./axiosRequest.js");
const { SHOP, ACCESS_TOKEN } = process.env;

const buildAxiosQuery = function(query, variables, delay) {
  return new Promise(async function(resolve, reject) {
    try {
      const options = {
        url: `https://${SHOP}.myshopify.com/admin/api/2019-10/graphql.json`,
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
