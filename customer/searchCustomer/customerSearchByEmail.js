const buildGraphqlQuery = require("../../helpers/buildGraphqlQuery");

const findCustomerByEmail = function(email) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = `
        query findCustomerByEmail($query: String!) {
          customers(query: $query, first: 10) {
            edges {
              cursor
              node{
                id
                firstName
                lastName
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

module.exports = findCustomerByEmail;
