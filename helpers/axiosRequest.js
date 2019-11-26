const axios = require("axios");

/********************************
const SHOP = "";
const ACCESS_TOKEN = "";
const exampleQuery = {
  url: `https://${SHOP}.myshopify.com/admin/api/2019-10/graphql.json`,
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': ACCESS_TOKEN,
  },
  method: 'post',
  data: {
    query: query,
    variables: variables,
  },
}
*******************************/

/**
 * Post request to shopify
 *
 * @param   {Object}  query Request body
 * @param   {Number}  delay Delay of request for rapid request
 * @returns {Promise}       Promise object represents the post body
 */

const postShopifyGraphQL = function (query, delay = 500) {
  return new Promise(function (resolve, reject) {
    axios(query)
      .then(({ data }) => {
        if(data.errors) {
          reject(data);
        } 
        else {
          setTimeout(() => {
            resolve(data);
          }, delay);
        }
      }).catch(error => {
        reject(error)
      });
  });
};

module.exports = postShopifyGraphQL;
