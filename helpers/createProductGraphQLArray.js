const cleanProductToCreateRest = require("./cleanProductToCreateRest.js");
const 

/**
 * Create products in staging from id
 *
 * @param  {String}   recordFile path.join(__dirname, `./graphqlResults/${arr[i]}.json`);
 * @param  {Number[]} arr        Array of product Ids
 * @return Void
 */

const createProductGraphQLArray = function(recordFile, arr) {
  return new Promise(async function(resolve, reject) {
    try {
      for (let i = 0; i < arr.length; i++) {
        const productFromProd = require(`./productsFromProd/${arr[i]}.json`);
        const cleanProduct = await cleanProductToCreateRest(productFromProd);
        const results = await createProductRest(cleanProduct);
        await fsWriteFile(recordFile, results);
        const {
          data: {
            productCreate: {
              product: { id, handle }
            }
          }
        } = results;
        console.log(
          `\u001b[38;5;${cleanIDGraphql(id) %
            255}m createProductGraphQLArray ${handle}\u001b[0m`
        );
      }

      resolve("Success");
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = createProductGraphQLArray;
