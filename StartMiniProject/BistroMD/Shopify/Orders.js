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

const retrieveTransactionId = async (orderId) => {
  try {
    const query = `
      query getOrderByID($id: ID!) {
        order(id: $id) {
          id
          name
          transactions (capturable: true) {
            id
            status
            kind
            authorizationCode
            authorizationExpiresAt
            totalUnsettledSet {
              presentmentMoney {
                amount
              }
            }
          errorCode
          }    
        }
      }
		`;

    const input = {
      input: {
        id: `gid://shopify/Order/${orderId}`,
      },
    };

    const options = buildGraphqlOptions(query, input);
    const result = await networkRequestGraphQL(options);
    return result;
  } catch (error) {
    throw error;
  }
}

const Orders = {
  // GraphQL
  archive,
  retrieveTransactionId,
};

export default Orders;
