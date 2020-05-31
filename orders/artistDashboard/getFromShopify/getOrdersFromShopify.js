const buildAxiosQuery = require("../../../helpers/buildAxiosQuery");

// Get the last hour's orders over lap by 10 minutes
// or product type from shopify
// select the commissions_payout tables
// Input the line items order, commissions_payout, and product type.

/**
 * @summary  Get all orders from shopify to upload onto database 1 time
 * @param   {String} cursor     Shopify's graphQLs cursor
 * @param   {String} date       Date: 2020-05-13
 * @param   {String} startTime  Start of the hour
 * @param   {String} endTime    End of the hour
 * @returns {Promise<>}
 */

const getOrdersFromShopify = (cursor = "", date, startTime, endTime) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = `
        query ordersFulfilled($first: Int!, $query: String, $cursor: String) {
          orders(first: $first, query: $query, after: $cursor) {
            pageInfo {
              hasNextPage
            }
            edges {
              cursor
              node {
                id
                createdAt
                name
                lineItems(first: 30) {
                  edges {
                    node {
                      title
                      sku
                      vendor
                      quantity
                      product {
                        productType
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const variables = {
        first: 5,
      };

      if (cursor) {
        variables.cursor = cursor;
      } else {
        variables.query = `created_at:>='${date}T${startTime}:00:00-04:00' AND created_at:<='${date}T${endTime}:00:00-04:00'`;
      }

      const response = await buildAxiosQuery(query, variables);
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = getOrdersFromShopify;
