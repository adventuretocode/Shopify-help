require("dotenv").config();
const request = require("request");
const beautify = require("json-beautify");
const fs = require("fs");
const axios = require("axios");
const cleanData = require("../../../helpers/cleanData.js");

/**
 * Post request to shopify
 *
 * @param   {Object} option The request object for shopify
 * @returns {Promise}       Promise object represents the post body
 */

const postShopify = function(option) {
    return new Promise(function(resolve, reject) {
        request.post(option, function(err, res, body) {
            if (err) {
                reject(err);
            }

            setTimeout(() => {
                resolve(body);
            }, 500);
        });
    });
};

/**
 * 
 * @param   {Array} array 
 * @returns {Object[]}
 */

const cleanEdgesData = function (array) {
    return array.map(function(item) {
        const { node: { id }} = item;
        return { 
          "product_id": id.split("/").pop(),
        };
    });
}

/**
 * Post request to shopify
 *
 * @param   {String}  query The request object for shopify
 * @returns {Promise}       Promise object represents the post body
 */

const postShopifyGraphQL = function (query) {

  return new Promise(function (resolve, reject) {
    axios({
      url: `https://${process.env.SHOP}.myshopify.com/admin/api/2019-10/graphql.json`,
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
          const ids = cleanEdgesData(edges);
          resolve(ids);
        } catch (error) {
          reject(reject);
        }
    });
      
};

/**
 * File system create a file with json object
 *
 * @param   {String} fileName     The name of the file is to be called
 * @param   {Object} jsonObj      The object to be printed on the disk
 * @returns {Promise}             Promise object represents the success or failure of writing to disk
 */

var fsWriteFile = function(fileName, jsonObj) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(fileName, beautify(jsonObj, null, 2, 80), function(err) {
            if (err) {
                reject(err);
            }
            resolve("Success: Writing File");
        });
    });
};

/**
 * 
 * @param {String} tag The tag that is already created on shopify
 * @param {Number} id  Shopify custom collection ID
 */

const recordTag = function(tag, id) {
    return new Promise(async function(resolve, reject) {
        try {
            const json = require('./ZAutoProductColCreatedCustom.json.js.js');
            json[tag] = id;
            await fsWriteFile(`./ZAutoProductColCreatedCustom.json`, json);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
  
};

/**
 * Check if the tag was already recorded in shopify against a json file
 * @param   {String} tag       The tag used to tag items to group them in shopify
 * @returns {Number|undefined} The id of the Custom collection on shopify
 */

const checkTagExist = function(tag) {
    return new Promise(function(resolve, reject) {
        try {
            const json = require('./ZAutoProductColCreatedCustom.json.js.js');
            resolve(json[tag]);
        } catch (error) {
            console.log("Error: checkTagExist - ", tag);
            reject(error);
        } 
    });
}

/**
 * Create Custom Collection
 *
 * @param   {Object} body  The post body of the custom collection
 * @returns {Promise}      Promise object represents the post body
 */

const createCustomCollection = function(body) {
    return new Promise(async function(resolve, reject) {
        const params = {
            url: `https://${process.env.SHOP}.myshopify.com/admin/api/2019-10/custom_collections.json`,
            headers: {
                "X-Shopify-Access-Token": process.env.ACCESS_TOKEN,
                "Content-Type": "application/json"
            },
            body: body,
            json: true
        };
        
        try {
            const customCollectionResponse = await postShopify(params);
            resolve(customCollectionResponse);
        } catch (error) {
            console.log("Error: createCustomCollection - ", body.custom_collection.title);
            reject(error);
        }
    });
};

/**
 * Build the body of the 
 * @param   {Object[]} productIds   Array of product objects with ids
 * @param   {String}   title Title of the custom collection
 * @returns {Number}         The id of the custom collection
 */

const createArtistByZTag = function(productIds, title) {
    const artistHandle = cleanData(title);
    return new Promise(async function(resolve, reject) {
        const postBody = {
          custom_collection: {
              title: `${artistHandle}_mensbasictee`,
              collects: productIds,
          }
        };
    
        try {
            const createdCustomCollection  = await createCustomCollection(postBody);
            const { custom_collection: { handle, id } } = createdCustomCollection;
            await fsWriteFile(`./artistProductCollectionCustom/${handle}.json`, createdCustomCollection);
            await recordTag(title, id);
            resolve(id);
        } catch (error) {
            console.log(" Error: createArtistByZTag - ", title);
            reject(error);
        }
    });
};

/**
 * Check if collection already exist on shopify
 * @param   {String}        tag Tag on shopify
 * @returns {String|Number}     String "Already Created" or the ID of the new custom collection
 */

const checkIfExist = function(tag, title) {
    return new Promise(async function(resolve, reject) {
        try {
            let id = "Already Created";
            const isAlreadyCreated = await checkTagExist(tag);
            if(isAlreadyCreated) {
                console.log("Already Created: ", tag);
            }
            else {
                const productIds = await getProductsIdFromTag(tag);
                id = await createArtistByZTag(productIds, title);
            }
            resolve(id);
        } catch (error) {
            console.log("Error: checkIfExist - ", tag);
            reject(error);
        }
    });
}





/**
 * Main program to run program
 * @param {Object} tagsAndTitle One big object with key value pair with tag and title
 */

const main = async function(tagsAndTitle) {

  for(const tag in tagsAndTitle) {
      try {
          const id = await checkIfExist(tag, tagsAndTitle[tag]);
          const message = id === "Already Created" 
              ? id : `\u001b[38;5;${id % 255}mSuccess: ${tag}\u001b[0m`;
          console.log(message);
      } catch (error) {
          console.log("Error: main - ", error, tag);
          const errorJson = require("./ErrorZAutoProductColCreatedCustom.json.js.js");
          errorJson[tag] = error;
          await fsWriteFile(`./ErrorZAutoProductColCreatedCustom.json`, errorJson);
      }
  }
}

const tagsAndTitle = require("./ZAutoJson.json.js.js");
main(tagsAndTitle);
