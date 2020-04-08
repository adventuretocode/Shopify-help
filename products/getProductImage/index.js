/**
 * Get product images and exports to mongo.
 * Mongo then exports out to proper formatted xlsx file
 *
 * getImagesFromShopify is a test function to get images
 *
 */

const saveProductImageToMongo = require("./GetProductImages.js");

saveProductImageToMongo(undefined, 3)
  .then((results) => {
    console.log(results);
    process.exit();
  })
  .catch((error) => console.log("Error: Main - ", error));

// Test just a few products
// main(undefined, 3)
//   .then((results) => {
//     console.log(results);
//     process.exit();
//   })
//   .catch((error) => console.log("Error: Main - ", error));

// Test query if products are received
// main.getImagesFromShopify()
//   .then((results) => console.log(results))
//   .catch((error) => console.log(error));
