const buildGraphqlQuery = require("../../helpers/buildGraphqlQuery");

const findCustomerByEmailWithOrder = function(email) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = `
        query findCustomerByEmail($query: String!) {
          customers(query: $query, first: 1) {
            edges {
              node{
                id
                orders(first: 50) {
                  edges {
                    cursor
                    node{
                      id
                    }
                  }
                  pageInfo {
                    hasNextPage
                  } 
                }
              }
            }
          }
        }
      `;

      const input = {
        "query": email
      }

      const result = await buildGraphqlQuery(query, input);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = findCustomerByEmailWithOrder;
