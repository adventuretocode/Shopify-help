import baseShopifyRequest from "../../helpers/Shopify/baseShopifyRest.js";

/**
 * Get all the product detail by id, including metafields
 *
 * @param  {String|Number} id    The id of the product
 * @return {Object}              The an object with key of product
 */

const getProductDetailByIdRest = async (id) => {
  try {
    const { metafields } = await baseShopifyRequest(
      `/admin/products/${id}/metafields.json`,
      "GET"
    );
    const { product } = await baseShopifyRequest(
      `/admin/products/${id}.json`,
      "GET"
    );
    const productWithMetafield = { product: { ...product, metafields } };
    return productWithMetafield;
  } catch (error) {
    throw error;
  }
};

export default getProductDetailByIdRest;
