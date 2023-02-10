const apiGetRequest = require("./apiGetRequest.js");

/**
 * Query the admin to get all products but limit amount received
 *
 * @param   {String}          shop  The stage that is being used
 * @param   {String}          token Shopify API key
 * @param   {Number}          limit The amount requested from shopify 
 * @param   {Number}          page  Paginate through Shopify's items on its server 
 * @returns {Promise<Object>}      Promise object represents the post body
 */

const getAllProducts = function(shop, token, limit = 10, page = 1) {
  return new Promise(async function(resolve, reject) {
    const params = {
      url: `https://${shop}.myshopify.com/admin/products.json?limit=${limit}&page=${page}`,
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json"
      }
    };

    try {
      const products = await apiGetRequest(params);
      resolve(products);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = getAllProducts;
