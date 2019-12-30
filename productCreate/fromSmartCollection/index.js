/**
 * Take down products productions and then
 * Run a second CMD to post product to staging store
 *
 * TODO: Remove the services to its own folder
 * Controller should be able to push and pull from any store.
 */

const getSmartCollectionsProductsIdGraph = require("../../helpers/getSmartCollectionsProductsIdGraph.js");
const cleanIDGraphql = require("../../helpers/cleanIDGraphql.js");
const getProductDetailByIdRest = require("../../helpers/getProductDetailByIdRest.js");
const fsWriteFile = require("../../helpers/fsWriteFile.js");
const createProductRest = require("../../helpers/createProductRest.js");
const path = require("path");
const fs = require("fs");
const {
  cleanProductToCreateRest
} = require("../../helpers/cleanProductToCreate.js");

/**
 * Create
 *
 * @param  {Number[]} arr Array of product Ids
 * @return Void
 */

const logProductsToDesk = function(arr) {
  return new Promise(async function(resolve, reject) {
    try {
      for (let i = 0; i < arr.length; i++) {
        const completeProductDetail = await getProductDetailByIdRest(arr[i]);
        await fsWriteFile(
          path.join(__dirname, `./productsFromProd/${arr[i]}.json`),
          completeProductDetail
        );
        const {
          product: { id, title }
        } = completeProductDetail;
        console.log(
          `\u001b[38;5;${id % 255}m logProductsToDesk ${title}\u001b[0m`
        );
      }
      resolve("success");
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Create products in staging from id
 *
 * @param  {Number[]} arr Array of product Ids
 * @return Void
 */

const createProductRestArray = function(arr) {
  return new Promise(async function(resolve, reject) {
    try {
      for (let i = 0; i < arr.length; i++) {
        const productFromProd = require(`./productsFromProd/${arr[i]}.json`);
        const cleanProduct = await cleanProductToCreateRest(productFromProd);
        const results = await createProductRest(cleanProduct);
        await fsWriteFile(
          path.join(__dirname, `./restResults/${arr[i]}.json`),
          results
        );
        const {
          product: { id, handle }
        } = results;
        console.log(
          `\u001b[38;5;${id % 255}m createProductRestArray ${handle}\u001b[0m`
        );
      }

      resolve("Success");
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Creating all products in a smart collection
 * @param {String} SmartHandle The handle of the smart collection
 */

const main = function(smartHandle) {
  return new Promise(async function(resolve, reject) {
    try {
      const hasProdRan = fs.existsSync(`./productsFromProd/${smartHandle}.json`);
      if (process.env.NODE_ENV === "prod") {
        
        if (hasProdRan) {
          reject("Prod Already Ran");
          return;
        }
        const graphColProducts = await getSmartCollectionsProductsIdGraph(
          smartHandle
        );
        const productIds = graphColProducts.map(item => {
          return cleanIDGraphql(item.node.id);
        });

        await logProductsToDesk(productIds);

        await fsWriteFile(
          path.join(__dirname, `./productsFromProd/${smartHandle}.json`),
          productIds
        );
      } else {
        if (!hasProdRan) {
          reject("Need to run prod");
          return;
        }
        const productIds = require(`./productsFromProd/${smartHandle}.json`);
        await createProductRestArray(productIds);
      }

      resolve("Finished");
    } catch (error) {
      reject(error);
    }
  });
};

main("palmstreet_psychic-blast-protection_odad")
  .then(success => console.log("Success: ", success))
  .catch(error => console.log("Error: ", error));
