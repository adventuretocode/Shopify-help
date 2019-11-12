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
      url: `https://${process.env.SHOP}/admin/api/2019-10/graphql.json`,
      headers: {
        'X-Shopify-Access-Token': process.env.ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
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
 * @returns {Promise}    Return array of ids from the product
 */

const getProductsIdFromTag = function(tag) {
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
        const { data: { products: { edges } }} = await postShopifyGraphQL(query);
        resolve(ids);
      } catch (error) {
        reject(reject);
      }
  });
    
};

