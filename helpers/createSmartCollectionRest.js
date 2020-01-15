require("../config.js");
const apiRequest = require("./apiRequest.js");
const { SHOP, ACCESS_TOKEN } = process.env;

/**
 *  Post body example
 * 
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
  */

/**
 * @param  {{smart_collection:{title:String, rules:[{column:String, relation:String, condition:String}}} postBody zAuto tag from the product
 * @returns {Promise<{Object}>} 
 */

const createSmartCollectionRest = function(postBody) {
  return new Promise(async function(resolve, reject) {
    try {
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
