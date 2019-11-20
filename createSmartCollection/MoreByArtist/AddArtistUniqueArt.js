require("dotenv").config();
const request = require("request");
const fs = require("fs");
const cleanData = require("../../helpers/cleanData.js");
const fsWriteFile = require("../../helpers/fsWriteFile.js");
const path = require("path");

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
 * @param   {String} artist artist 
 * @returns {Number}        ID# of the new smart collection
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
        await fsWriteFile(path.join(__dirname, `./artistUniqueArtWorkCollection${process.env.ENV}/${artistHandle}.json`), createdSmartCollection);
        return createdSmartCollection.id;

    } catch (error) {
        console.log("createUniqueArtWork: Error - ", artist)
        throw error;
    }

};

const checkIfExist = async function(artist) {
    try {
        const cleanArtist = cleanData(artist)
        if(fs.existsSync(path.join(__dirname, `./artistUniqueArtWorkCollection${process.env.ENV}/${cleanArtist}.json`))) {
            console.log("Already Created: ", cleanArtist);
        }
        else {
            const id = await createUniqueArtWork(artist);
            return id;
        }
    } catch (error) {
        console.log("checkIfExist: Error - ", artist);
        throw error;
    }
}

const main = async function(vendorArr) {

    for (let i = 0; i < vendorArr.length; i+=1) {
        try {
            const id = await checkIfExist(vendorArr[i]);
            console.log(`\u001b[38;5;${id % 255}mSuccess: ${vendorArr[i]}\u001b[0m`);
        } catch (error) {
            console.log("Error: ", error, vendorArr[i]);
            const errorJson = require(path.join(__dirname, `./ErrorArtistMensBasicTee${process.env.ENV}.json`));
            errorJson[tag] = error;
            await fsWriteFile(`./ErrorArtistMensBasicTee${process.env.ENV}.json`, errorJson);
        }
    }
}

const { vendors } = require(path.join(__dirname, `./vendors${process.env.ENV}.js`));
main(vendors);
