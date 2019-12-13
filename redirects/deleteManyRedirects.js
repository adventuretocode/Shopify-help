require("dotenv").config({
  path: "../.env.stage"
});
const restApiService = require("../helpers/restApiService.js");
const { SHOP, ACCESS_TOKEN } = process.env;
/**
 * Deleting redirected
 *
 * @param  {String|Number} id The ID of the redirect on shopify
 * @return {Promise}
 */

const deleteRedirect = function(id) {
  return new Promise(async function(resolve, reject) {
    try {
      const options = {
        url: `https://${SHOP}.myshopify.com/admin/api/2019-10/redirects/${id}.json`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN
        },
        method: "DELETE"
      };

      const deletedURL = await restApiService(options);
      resolve(deletedURL);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Deleting redirected
 *
 * @param  {Array<{id: String|Number}>} arr Objects of redirect on shopify
 * @return {Promise}
 */

const deleteManyRedirects = function(arr) {
  return new Promise(async function(resolve, reject) {
    try {
      for (let i = 0; i < arr.length; i++) {
        const {
          redirect: { id, path, target }
        } = arr[i];
        await deleteRedirect(id);
        console.log(`====== Deleted  ======`);
        console.log(`  ${path}`);
        console.log(`  ${target}`);
        console.log(`======================`);
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = deleteManyRedirects;
