require("dotenv").config();
const request = require("request");
const beautify = require("json-beautify");
const fs = require("fs");
const axios = require("axios");

/**
 * Post request to shopify
 *
 * @param   {String}  query The request object for shopify
 * @returns {Promise}       Promise object represents the post body
 */

const postShopifyGraphQL = function (query) {

  return new Promise(function (resolve, reject) {
    axios({
      headers: {
        'X-Shopify-Access-Token': process.env.ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      url: `https://${process.env.SHOP}.myshopify.com/admin/api/2019-10/graphql.json`,
      method: 'post',
      data: {
        query: query,
      },
    })
    .then(result => {
      resolve(result.data)
    }).catch(error => {
      reject(error)
    })
  });
};


/**
 * Query the admin to get products with specific tags
 *
 * @param   {Number} tag The tag to be found on shopify
 * @returns {Promise}      Promise object represents the post body
 */

const getProductsGraphQL = function(tag) {
    return new Promise(async function(resolve, reject) {
        const query = `
          query {
            products(first:50, query:"tag:${tag}") {
              pageInfo {
                hasNextPage
              }
              edges {
                cursor
                node {
                  id,
                }
              }
            }
          }
        `;
        try {
          const results = await postShopifyGraphQL(query);
          resolve(results);
        } catch (error) {
          reject(reject);
        }
    });
      
};

getProductsGraphQL().then(function(products){
    console.log(products);
})
.catch(function(error) {
    console.log("Error: ", error)
});