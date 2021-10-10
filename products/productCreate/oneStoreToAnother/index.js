const buildRestBody = require("../../../helpers/buildRestBody");
const {
  cleanProductToCreateRest,
  cleanProductToCreateGraphql,
} = require("../../../helpers/cleanProductToCreate.js");
const buildGraphqlQuery = require("../../../helpers/buildGraphqlQuery.js");
const fsWriteFile = require("../../../helpers/fsWriteFile.js");
const path = require("path");
const { API_VERSION } = process.env;

const getProductionProductById = async (id) => {
  try {
    const { product } = await buildRestBody(
      `/admin/api/${API_VERSION}/products/${id}.json`,
      "get"
    );

    const { metafields } = await buildRestBody(
      `/admin/api/${API_VERSION}/products/${id}/metafields.json`,
      "GET"
    );

    const completeProduct = { product: { ...product, metafields } };
    await fsWriteFile(
      path.join(__dirname, `./products/${product.id}.json`),
      completeProduct
    );
    return completeProduct;
  } catch (error) {
    console.log("fails");
    throw error;
  }
};

const createProductRest = function (product) {
  return new Promise(async function (resolve, reject) {
    try {
      const result = buildRestBody(
        `/admin/api/${API_VERSION}/products.json`,
        "POST",
        product
      );
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

const createProductGraphql = function (input) {
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

const createRest = function (id) {
  return new Promise(async function (resolve, reject) {
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

const createGraph = function (id) {
  return new Promise(async function (resolve, reject) {
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
 * Get product json from original store
 * @param  {Number} id       shopify id
 */

const getFromFirstStore = async (id) => {
  try {
    const result = await getProductionProductById(id);
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * @summary Post to the new store
 * @param   {Number} id       shopify id
 * @param   {String} apiType  "graphql" or "rest"
 */

const postToNewStore = (id, apiType) => {
  return new Promise(async (resolve, reject) => {
    try {
      let result;
      if (apiType === "rest") {
        result = createRest(id);
      } else if (apiType === "graphql") {
        result = createGraph(id);
      }

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

// npm run blueland-production && npm run blueland-development

const productId = 4617471787123;
const { NODE_ENV } = process.env;

const main = async () => {
  if (NODE_ENV === "prod") {
    try {
      const result = await getFromFirstStore(productId);
      console.log(result);
    } catch (error) {
      console.log("Error:", error);
      throw error;
    }
  } else if (NODE_ENV === "dev") {
    try {
      const result = await postToNewStore(productId, "graphql");
      console.log(result);
    } catch (error) {
      console.log("Error:", error);
      throw error;
    }
  }
};

main();
