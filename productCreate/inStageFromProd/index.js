const buildRestBody = require("../../helpers/buildRestBody");
const {
  cleanProductToCreateRest,
  cleanProductToCreateGraphql
} = require("./cleanProductToCreate.js");
const buildGraphqlQuery = require("../../helpers/buildGraphqlQuery.js");
const fsWriteFile = require("../../helpers/fsWriteFile.js");
const path = require("path");

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

const createProductRest = function(product) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = buildRestBody(
        "/admin/api/2019-10/products.json",
        "POST",
        product
      );
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

const createProductGraphql = function(input) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = `
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const result = buildGraphqlQuery(query, input);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

const createRest = function(id) {
  return new Promise(async function(resolve, reject) {
    try {
      const productFromProd = require(`./products/${id}.json`);
      const cleanProduct = await cleanProductToCreateRest(productFromProd);
      const createdProduct = await createProductRest(cleanProduct);
      resolve(createdProduct);
    } catch (error) {
      reject(error);
    }
  });
};

const createGraph = function(id) {
  return new Promise(async function(resolve, reject) {
    try {
      const productFromProd = require(`./products/${id}.json`);
      const cleanProduct = await cleanProductToCreateGraphql(productFromProd);
      const createdProduct = await createProductGraphql(cleanProduct);
      resolve(createdProduct);
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
      } else if (process.env.NODE_ENV === "stage") {
        let result;
        if (apiType === "rest") {
          result = createRest(id);
        } else if (apiType === "graphql") {
          result = createGraph(id);
        }

        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  });
};

main(1866167910466)
  .then(console.log)
  .catch(error => console.log("Error", error));
