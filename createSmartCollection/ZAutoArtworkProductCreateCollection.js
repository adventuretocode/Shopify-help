require("dotenv").config();
const request = require("request");
const beautify = require("json-beautify");
const fs = require("fs");

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
 * @param {Number} id  Shopify smart collection ID
 */

const recordTag = function(tag, id) {
    return new Promise(async function(resolve, reject) {
        try {
            const json = require('./ZAutoProductColCreated.json');
            json[tag] = id;
            await fsWriteFile(`./ZAutoProductColCreated.json`, json);
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
            const json = require('./ZAutoProductColCreated.json');
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
            url: `https://${process.env.SHOP}/admin/api/2019-10/smart_collections.json`,
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
            await fsWriteFile(`./artistProductCollection/${handle}.json`, createdSmartCollection);
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

const main = async function(tagsAndTitle) {

    for(const tag in tagsAndTitle) {
        try {
            const id = await checkIfExist(tag, tagsAndTitle[tag]);
            const message = id === "Already Created" 
                ? id : `\u001b[38;5;${id % 255}mSuccess: ${tag}\u001b[0m`;
            console.log(message);
        } catch (error) {
            console.log("Error: main - ", error, tag);
            const errorJson = require("./ErrorZAutoProductColCreated.json");
            errorJson[tag] = error;
            await fsWriteFile(`./ErrorZAutoProductColCreated.json`, errorJson);
        }
    }
}

const tagsAndTitle = require("./ZAutoJson.json");
main(tagsAndTitle);
