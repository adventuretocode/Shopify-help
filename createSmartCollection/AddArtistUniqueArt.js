require("dotenv").config();
const request = require("request");
const beautify = require("json-beautify");
const fs = require("fs");
const { vendors } = require("./vendors.json");
const cleanData = require("../helpers/cleanData.js");

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
            const smartCollectionObj = await postShopify(params);
            resolve(smartCollectionObj);
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Build the body of the 
 * @param {String} artist artist 
 */

const createUniqueArtWork = async function(artist) {
    const artistHandle = cleanData(artist);
    const postBody = {
        smart_collection: {
            title: `${artistHandle}_mensbasictee`,
            rules: [
                {
                    column: "vendor",
                    relation: "equals",
                    condition: artist 
                },
                {
                    column: "tag",
                    relation: "equals",
                    condition: "style-basic"
                },
                {
                    column: "tag",
                    relation: "equals",
                    condition: "gender-mens"
                },
                {
                    column: "type",
                    relation: "equals",
                    condition: "Tee"
                }
            ]
        }
    };

    try {
        const createdSmartCollection  = await createSmartCollection(postBody)
        await fsWriteFile(`./artistUniqueArtWorkCollection/${artist}.json`,createdSmartCollection);
        return "ok";

    } catch (error) {
        console.log("createUniqueArtWork: Error - ", artist)
        throw error;
    }

};

const checkIfExist = async function(artist) {
    try {
        if(fs.existsSync(`./artistUniqueArtWorkCollection/${artist}.json`)) {
            console.log("Already Created: ", artist);
        }
        else {
            await createUniqueArtWork(artist);
            return "ok";
        }
    } catch (error) {
        console.log("checkIfExist: Error - ", artist);
        throw error;
    }
}

const main = async function() {

    for (let i = 0; i < vendors.length; i+=1) {
        try {
            await checkIfExist(vendors[i]);
            console.log("Success: ", vendors[i]);
        } catch (error) {
            console.log("Error: ", error, vendors[i]);
            break;
        }
    }
}

main();
