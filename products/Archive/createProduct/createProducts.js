const {
  cleanProductToCreateRest,
  cleanProductToCreateGraphql
} = require("../../../helpers/cleanProductToCreate.js");
const buildRestBody = require("../helpers/buildRestBody");
const buildGraphqlQuery = require("../helpers/buildGraphqlQuery.js");

/**
 * Sending Product object to be created via rest
 * 
 * @param  {Object}  product The shopify product object cleaned
 * @return {Promise<{Object}>}
 */

const createProductRest = function(product) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await buildRestBody(
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

/**
 * Sending Product object to be created via Graphql
 * 
 * @param  {Object}  input The shopify product object cleaned
 * @return {Promise<{Object}>}
 */

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

      const result = await buildGraphqlQuery(query, input);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Controller to clean the product then sending it to be created via Rest
 * 
 * @param  {String|Number} id  The id of the project. should have written to desk
 * @return {Promise<{Object}>}
 */

exports.createRestController = function(id) {
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

/**
 * Controller to clean the product then sending it to be created via Graphql
 * 
 * @param  {String|Number} id  The id of the project. should have written to desk
 * @return {Promise<{Object}>}
 */

exports.createGraphController = function(id) {
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
