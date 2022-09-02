import buildGraphqlQuery from "../helpers/buildGraphqlQuery.js";

const findProductBySku = async (sku) => {
  try {
    const query = `
			query findProductBySku($query: String) {
				products(first: 5, query: $query) {
					edges {
						node {
							id
							title
							variants(first: 20) {
								edges {
									node {
										sku
										price
										displayName
										id
									}
								}
							}
						}
					}
				}
			}
    `;

    const input = {
      query: `sku:${sku}`,
    };

    const {
      products: { edges },
    } = await buildGraphqlQuery(query, input);

    if (edges.length > 1) {
      throw new Error("More than 1 product has returned");
    }
    return edges[0].node;
  } catch (error) {
    throw error;
  }
};

export default findProductBySku;
