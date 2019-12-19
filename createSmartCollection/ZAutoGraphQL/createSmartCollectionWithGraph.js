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
const apiPostRequest = require("../../helpers/apiPostRequest.js");

const { SHOP, ACCESS_TOKEN } = process.env;

const searchProductByTitle = function(title) {
  return new Promise(async function(resolve, reject) {
    try {
      const query = `
        query mensBasicTeeByTitle($num: Int!, $query: String!) {
          products(first: $num, query: $query) {
            edges {
              node {
                id
                handle
                title
                vendor
                tags
              }
            }
          }
        }
      `;
      const variables = {
        num: 50,
        query: `title:${title} AND product_type:Tee AND tag:style-basic AND tag:gender-mens AND created_at:>2019-11-20`
      };

      const { products } = await buildAxiosQuery(
        query,
        variables,
        SHOP,
        ACCESS_TOKEN
      );
      resolve(products);
    } catch (error) {
      reject(error);
    }
  });
};

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
      } = await buildAxiosQuery(query, variables, SHOP, ACCESS_TOKEN);

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

        const params = {
          url: `https://${SHOP}.myshopify.com/admin/api/2019-10/smart_collections.json`,
          headers: {
            "X-Shopify-Access-Token": ACCESS_TOKEN,
            "Content-Type": "application/json"
          },
          body: postBody
        };

        const { smart_collection } = await apiPostRequest(params);
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
        edges: [item]
      } = await searchProductByTitle(title);
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
