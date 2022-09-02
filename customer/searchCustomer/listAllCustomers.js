const buildGraphqlQuery = require("../../helpers/buildGraphqlQuery");

const listAllCustomers = function(number = 10) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = `
				query findCustomersWhoAreNotB2B($query: String!) {
					customers(query: $query, first: ${number}) {
						edges {
							node{
								id
								email
								tags
							}
						}
					}
				}
      `;

      const input = {
        "query": "NOT B2B"
      }

      const result = await buildGraphqlQuery(query, input);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = listAllCustomers;
