require("../config.js");
const apiRequest = require("./apiRequest.js");
const { SHOP, ACCESS_TOKEN } = process.env;

/**
 * @param  {String} ZAutoTag zAuto tag from the product
 * @param  {String} title    Title of the collection
 */

const createSmartCollectionRest = function(title, ZAutoTag) {
  return new Promise(async function(resolve, reject) {
    try {
      const postBody = {
        smart_collection: {
          title: title,
          rules: [
            {
              column: "tag",
              relation: "equals",
              condition: ZAutoTag
            }
          ]
        }
      };

      const params = {
        url: `https://${SHOP}.myshopify.com/admin/api/2019-10/smart_collections.json`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN,
          "Content-Type": "application/json"
        },
        method: "POST",
        json: true,
        body: postBody
      };
      
      const results = await apiRequest(params);
      resolve(results);
      
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = createSmartCollectionRest;
