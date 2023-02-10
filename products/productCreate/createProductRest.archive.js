const buildRestBody = require("./buildRestBody.js");

/**
 * Service for posting the a product to shopify
 */

const createProductRest = function(product) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = buildRestBody(
        "/admin/api/2019-10/products.json",
        "POST",
        product
      );
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = createProductRest;
