/**
 * Get product images and exports to mongo.
 * Mongo then exports out to proper formatted xlsx file
 *
 * getImagesFromShopify is a test function to get images
 *
 */

const saveProductImageToMongo = require("./GetProductImages.js");
const { getImagesFromShopify } = require("./GetProductImages.js");

const { cursorStartAt, loopStartAt } = {
  cursorStartAt:
    "eyJsYXN0X2lkIjoxMDMzNDUzMjQwNDQsImxhc3RfdmFsdWUiOiIxMDMzNDUzMjQwNDQifQ==",
  loopStartAt: 279,
  loopStopAt: undefined,
};

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
