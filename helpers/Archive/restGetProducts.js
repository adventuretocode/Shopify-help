const apiGetRequest = require("./apiGetRequest");

/**
 * Query the admin to get all products but limit amount received
 *
 * @param   {Number} limit     The amount requested from shopify 
 * @param   {Number} page      Paginate through Shopify's items on its server 
 * @returns {Promise<Object[]>} romise object represents the post body
 */

const getProducts = function(limit = 10, page = 1) {
    return new Promise(async function(resolve, reject) {
        const params = {
            url: `https://${process.env.SHOP}.myshopify.com/admin/products.json?limit=${limit}&page=${page}`,
            headers: {
              "X-Shopify-Access-Token": process.env.ACCESS_TOKEN,
              "Content-Type": "application/json",
            },
            json: true,
        };
        
        try {
            const products = await apiGetRequest(params);
            resolve(products);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = getProducts;
