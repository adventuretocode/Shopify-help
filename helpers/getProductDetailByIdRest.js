const buildRestBody = require("../../helpers/buildRestBody");

/**
 * Get all the product detail by id, including metafields
 * 
 * @param  {String|Number} id The id of the product
 * @return {Object}           The an object with key of product
 */

const getProductDetailByIdRest = function(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const { metafields } = await buildRestBody(
        `/admin/products/${id}/metafields.json`,
        "GET"
      );
      const { product } = await buildRestBody(
        `/admin/products/${id}.json`,
        "GET"
      );
      const completeProduct = { product: { ...product, metafields } };
      resolve(completeProduct);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = getProductDetailByIdRest;
