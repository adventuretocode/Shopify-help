const buildGraphqlQuery = require("./buildGraphqlQuery.js");

/**
 * Create product from graphQL
 * 
 * @param  {Object} input must be cleaned with function cleanProductToCreateGraphql
 * @return {Promise<{}>}
 */
const createProductGraphql = function(input) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = `
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
              handle
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const result = await buildGraphqlQuery(query, input);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = createProductGraphql;
