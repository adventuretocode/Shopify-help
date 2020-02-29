const buildAxiosQuery = require("../helpers/buildAxiosQuery.js");

/**
 * Get all collections that belong to any product
 *
 * @param  {String} cursor Shopify's graphQLs cursor
 * @returns {Promise<{data: { products: { pageInfo: { hasNextPage:Boolean}, edges:
 * [{cursor:String, node: { handle:String, publishedAt:String, collections: { edges:
 * [{ node: { id:String, handle:String }}]}}}]}}, 
 * extensions: { cost: { requestedQueryCost:Number, actualQueryCost:Number, 
 * throttleStatus: { maximumAvailable:Number, currentlyAvailable:Number, 
 * restoreRate:Number}} }>} Shopify graphql Products
 */

const productsGetCollection = (cursor = "") => {
  return new Promise(async (resolve, reject) => {
    const query = `
      query productSearchForODAD($num: Int!, $curser: String) {
        products(first: $num, after: $curser) {
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              handle
              id
              publishedAt
              collections(first: 10) {
                edges {
                  node {
                    handle
                  }
                }
              }
            }
          }
        }
      }
      `;

    const variables = {
      num: 10
    };

    if (cursor) {
      variables.curser = cursor;
    }

    try {
      const data = await buildAxiosQuery(query, variables);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = productsGetCollection;
