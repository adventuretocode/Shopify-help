const buildGraphqlQuery = require("../../helpers/buildGraphqlQuery");

// gid://shopify/Customer/5324452987060
const getOrdersByCustomerId = function (gid) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = `
				query getOrdersByCustomerId($id: ID!) {
					customer(id: $id) {
						orders(first: 50) {
							edges {
								cursor
								node {
									id
								}
							}
							pageInfo {
								hasNextPage
							}
						}
					}
				}
      `;

      const input = {
        id: gid,
      };

      const result = await buildGraphqlQuery(query, input);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = getOrdersByCustomerId;
