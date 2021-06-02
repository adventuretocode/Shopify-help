const restApiService = require("../../helpers/restApiService.js");
const { ACCESS_TOKEN, SHOP, SHOP_API_V } = process.env;
/**
 * Delete one order from shopify
 * 
 * @param   {Number|String} id Id of the order
 * @return  {Promise}          If return object is empty then delete was successful
 */

const deleteOrder = function(id) {
  return new Promise(async function(resolve, reject) {
    try {
      const options = {
        url: `https://${SHOP}.myshopify.com/admin/api/${SHOP_API_V}/orders/${id}.json`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN
        },
        method: "DELETE"
      };

      const results = await restApiService(options);
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = deleteOrder;
