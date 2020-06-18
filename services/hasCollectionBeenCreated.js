require("../config");
const buildGraphqlQuery = require("../helpers/buildGraphqlQuery.js");
const cleanIDGraphql = require("../helpers/cleanIDGraphql.js");

/**
 * Look for a smart collection
 *
 * @param   {String}  title title of the collection to be found
 * @returns {Promise<Boolean>}
 */

const hasCollectionBeenCreatedGraph = (title) => {
  return new Promise(async (resolve, reject) => {
    try {
      const postBody = `
        query searchCollectionByTitle($num: Int!, $query: String!) {
          collections(first: $num, query: $query) {
            edges {
              node {
                id
                handle
                title
              }
            }
          }
        }
      `;

      const query = {
        num: 5,
        query: `title:${title}`,
      };

      const {
        data: {
          collections: { edges },
        },
      } = await buildGraphqlQuery(postBody, query);
      if (edges.length) {
        const isFound = edges.some(({ node }) => {
          const { title: collectionTitle } = node;
          if (collectionTitle === title) {
            return true;
          }
        });

        if (isFound) {
          console.log(
            `\u001b[38;5;${
              cleanIDGraphql(edges[0].node.id) % 255
            }mAlready created: ${edges[0].node.handle}\u001b[0m`
          );
        }
        resolve(isFound);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = hasCollectionBeenCreatedGraph;
