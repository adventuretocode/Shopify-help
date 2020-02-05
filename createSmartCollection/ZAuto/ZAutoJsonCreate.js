/**
 * Prep the ZAuto gallery tags as a JSON
 * to create smart collections
 */

require("../../config.js");
const path = require("path");
const cleanData = require("../../helpers/cleanData.js");
const apiGetRequest = require("../../helpers/apiGetRequest.js");
const fsWriteFile = require("../../helpers/fsWriteFile.js");
const createFileIfNotExist = require("../../helpers/createFileIfNotExist.js");
const { ACCESS_TOKEN, SHOP, NODE_ENV, STORE  } = process.env;
const fileName = `./prepJsonCreate/ZAutoJsonWithID-${NODE_ENV}-${STORE}.json`;

/**
 * Query the admin to get all products but limit amount received
 *
 * @param   {Number} limit The amount requested from shopify 
 * @param   {Number} page  Paginate through Shopify's items on its server 
 * @returns {Promise}      Promise object represents the post body
 */

const getProducts = function(limit = 10, page = 1) {
    return new Promise(async function(resolve, reject) {
        const params = {
            url: `https://${SHOP}.myshopify.com/admin/products.json?limit=${limit}&page=${page}`,
            headers: {
              "X-Shopify-Access-Token": ACCESS_TOKEN,
              "Content-Type": "application/json",
            },
            json: true,
        };
        
        try {
            const products = await apiGetRequest(params);
            resolve(products);
        } catch (error) {
            reject(error);
        }
    });
};

const recordTag = function(tag, handle, id) {
    return new Promise(async function(resolve, reject) {
        try {
            const json = require(fileName);
            if(!json[tag]) {
              json[tag] = {
                "id": id,
                "handle": handle
              };
              await fsWriteFile(path.join(__dirname, fileName), json);
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

const extractZAutoGalTag = async function(shopifyProducts) {
    for (let i = 0; i < shopifyProducts.length; i+=1) {
        let tags = shopifyProducts[i].tags.split(", ");
        for (let j = tags.length - 1; j > 0; j-=1) {
            if(~tags[j].indexOf("Zauto-")) {
                let title = cleanData(shopifyProducts[i].title);
                let artist = cleanData(shopifyProducts[i].vendor);
                await recordTag(tags[j], `${artist}_${title}`, shopifyProducts[i].id);
                console.log(`\u001b[38;5;${shopifyProducts[i].id % 255}m${shopifyProducts[i].title}\u001b[0m`);
                break;
            };
        }
        
    }
};

const main = async function() {
    try {
        let pages = 1;
        let moreItems = true;
        await createFileIfNotExist(path.join(__dirname, fileName));

        while (moreItems) {
            const shopifyProducts = await getProducts(250, pages);
            if(!shopifyProducts) {
                // moreItems = false;
                // throw "Products is null"
                console.log("Product is null");
                continue;
            };

            const { products } = shopifyProducts;

            if(products.length) {
                await extractZAutoGalTag(products);
                pages+=1;
            }
            else {
                console.log("No products Found", products);
                console.log("Completed");
                moreItems = false;
                break;
            }

            console.log(`==================== ${pages} ===================`);
        }
      return "Completed";
    } catch (error) {
       throw error;
    }
};

module.exports = main;
