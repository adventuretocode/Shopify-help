String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * Get product images and exports to mongo.
 * Mongo then exports out to proper formatted xlsx file
 *
 * getImagesFromShopify is a test function to get images
 *
 */
const { NODE_ENV } = process.env;
const jsonLastKeyAndValue = require("../../helpers/jsonLastKeyAndValue");
const saveProductImageToMongo = require("./GetProductImages.js");
const { getImagesFromShopify } = require("./GetProductImages.js");
const cursorJson = require(`./cursor${NODE_ENV.capitalize()}.json`);

const { lastKey: loopStartAt, lastValue: cursorStartAt } = jsonLastKeyAndValue(
  cursorJson
);

saveProductImageToMongo(cursorStartAt, loopStartAt)
  .then((results) => {
    console.log(results);
    process.exit();
  })
  .catch((error) => console.log("Error: Main - ", error));

// Test just a few products
// saveProductImageToMongo(undefined, 3)
//   .then((results) => {
//     console.log(results);
//     process.exit();
//   })
//   .catch((error) => console.log("Error: Main - ", error));

// Test query if products are received
// getImagesFromShopify(cursor = "eyJsYXN0X2lkIjoxMDMzNDUzMjQwNDQsImxhc3RfdmFsdWUiOiIxMDMzNDUzMjQwNDQifQ==")
//   .then(({ products }) => {
//     const { pageInfo, edges } = products;
//     edges.forEach(({ node }) => {
//       console.log(node);
//     });
//     console.log({ pageInfo });
//   })
//   .catch((error) => console.log(error));
