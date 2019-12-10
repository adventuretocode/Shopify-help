require("../config.js");
const cleanDataOdadHandle = require("../helpers/cleanDataOdadHandle.js");
const apiPostRequest = require("../helpers/apiPostRequest.js");
const { SHOP, ACCESS_TOKEN } = process.env;
console.log(SHOP, ACCESS_TOKEN);
/**
 * Using rest to redirect. No graphql option available
 * 
 * @param  {String|Number} id Id of the product
 * @return Void
 */

const redirectProductRest = function(handle) {
  return new Promise(async function(resolve, reject) {
    try {
      const options = {
        url: `https://${SHOP}.myshopify.com/admin/api/2019-10/redirects.json`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
        body: {
          "redirect": {
            "path": "/product/" + handle,
            "target": "/product/" + cleanDataOdadHandle(handle)
          }
        }
      };

      const redirect = await apiPostRequest(options);
      resolve(redirect);
    } catch (error) {
      reject(error);
    }
  });
}

const main = function(handle) {
  return new Promise(async function(resolve, reject) {
    try {
      const redirect = await redirectProductRest(handle);
      resolve(redirect);
    } catch (error) {
      reject(error);
    }
  });
}

main("odad-tee-womens-fitted-news-flash")
  .then(data => console.log("success", data))
  .catch(error => console.log("error", error));

