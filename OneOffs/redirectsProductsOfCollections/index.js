const buildAxiosBody = require("../../helpers/buildAxiosBody.js");
// Get all products in collection.
// Find the product that is not published
// Concat the collection handle with the product


const productsGetCollection = function(cursor) {
    const query = `
    query productSearchForODAD($num: Int!, $curser: String) {
      products(first: $num, after: $curser) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            handle
            publishedAt
            collections(first: 10) {
              edges {
                node {
                  id
                  handle
                }
              }
            }
          }
        }
      }
    }
    `;

    const variables = {
      "num": 10,
    }

    if(curser) {
      variables.curser = cursor;
    }

    try {
      const { data } = await buildAxiosBody(query, variables);
      resolve(data);
    } catch (error) {
      reject(error);
    }

}

const main = function() {
  return new Promise(async function(resolve, reject) {
    try {
      
    } catch (error) {
      reject(error);
    }
  });
}