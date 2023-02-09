/**
 * 
 */
require("dotenv").config();
const request = require("request");
const path = require('path');
const fsWriteFile = require("../../helpers/fsWriteFile.js");
const cleanData = require("../../helpers/cleanData");

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
 * Record 
 * @param {String} tag    The tag that is already created on shopify
 * @param {Number} id     Shopify smart collection ID
 * @param {String} handle handle of the product
 */

const recordTag = function(tag, id, handle) {
    return new Promise(async function(resolve, reject) {
        try {
            const json = require(path.join(__dirname, `./createdCollectionSearch${process.env.ENV}.json`));
            json[tag] = id;
            await fsWriteFile(path.join(__dirname, `./createdCollectionSearch${process.env.ENV}.json`), json);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
  
};

/**
 * Check if the tag was already recorded in shopify against a json file
 * @param   {String} tag       The tag used to tag items to group them in shopify
 * @returns {Promise<Number|undefined>} The id of the smart collection on shopify
 */

const checkTagExist = function(tag) {
    return new Promise(function(resolve, reject) {
        try {
            const json = require(path.join(__dirname, `./createdCollectionSearch${process.env.ENV}.json`));
            resolve(json[tag]);
        } catch (error) {
            console.log("Error: checkTagExist - ", tag);
            reject(error);
        } 
    });
}

/**
 * Create Smart Collection
 *
 * @param   {Object} body  The post body of the smart collection
 * @returns {Promise}      Promise object represents the post body
 */

const createSmartCollection = function(body) {
    return new Promise(async function(resolve, reject) {
        const params = {
            url: `https://${process.env.SHOP}.myshopify.com/admin/api/2019-10/smart_collections.json`,
            headers: {
                "X-Shopify-Access-Token": process.env.ACCESS_TOKEN,
                "Content-Type": "application/json"
            },
            body: body,
            json: true
        };
        
        try {
            const smartCollectionResponse = await postShopify(params);
            resolve(smartCollectionResponse);
        } catch (error) {
            console.log("Error: createSmartCollection - ", body.smart_collection.title);
            reject(error);
        }
    });
};

/**
 * Build the body of the 
 * @param   {String} tag   Tag on shopify
 * @param   {String} title Title of the smart collection title will be turned into handle
 * @returns {Number}       The id of the smart collection
 */

const smartCollectionByTag = function(tag, title) {
    return new Promise(async function(resolve, reject) {
        const postBody = {
            smart_collection: {
                title: title,
                rules: [
                    {
                        column: "tag",
                        relation: "equals",
                        condition: tag
                    }
                ]
            }
        };
    
        try {
            const createdSmartCollection  = await createSmartCollection(postBody);
            const { smart_collection: { handle, id } } = createdSmartCollection;
            await fsWriteFile(path.join(__dirname, `./smartCollectionByTag${process.env.ENV}/${handle}.json`), createdSmartCollection);
            await recordTag(tag, id, handle);
            resolve(id);
        } catch (error) {
            console.log(" Error: smartCollectionByTag - ", tag);
            reject(error);
        }
    });
};

/**
 * Check if collection already exist on shopify
 * @param   {String}        tag Tag on shopify
 * @returns {String|Number}     String "Already Created" or the ID of the new smart collection
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
                id = await smartCollectionByTag(tag, title);
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
 * @param {Array} tagsAndTitle One big object with key value pair with tag and title
 */

const main = async function(tags) {

    for(let i = 0; i < tags.length; i+=1) {
        try {
            const title = cleanData(tags[i]);
            const id = await checkIfExist(tags[i], title);
            const message = id === "Already Created" 
                ? id : `\u001b[38;5;${id % 255}mSuccess: ${tags[i]}\u001b[0m`;
            console.log(message);
        } catch (error) {
            console.log("Error: main - ", error, tags[i]);
            const errorJson = require(path.join(__dirname, `./ErrorCollectionSearch${process.env.ENV}.json`));
            errorJson[tags[i]] = error;
            await fsWriteFile(path.join(__dirname, `./ErrorCollectionSearch${process.env.ENV}.json`), errorJson);
            break;
        }
    }
}

const tags = require(path.join(__dirname, `./collectionSearchArray${process.env.ENV}.json`));
main(tags);
