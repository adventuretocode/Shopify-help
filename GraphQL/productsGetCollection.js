const buildAxiosBody = require("../helpers/buildAxiosBody.js");

/**
 * Get all collections that belong to any product
 * 
 * @param  {String} cursor Shopify's graphQLs cursor
 * @returns {Promise<{data: { products: }, extensions: { cost: { requestedQueryCost:Number, actualQueryCost:Number, throttleStatus: { maximumAvailable:Number, currentlyAvailable:Number, restoreRate:Number}}}}>}
 */


const productsGetCollection = (cursor = '') => {
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
              publishedAt
              collections(first: 10) {
                edges {
                  node {
                    id
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
      num: 1
    };

    if (curser) {
      variables.curser = cursor;
    }

    try {
      const { data } = await buildAxiosBody(query, variables);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = productsGetCollection;
