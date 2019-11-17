require("dotenv").config();
const axios = require("axios");
const path = require("path");
const appendToJson = require("../helpers/appendToJson");
const cleanIDGraphql = require("../helpers/cleanIDGraphql");

const mongojs = require("mongojs");
var db = mongojs("teefury", ["product_images"]);
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
      if(data.errors) {
        reject(data);
      } 
      else {
        setTimeout(() => {
          resolve(data);
        }, 1000);
      }
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
                templateSuffix
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
        "numProducts": 18,
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
        // 2019-pdp
        const { node: { id, title, handle, templateSuffix, images } } = edges[i];

        if(templateSuffix !== "2019-pdp") {
          console.log("Skip");
          continue;
        }

        const imagesArray = images.edges;
        
        const shopifyId = cleanIDGraphql(id);
        
        const imageRow = {
          title: title,
          handle: handle,
          shopify_id: shopifyId,
        }

        if(imagesArray.length > 1) {
          imageRow["is_missing_image"] = false;
          imagesArray.forEach(function(image, i) {
            imageRow["image"+i] = image.node.originalSrc;
          });
        }
        else {
          imageRow["is_missing_image"] = true;
        }

        db.product_images.insert(imageRow, function(error, saved) {
          if (error) {
            reject(error);
          }
          else {
            console.log(`\u001b[38;5;${shopifyId % 255}m${title}\u001b[0m`);
            resolve(edges[edges.length -1].cursor);
          }
        });
      }
    } 
    catch(error) {
      reject(error);
    }
  });
}

const main = async function() {
  try {
    let keepLooping = true;
    let count = 871;
    let cursor = "eyJsYXN0X2lkIjo0MzA0NDI2NzYyMzA2LCJsYXN0X3ZhbHVlIjoiNDMwNDQyNjc2MjMwNiJ9";

    while (keepLooping) {
      const { products: { edges, pageInfo: { hasNextPage } } }  = await getImagesFromShopify(cursor);
      const lastCursor = await processShopifyGraphQLImages(edges);
      cursor = lastCursor;

      await appendToJson(count, cursor, path.join(__dirname, `./cursor${process.env.ENV}.json`));

      count+=1;
      // if(count > 5) {
      if(!hasNextPage) {
        keepLooping = false;
      }
    }

    return "completed";
  } catch (error) {
    throw error;
  }
};

// main()
//   .then(results => { 
//       console.log(results);
//       process.exit();
//   })
//   .catch(error => console.log("Error: Main - ",error));

var findAll = function() {

  db.product_images.find({}, function(err, data) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(data);
    }

    process.exit();

  });
}

// findAll();
  
var removeAll = function() {
  db.product_images.remove({}, function(error, response) {
    if (error) {
      console.log(error);
    }
    else {
      console.log(response);
    }

    process.exit();
  });

}

// removeAll();
  
/**
 * getImagesFromShopify()
    .then(results => console.log(results))
    .catch(error => console.log(error));
 */
