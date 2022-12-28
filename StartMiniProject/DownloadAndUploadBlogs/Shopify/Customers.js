import {
  buildOptions,
  buildGraphqlOptions,
  networkRequest,
  networkRequestGraphQL,
} from "./base.js";

const remove = async (customer_id) => {
  try {
    const options = buildOptions(`/customers/${customer_id}.json`, "DELETE");
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const listCustomerByQuery = async (customerQuery) => {
  try {
    const query = `
      query listCustomerByQuery($query: String!) {
        customers(query: $query, first: 10) {
          edges {
            cursor
            node {
              id
              firstName
              lastName
              email
            }
          }
        }
      }
    `;

    // https://shopify.dev/api/admin-graphql/2022-07/queries/customers#argument-customers-query
    const input = {
      query: customerQuery,
    };

    const options = buildGraphqlOptions(query, input);
    const result = await networkRequestGraphQL(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const findCustomerByEmailWithOrder = async (email) => {
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
      query: email,
    };

    const options = buildGraphqlOptions(query, input);
    const result = await networkRequestGraphQL(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const deleteCustomerGraphQL = async (gid) => {
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

    const options = buildGraphqlOptions(query, input);
    const result = await networkRequestGraphQL(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const tagCustomer = async (gid, tags) => {
  try {
    const query = `
      mutation tagCustomer ($id: ID!, $tags: [String!]!) {
        tagsAdd(id: $id, tags: $tags) {
          userErrors{
            field
            message
          }
          node {
            id
          }
        }
      }
    `;

    const input = {
      id: gid,
      tags: tags,
    };

    const options = buildGraphqlOptions(query, input);
    const result = await networkRequestGraphQL(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const tagRemove = async (gid, tag) => {
  try {
    const query = `
      mutation tagsRemove($id: ID!, $tags: [String!]!) {
        tagsRemove(id: $id, tags: $tags) {
          node {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const input = {
      id: gid,
      tags: [tag],
    };

    const options = buildGraphqlOptions(query, input);
    const result = await networkRequestGraphQL(options);
    return result;
  } catch (error) {
    throw error;
  }
};


const Customers = {
  remove,
  // GraphQL
  listCustomerByQuery,
  findCustomerByEmailWithOrder,
  deleteCustomerGraphQL,
  tagCustomer,
  tagRemove,
};

export default Customers;
