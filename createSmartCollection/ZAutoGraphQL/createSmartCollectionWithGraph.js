/**
 * Creating smart collection via graphQL
 *
 * Inputs an array of product names
 * Checks shopify if a smart collection already been made
 * Create smart collection not already been created
 */

require("../../config");
const cleanData = require("../../helpers/cleanData.js");
const buildAxiosQuery = require("../../helpers/buildAxiosQuery.js");
const searchMensBasicTeeByTitleGraph = require("../../helpers/searchMensBasicTeeByTitleGraph.js");

const hasCollectionBeenCreated = function(collectionTitle) {
  return new Promise(async function(resolve, reject) {
    try {
      const query = `
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

      const variables = {
        num: 1,
        query: `title:${collectionTitle}`
      };

      const {
        collections: { edges }
      } = await buildAxiosQuery(query, variables);

      if (edges.length) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

const createSmartCollection = function(collectionTitle, ZAutoTag) {
  return new Promise(async function(resolve, reject) {
    try {
      const hasBeenCreated = await hasCollectionBeenCreated(collectionTitle);
      if (hasBeenCreated) {
        resolve({
          id: Math.floor(Math.random() * 255) + 1,
          handle: `Already Created: ${collectionTitle}`
        });
      } else {
        const { smart_collection } = await createSmartCollectionZAuto(
          collectionTitle,
          ZAutoTag
        );
        resolve(smart_collection);
      }
    } catch (error) {
      reject(error);
    }
  });
};

const extractZAutoTag = function(title) {
  return new Promise(async function(resolve, reject) {
    try {
      const {
        products: {
          edges: [item]
        }
      } = await searchMensBasicTeeByTitleGraph(title);
      const {
        node: { vendor, tags }
      } = item;

      for (let i = tags.length - 1; i > 0; i -= 1) {
        if (~tags[i].indexOf("ZAuto_gallery")) {
          const cleanVendor = cleanData(vendor);
          const cleanTitle = cleanData(title);
          const { id, handle } = await createSmartCollection(
            `${cleanVendor}_${cleanTitle}`,
            tags[i]
          );
          resolve({ id, handle });
          break;
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

const main = async function(arr) {
  for (let i = 0; i < arr.length; i += 1) {
    try {
      const { id, handle } = await extractZAutoTag(arr[i]);
      console.log(`\u001b[38;5;${id % 255}mSuccess: ${handle}\u001b[0m`);
    } catch (error) {
      const errorJson = require(path.join(
        __dirname,
        `./Error${process.env.ENV}.json`
      ));

      errorJson[arr[i]] = error;
      await fsWriteFile(
        path.join(__dirname, `./Error${process.env.ENV}.json`),
        errorJson
      );

      throw error;
    }
  }
  return "completed";
};

module.exports = main;
