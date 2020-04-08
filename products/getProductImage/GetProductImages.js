require("../../config");
const path = require("path");
const mongojs = require("mongojs");
const buildGraphqlQuery = require("../../helpers/buildAxiosQuery");
const fsAppendFile = require("../../helpers/fsAppendFile.js");
const cleanIDGraphql = require("../../helpers/cleanIDGraphql");

const { NODE_ENV } = process.env;
var db = mongojs("teefury", ["product_images"]);

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * Query the admin to get products with specific tags
 *
 * @param   {String} cursor The cursor is the spot where to query from next
 * @returns {Promise}       Return array of ids from the product
 */

const getImagesFromShopify = async (cursor) => {
  const query = `
    query ($numProducts: Int!, $cursor: String) {
      products(first: $numProducts, after: $cursor) {
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        edges {
          cursor
          node {
            id
            title
            handle
            templateSuffix
            images(first: 50) {
              edges {
                node {
                  originalSrc
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    numProducts: 18,
  };

  if (cursor) {
    variables["cursor"] = cursor;
  }

  try {
    const products = await buildGraphqlQuery(query, variables, 1000);
    return products;
  } catch (error) {
    throw error;
  }
};

/**
 * Parse through shop
 *
 * @param   {Array<Object>} edges The edges array of the products
 * @returns {Promise<String>}     Promise contains the last cursor
 */

const processShopifyGraphQLImages = function (edges) {
  return new Promise(async function (resolve, reject) {
    try {
      const length = edges.length;
      const lastEdge = length - 1;
      for (let i = 0; i < length; i += 1) {
        const {
          node: { id, title, handle, templateSuffix, images },
        } = edges[i];

        if (templateSuffix !== "2019-pdp") {
          console.log("Skip");
          if (i === lastEdge) {
            return resolve(edges[lastEdge].cursor);
          }
          continue;
        }

        const { edges: imagesArray } = images;
        const shopifyId = cleanIDGraphql(id);
        const imageRow = {
          title: title,
          handle: handle,
          shopify_id: shopifyId,
        };

        if (imagesArray.length > 1) {
          imageRow["is_missing_image"] = false;
          imagesArray.forEach(({ node: { originalSrc } }, index) => {
            imageRow["image" + index] = originalSrc;
          });
        } else {
          imageRow["is_missing_image"] = true;
        }

        db.product_images.insert(imageRow, function (error, saved) {
          if (error) {
            reject(error);
          } else {
            console.log(`\u001b[38;5;${shopifyId % 255}m${title}\u001b[0m`);
            return resolve(edges[edges.length - 1].cursor);
          }
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Execute main function
 *
 * @param  {Number}  [stopLoopAtNum] If value exit then the while loop will exit on that iteration.
 *                                   If value does not exist then hasNextPage will determine when loop will exit.
 * @param  {String}  [currentCurser] Start off point where the program last exit
 * @return {Promise}
 */

const main = async (cursorToStart = undefined, stopLoopAt) => {
  try {
    let keepLooping = true,
      iteration = 0,
      currentCurser = cursorToStart;

    while (keepLooping) {
      const {
        products: {
          edges,
          pageInfo: { hasNextPage },
        },
      } = await getImagesFromShopify(currentCurser);
      const cursorFromLastEdge = await processShopifyGraphQLImages(edges);
      currentCurser = cursorFromLastEdge;

      // Log curser to file just incase program dies.
      // If program dies pass cursor into function to start at the same spot again
      await fsAppendFile(
        iteration,
        currentCurser,
        path.join(__dirname, `./cursor${NODE_ENV.capitalize()}.json`)
      );

      // Exit the loop
      if (!hasNextPage || (stopLoopAt ? iteration >= stopLoopAt : false)) {
        keepLooping = false;
        break;
      }

      iteration += 1;
    }

    return "completed";
  } catch (error) {
    throw error;
  }
};

module.exports = main;
module.exports.getImagesFromShopify = getImagesFromShopify;

// Attach other functions to the main then export it
// main.getImagesFromShopify = getImagesFromShopify;
// module.exports = main;
