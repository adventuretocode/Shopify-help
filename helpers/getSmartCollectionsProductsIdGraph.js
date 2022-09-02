const buildGraphqlQuery = require("./buildGraphqlQuery.js");

/**
 * Get product details of smart collection's products
 *
 * @param  {String} handle
 * @return {Promise<Array<{node:{id:String, handle:String}>} Array of products in object node
 */

const getSmartCollectionsProductsIdGraph = function(handle) {
  return new Promise(async function(resolve, reject) {
    try {
      const query = `
      query searchCollectionsByHandleAndGetProducts($num: Int!, $handle: String!) {
        collectionByHandle(handle: $handle) {
          id
          products(first: $num) {
            edges {
              node {
                id
                handle
              }
            }
          }
        }
      }
      `;

      const input = {
        num: 50,
        handle: handle
      };

      const {
        data: { collectionByHandle }
      } = await buildGraphqlQuery(query, input);

      if (collectionByHandle) {
        const { products: { edges } } = collectionByHandle;
        resolve(edges);
      } else {
        reject("Collection not found");
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = getSmartCollectionsProductsIdGraph;
