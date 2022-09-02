/**
 * Creating smart collection via graphQL
 *
 * Inputs an array of product names
 * Checks shopify if a smart collection already been made
 * Create smart collection not already been created
 */

require("../../../config");
const cleanData = require("../../../helpers/cleanData.js");
const buildAxiosQuery = require("../../../helpers/buildAxiosQuery.js");
const searchMensBasicTeeByTitleGraph = require("../../../helpers/searchMensBasicTeeByTitleGraph.js");
const fsWriteFile = require("../../../helpers/fsWriteFile");
const createSmartCollectionRest = require("../../../helpers/createSmartCollectionRest.js");
const createFileIfNotExist = require("../../../helpers/createFileIfNotExist.js");
const path = require("path");
const { NODE_ENV, STORE } = process.env;
const errorFileName = `./Error/Error-${NODE_ENV}-${STORE}.json`;

/**
 * @summary Check if collection has been created or not
 * @param   {String} collectionTitle Title of the collection
 * @returns {Promise<Boolean>}       True or false if the collection already been created
 */

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

/**
 * Create new smart collection by tags
 * 
 * @param   {String} collectionTitle The title of the collection
 * @param   {String} ZAutoTag        The tag used to group the products together
 * @returns {Promise<{admin_graphql_api_id:String, body_html:String, handle:String, id:Number, published_at:String, rules:String[], title:String, sort_order:String, template_suffix:String, updated_at:String, published_scope:String }>}
 */

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
        const postBody = {
          smart_collection: {
            title: collectionTitle,
            rules: [
              {
                column: "tag",
                relation: "equals",
                condition: ZAutoTag
              }
            ]
          }
        };
        const { smart_collection } = await createSmartCollectionRest(postBody);
        resolve(smart_collection);
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Extract and create smart collection form ZAuto tag
 * 
 * @param   {Array<{node: { vendor:String, tags:[String]}}>} edges All the products found on shopify
 * @returns {Promise<{id:Number, handle:String}>}
 */

const extractZAutoTag = function(edges) {
  return new Promise(async function(resolve, reject) {
    try {
      for (let z = 0; z < edges.length; z += 1) {
        const {
          node: { vendor, tags, title }
        } = edges[z];

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
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Create Smart Collection with graphql controller
 * 
 * @param  {String[]} arr Array of product titles that need to be group together.
 * @return {String}
 */

const main = async function(arr) {
  for (let i = 0; i < arr.length; i += 1) {
    try {
      const {
        products: { edges }
      } = await searchMensBasicTeeByTitleGraph(arr[i]);
      const { id, handle } = await extractZAutoTag(edges);
      console.log(`\u001b[38;5;${id % 255}mSuccess: ${handle}\u001b[0m`);
    } catch (error) {
      await createFileIfNotExist(path.join(__dirname, errorFileName));
      const errorJson = require(path.join(__dirname, errorFileName));

      errorJson[arr[i]] = error;
      await fsWriteFile(path.join(__dirname, errorFileName), errorJson);

      throw error;
    }
  }
  return "completed";
};

module.exports = main;
