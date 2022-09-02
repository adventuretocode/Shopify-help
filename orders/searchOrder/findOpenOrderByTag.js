const buildGraphqlQuery = require("../../helpers/buildGraphqlQuery");

const findOrderByTag = async (first, tag, cursor) => {
  try {
    const query = `
				query findOrderByTag($first: Int!, $query: String, $after: String) {
					orders(first: $first, query: $query, after: $after) {
						edges {
							node {
								id
								name
								tags
								email
								customer {
									tags
								}
							}
							cursor
						}
						pageInfo {
							hasNextPage
							hasPreviousPage
						}
					}
				}
      `;

    const input = {
      first: first,
      query: `status:'open' AND tag:'${tag}'`,
    };

    if (cursor) {
      input.after = cursor;
    }

    const result = await buildGraphqlQuery(query, input);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = findOrderByTag;
