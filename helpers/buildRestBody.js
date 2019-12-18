require("../config.js");
const apiRequest = require("./apiRequest.js");
const { SHOP, ACCESS_TOKEN } = process.env;



const buildRestBody = function(url, method, body) {
  return new Promise(async function(resolve, reject) {
    try {
      const params = {
        url: `https://${SHOP}.myshopify.com/${url}`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN,
          "Content-Type": "application/json"
        },
        method: method,
        body: body,
        json: true
      };
      const result = await apiRequest(params);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = buildRestBody;
