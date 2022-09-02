const restApiService = require("../../helpers/restApiService.js");
const { ACCESS_TOKEN, SHOP } = process.env;
/**
 * cancel one order from shopify
 * 
 * @param   {Number|String} id Id of the order
 * @return  {Promise}          If return object is empty then delete was successful
 */

const cancelOrder = function(id) {
  return new Promise(async function(resolve, reject) {
    try {
      const options = {
        url: `https://${SHOP}.myshopify.com/admin/api/2020-01/orders/${id}/cancel.json`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN
        },
        method: "POST"
      };

      const results = await restApiService(options);
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = cancelOrder;
