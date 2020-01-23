const {
  createRestController,
  createGraphController
} = require("./createProducts.js");
const buildRestBody = require("../../helpers/buildRestBody");
const fsWriteFile = require("../../helpers/fsWriteFile.js");

const path = require("path");

/**
 * Find product by id and create an object with all the
 * data necessary to create a new product
 */

const getProductionProductById = function(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const { metafields } = await buildRestBody(
        `/admin/products/${id}/metafields.json`,
        "GET"
      );
      const { product } = await buildRestBody(
        `/admin/products/${id}.json`,
        "GET"
      );
      const completeProduct = { product: { ...product, metafields } };
      await fsWriteFile(
        path.join(__dirname, `./products/${product.id}.json`),
        completeProduct
      );
      resolve(completeProduct);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 *
 * @param  {Number} id       shopify id
 * @param  {String} apiType  "graphql" or "rest"
 */

const main = function(id, apiType = "rest") {
  return new Promise(async function(resolve, reject) {
    try {
      if (process.env.NODE_ENV === "prod") {
        const result = await getProductionProductById(id);
        resolve(result);
        return;
      } else {
        let result;
        if (apiType === "rest") {
          result = await createRestController(id);
        } else if (apiType === "graphql") {
          result = await createGraphController(id);
        }

        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  });
};

main(4320631521328, "rest")
  .then(console.log)
  .catch(error => console.log("Error", error));
