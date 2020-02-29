/**
 * Make One product live
 */

require("dotenv").config({
  path: "./.env.stage",
});
const apiGetRequest = require("../../helpers/apiGetRequest.js");
const apiPutRequest = require("../../helpers/apiPutRequest.js");

const { SHOP, ACCESS_TOKEN } = process.env;

const getSingleProductInfo = function(id) {
  return new Promise(async function(resolve, reject) {
    try {
      const options = {
        url: `https://${SHOP}.myshopify.com/admin/api/2019-10/products/${id}.json`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN
        }
      };
      const { product } = await apiGetRequest(options);
      resolve(product);
    } catch (error) {
      reject(error);
    }
  });
};

const publishedProduct = function(id) {
  return new Promise(async function(resolve, reject) {
    try {

      const options = {
        url: `https://${SHOP}.myshopify.com/admin/api/2019-10/products/${id}.json`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN
        },
        body: {
          product: {
            id: id,
            // true to publish and false hide
            published: true,
          }
        }
      };

      const { product } = await apiPutRequest(options);
      resolve(product);
    } catch (error) {
      reject(error);
    }
  });
};

const main = async function(id) {
  try {
    const product = getSingleProductInfo(id);
    const { published_at } = product;

    if (published_at) {
      return "Already Published";
    } else {
      const shopifyProduct = await publishedProduct(id);
      console.log(shopifyProduct.id);
      return "Published";
    }
  } catch (error) {
    throw error;
  }
};

main(4348923478115)
  .then(data => console.log("Success: ", data))
  .catch(error => console.log("Errors: ", error));

