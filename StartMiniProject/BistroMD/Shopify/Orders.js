import {
  buildOptions,
  buildGraphqlOptions,
  networkRequest,
  networkRequestGraphQL,
} from "./base.js";

const archive = async (gid) => {
  try {
    const query = `
      mutation orderClose($input: OrderCloseInput!) {
        orderClose(input: $input) {
          order {
            id
            name
          }
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

    const options = buildGraphqlOptions(query, input);
    const result = await networkRequestGraphQL(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const Orders = {
  archive,
};

export default Orders;
