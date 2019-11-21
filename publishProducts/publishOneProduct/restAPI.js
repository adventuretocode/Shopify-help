/**
 * Make One product live
 */

require("dotenv").config();
const apiGetRequest = require("../../helpers/apiGetRequest.js");
const apiPutRequest = require("../../helpers/apiPutRequest.js");
const path = require("path");
const cleanData = require("../../helpers/cleanData.js");
const fsWriteFile = require("../../helpers/fsWriteFile.js");

const { SHOP, ACCESS_TOKEN, ENV } = process.env;
const currentDate = new Date(Date.now()).toISOString();

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
            published: true
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

main("4348927246435")
  .then(data => console.log("Success: ", data))
  .catch(error => console.log("Errors: ", error));

