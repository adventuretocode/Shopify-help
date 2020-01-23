const restApiService = require("../../helpers/restApiService.js");
const { ACCESS_TOKEN, SHOP } = process.env;
/**
 * Get all orders from shopify
 * 
 * @returns {Promise<[Orders]>}  Array of orders
 */

const getAllOrders = function() {
  return new Promise(async function(resolve, reject) {
    try {
      const options = {
        url: `https://${SHOP}.myshopify.com/admin/api/2020-01/orders.json`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN
        },
        method: "GET"
      };

      const { orders } = await restApiService(options);
      resolve(orders);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = getAllOrders;
