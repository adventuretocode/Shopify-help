require("../config");
const buildGraphqlQuery = require("../helpers/buildGraphqlQuery.js");
const cleanIDGraphql = require("../helpers/cleanIDGraphql.js");

/**
 * Look for a smart collection
 *
 * @param   {String}  title title of the collection to be found
 * @returns {Promise<Boolean>}
 */

const hasCollectionBeenCreatedGraph = function(title) {
  return new Promise(async function(resolve, reject) {
    try {
      const postBody = `
        query searchCollectionByTitle($num: Int!, $query: String!) {
          collections(first: $num, query: $query) {
            edges {
              node {
                id
                handle
              }
            }
          }
        }
      `;

      const query = {
        num: 1,
        query: `title:${title}`
      };

      const {
        data: {
          collections: { edges }
        }
      } = await buildGraphqlQuery(postBody, query);
      if (edges.length) {
        console.log(
          `\u001b[38;5;${cleanIDGraphql(edges[0].node.id) %
            255}mAlready created: ${edges[0].node.handle}\u001b[0m`
        );
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = hasCollectionBeenCreatedGraph;
