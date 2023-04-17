import baseAdminShopifyRequest from "../helper/baseAdminShopifyRest.js";

/**
 * Get all the product detail by id, including metafields
 *
 * @param  {String|Number} collectionId The id of the collection
 * @return {Object}                     Entire Shopify payload from Axios { config, data, headers, request, status, statusText }
 */

const retrieveProductsByCollection = async (
  collectionId,
  pageInfo,
  limit = 250
) => {
  const params = { limit };
  if (pageInfo) {
    params.page_info = pageInfo;
  } else {
    params.collection_id = collectionId;
  }

  try {
    const result = await baseAdminShopifyRequest("products", "GET", params);
    return result;
  } catch (error) {
    throw error;
  }
};

export default retrieveProductsByCollection;
