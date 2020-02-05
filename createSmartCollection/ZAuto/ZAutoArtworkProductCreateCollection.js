/**
 * Creating smart collection with Z tag with title and handle
 * Naming convention artist_artwork
 * 
 * Must Run ZAutoJsonCreate.js first to to build the ZAuto tags
 * 
 * It will check from `./createdCollection/ZAutoProduct-${NODE_ENV}-${STORE}.json` 
 * to see if the collection has already been created
 * 
 * This fill will create the smart tags on shopify based on
 * the file `ZAutoJsonWithID{process.env.ENV}.json`
 * 
 * On Success it will record down the return JSON 
 * in the folder `./artistProductCollection${process.env.ENV}/`
 * 
 * And Also log into `./createdCollection/ZAutoProduct-${NODE_ENV}-${STORE}.json`
 * 
 */

require("../../config.js");
const request = require("request");
const path = require('path');
const fsWriteFile = require("../../helpers/fsWriteFile.js");
const createFileIfNotExist = require("../../helpers/createFileIfNotExist.js");
const { ACCESS_TOKEN, SHOP, NODE_ENV, STORE  } = process.env;
const createErrorJsonFileName = `./createdCollection/ErrorZAutoProduct-${NODE_ENV}-${STORE}${process.env.ENV}.json`;
const createSuccessJsonFileName = `./createdCollection/ZAutoProduct-${NODE_ENV}-${STORE}.json`;
const prepJsonCreate = `./prepJsonCreate/ZAutoJsonWithID-${NODE_ENV}-${STORE}.json`;

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
 * @param {String} tag The tag that is already created on shopify
 * @param {Number} id  Shopify smart collection ID
 */

const recordTag = function(tag, id) {
    return new Promise(async function(resolve, reject) {
        try {
            const json = require(path.join(__dirname, createSuccessJsonFileName));
            json[tag] = id;
            await fsWriteFile(path.join(__dirname, createSuccessJsonFileName), json);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
  
};

/**
 * Check if the tag was already recorded in shopify against a json file
 * @param   {String} tag       The tag used to tag items to group them in shopify
 * @returns {Number|undefined} The id of the smart collection on shopify
 */

const checkTagExist = function(tag) {
    return new Promise(function(resolve, reject) {
        try {
            const json = require(path.join(__dirname, createSuccessJsonFileName));
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
            url: `https://${SHOP}.myshopify.com/admin/api/2019-10/smart_collections.json`,
            headers: {
                "X-Shopify-Access-Token": ACCESS_TOKEN,
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
 * @param   {String} title Title of the smart collection
 * @returns {Number}       The id of the smart collection
 */

const createArtistByZTag = function(tag, title) {
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
            await fsWriteFile(path.join(__dirname, `./individual-${NODE_ENV}-${STORE}/${handle}.json`), createdSmartCollection);
            await recordTag(tag, id);
            resolve(id);
        } catch (error) {
            console.log(" Error: createArtistByZTag - ", tag);
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
                id = await createArtistByZTag(tag, title);
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

const controller = async function(tagsAndTitle) {
    return new Promise(async function(resolve, reject) {
        for(const tag in tagsAndTitle) {
            try {
                const id = await checkIfExist(tag, tagsAndTitle[tag].handle);
                const message = id === "Already Created" 
                    ? id : `\u001b[38;5;${id % 255}mSuccess: ${tag}\u001b[0m`;
                console.log(message);
            } catch (error) {
                console.log("Error: main - ", error, tag);
                const errorJson = require(path.join(__dirname, createErrorJsonFileName));
                errorJson[tag] = error;
                await fsWriteFile(path.join(__dirname, createErrorJsonFileName), errorJson);
                reject("ZAutoArtworkProductCreateCollection: Reject");
                break;
            }
        }
        resolve("ZAutoArtworkProductCreateCollection: success");
    });
}

const main = function() {
    return new Promise(async function(resolve, reject) {
        try {
            await createFileIfNotExist(path.join(__dirname, createErrorJsonFileName));
            await createFileIfNotExist(path.join(__dirname, createSuccessJsonFileName));
            const tagsAndTitle = require(path.join(__dirname, prepJsonCreate));
            const result = await controller(tagsAndTitle)
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = main;
