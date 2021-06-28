const buildGraphqlQuery = require("../../helpers/buildGraphqlQuery");

const deleteCustomer = function (gid) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = `
        mutation deleteCustomer($input: CustomerDeleteInput!) {
          customerDelete(input: $input) {
            deletedCustomerId
            userErrors {
              field
              message
            }
          }
        }
      `;

      const input = {
        input: {
          id: gid,
        },
      };

      const result = await buildGraphqlQuery(query, input);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = deleteCustomer;
