require("dotenv").config();
const request = require("request");
const beautify = require("json-beautify");
const fs = require("fs");
const { vendors } = require("./vendors.json");

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
            }, 450);
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

const recordTag = async function(tag, id) {
    try {
        const file = await fs.readFileSync('./ZAutoProductColCreated.json', 'utf8');
        const json = JSON.parse(file);
        json[tag] = id;
        await fsWriteFile(`./ZAutoProductColCreated.json`, json);
    } catch (error) {
        throw error;
    }
  
};

/**
 * Check if the tag was already recorded in shopify against a json file
 * @param   {String} tag       The tag used to tag items to group them in shopify
 * @returns {Number|undefined} The id of the smart collection on shopify
 */

const checkTagExist = async function(tag) {
    try {
        const file = await fs.readFileSync('./ZAutoProductColCreated.json', 'utf8');
        const json = JSON.parse(file);
        return json[tag];
    } catch (error) {
        throw error;
    } 
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
            reject(error);
        }
    });
};

/**
 * Build the body of the 
 * @param {String} tag   Tag on shopify
 * @param {String} title Title of the smart collection
 */

const createArtistByZTag = async function(tag, title) {

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
        const createdSmartCollection  = await createSmartCollection(postBody)
        await fsWriteFile(`./artistProductCollection/${createdSmartCollection.id}.json`, createdSmartCollection);
        await recordTag(tag, createdSmartCollection.id);
        return "ok";

    } catch (error) {
        console.log("createArtistByZTag: Error - ", tag)
        throw error;
    }

};

/**
 * Check if collection already exist on shopify
 * @param {String} tag   Tag on shopify
 */

const checkIfExist = async function(tag) {
    const isAlreadyCreated = await checkTagExist(tag);
    try {
        if(isAlreadyCreated) {
            console.log("Already Created: ", tag);
        }
        else {
            await createArtistByZTag(tag);
            return "ok";
        }
    } catch (error) {
        console.log("checkIfExist: Error - ", artist);
        throw error;
    }
}

/**
 * Main program to run program
 * @param {Object} tagsAndTitle One big object with key value pair with tag and title
 */

const main = async function(tagsAndTitle) {

    for(const tag in tagsAndTitle) {
        try {
            await checkIfExist(tag, tagsAndTitle[tag]);
            console.log("Success: ", tag);
        } catch (error) {
            console.log("Error: ", error, tag);
            break;
        }
    }
}

const tagsAndTitle = require("./ZAutoJson.json");
main(tagsAndTitle);
