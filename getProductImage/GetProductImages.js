require("dotenv").config();
const axios = require("axios");
const path = require("path");

/**
 * Post request to shopify
 *
 * @param   {String}  query     The request object for shopify
 * @param   {Object}  variables variables to pass into the query params
 * @returns {Promise}           Promise object represents the post body
 */

const postShopifyGraphQL = function (query, variables) {
  return new Promise(function (resolve, reject) {
    axios({
      url: `https://${process.env.SHOP}/admin/api/2019-10/graphql.json`,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.ACCESS_TOKEN,
      },
      method: 'post',
      data: {
        query: query,
        variables: variables,
      },
    })
    .then(({ data }) => {
      resolve(data);
    }).catch(error => {
      reject(error)
    })
  });
};

/**
 * Query the admin to get products with specific tags
 *
 * @param   {String} cursor The cursor is the spot where to query from next
 * @returns {Promise}       Return array of ids from the product
 */

const getImagesFromShopify = function(cursor) {
  return new Promise(async function(resolve, reject) {
      const query = `
        query ($numProducts: Int!, $cursor: String) {
          products(first: $numProducts, after: $cursor) {
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
            edges {
              cursor
              node {
                id
                title
                handle
                images(first: 50) {
                  edges {
                    node {
                      originalSrc
                    }
                  }
                }
              }
            }
          }
        }
      `;
      
      const variables = {
        "numProducts": 3,
      }

      if(cursor) {
        variables["cursor"] = cursor;
      }
      
      try {
        const { data } = await postShopifyGraphQL(query, variables);
        resolve(data);
      } catch (error) {
        reject(error);
      }
  });
    
};

/**
 * Parse through shop
 * 
 * @param   {Array<Object>} edges The edges array of the products
 * @returns {Promise<String>}     Promise contains the last cursor 
 */

const processShopifyGraphQLImages = function(edges) {
  return new Promise(async function(resolve, reject) {
    try {
      for(let i = 0; i < edges.length; i+=1) {
        const { node: { id, title, handle, images } } = edges[i];
        const imagesArray = images.edges;
        
        const imageRow = {
          title: title,
          handle: handle,
        }

        if(imagesArray.length > 1) {
          imagesArray.forEach(function(image, i) {
            imageRow["image"+i] = image.node.originalSrc;
          });
        }
        else {
          // TODO: Record the products that don't have images
          imageRow["id"] = id;
          console.log(imageRow);
        }

        // console.log(imageRow);

      }
      resolve(edges[edges.length -1].cursor);
    } 
    catch(error) {
      reject(error);
    }
  });
}

const main = async function() {
  try {
    let keepLooping = true;
    let count = 0;
    let cursor = "";

    while (keepLooping) {
      const { products: { edges, pageInfo: { hasNextPage } } }  = await getImagesFromShopify(cursor);
      const lastCursor = await processShopifyGraphQLImages(edges);
      cursor = lastCursor;

      console.log("cursor", cursor);

      count+=1;
      if(count > 1) {
      // if(!hasNextPage) {
        keepLooping = false;
      }
    }

    return "completed";
  } catch (error) {
    throw error;
  }
};

main()
  .then(results => console.log(results))
  .catch(error => console.log(error));

/**
 * getImagesFromShopify()
    .then(results => console.log(results))
    .catch(error => console.log(error));
 */
