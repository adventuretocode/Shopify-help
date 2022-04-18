import buildGraphqlQuery from "../helpers/buildGraphqlQuery.js";

const findOrderIdByName = async (name) => {
  try {
    const query = `
      query findOrderByName($query: String!) {
        orders(first: 2, query: $query) {
          nodes {
            id
          }
        }
      }
    `;

    const input = {
      query: `name:${name}`,
    };

    const {
      orders: { nodes },
    } = await buildGraphqlQuery(query, input);

    if (nodes.length > 1) {
      throw new Error("More than 1 order has returned");
    }
    return nodes[0];
  } catch (error) {
    throw error;
  }
};

export default findOrderIdByName;
