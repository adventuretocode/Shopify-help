const graphQuery = {
  data: {
    orders: {
      pageInfo: {
        hasNextPage: true,
      },
      edges: [
        {
          cursor:
            "eyJsYXN0X2lkIjoyMDM3NDQ2NjA2OTE0LCJsYXN0X3ZhbHVlIjoiMjAyMC0wMi0yOCAyMzowOToxNyJ9",
          node: {
            id: "gid://shopify/Order/2037446606914",
            createdAt: "2020-02-28T23:09:18Z",
            displayFulfillmentStatus: "FULFILLED",
            name: "TF683986",
            lineItems: {
              edges: [
                {
                  node: {
                    fulfillmentStatus: "fulfilled",
                    id: "gid://shopify/LineItem/4469646819394",
                    name: "Diagram of Everything - Womens / Black / L",
                    quantity: 1,
                    vendor: "atteoM",
                    product: {
                      productType: "Tee",
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
  },
  extensions: {
    cost: {
      requestedQueryCost: 65,
      actualQueryCost: 7,
      throttleStatus: {
        maximumAvailable: 2000,
        currentlyAvailable: 1993,
        restoreRate: 100,
      },
    },
  },
};

const query = `
  query ordersFulfilled($first: Int!, $query: String, $cursor: String) {
    orders(first: $first, query: $query, after: $cursor) {
      pageInfo {
        hasNextPage
      }
      edges{
        cursor
        node {
          id
          createdAt
          displayFulfillmentStatus
          name
          lineItems(first: 30) {
            edges {
              node {
                fulfillmentStatus,
                id,
                name,
                quantity,
                vendor,
                product {
                  productType
                }
              }
            }
          }
        }
      }  
    }
  }
`;
