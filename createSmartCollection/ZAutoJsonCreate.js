require("dotenv").config();
const request = require("request");
const beautify = require("json-beautify");
const fs = require("fs");

/**
 * Get request to shopify
 *
 * @param   {Object} option The request object for shopify
 * @returns {Promise}       Promise object represents the post body
 */

const getShopify = function (option) {

    return new Promise(function (resolve, reject) {
        request.get(option, function (err, res, body) {
            if (err) {
                reject(err);
            }

            setTimeout(() => {
                resolve(body);
            }, 250);
        });
    });
}

/**
 * Query the admin to get all products but limit amount received
 *
 * @param   {Number} limit The amount requested from shopify 
 * @param   {Number} page  Paginate through Shopify's items on its server 
 * @returns {Promise}      Promise object represents the post body
 */

const getProducts = async function(limit = 10, page = 1) {

    const params = {
        url: `https://${process.env.SHOP}/admin/products.json?limit=${limit}&page=${page}`,
        headers: {
            "X-Shopify-Access-Token": process.env.ACCESS_TOKEN,
            "Content-Type": "application/json",
        },
        json: true,
    };
    
    try {
        const products = await getShopify(params);
        return products;
    } catch (error) {
        throw error;
    }

};

/**
 * File system create a file with json object
 * 
 * @param   {String} fileName     The name of the file is to be called
 * @param   {Object} jsonObj      The object to be printed on the disk
 * @returns {Promise}             Promise object represents the success or failure of writing to disk
 */

var fsWriteFile = function (fileName, jsonObj) {

    return new Promise(function (resolve, reject) {
        fs.writeFile(fileName, beautify(jsonObj, null, 2, 80), function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
};

const cleanData = function(string) {
    return string.replace(/[^\w\s]/gi, "")
        .replace(/  /gi, " ")
        .replace(/ /g, "-").toLowerCase();
}

const recordTag = async function(tag, handle) {
    try {
        const file = await fs.readFileSync('./ZAutoJson.json', 'utf8');
        const json = JSON.parse(file);
        json[tag] = handle;
        await fsWriteFile(`./ZAutoJson.json`, json);
    } catch (error) {
        throw error;
    }
  
};

const extractZAutoGalTag = async function(shopifyProducts) {
    for (let i = 0; i < shopifyProducts.length; i++) {
        let tags = shopifyProducts[i].tags.split(", ");
        for (let j = tags.length - 1; j > 0; j-=1) {
            if(~tags[j].indexOf("ZAuto_gallery")) {
                let title = cleanData(shopifyProducts[i].title);
                let artist = cleanData(shopifyProducts[i].vendor);
                await recordTag(tags[j], `${artist}_${title}`);
                break;
            };
        }
        
        console.log(`\u001b[38;5;${shopifyProducts[i].id % 255}m${shopifyProducts[i].title}\u001b[0m`);
    }
}

const main = async function() {
    try {
        let pages = 1;
        let moreItems = true;
        
        while (moreItems) {
            const shopifyProducts = await getProducts(1, pages);
            if(!shopifyProducts) {
                moreItems = false;
                throw "Products is null"
            };

            const { products } = shopifyProducts;

            if(products.length) {
                extractZAutoGalTag(products);
                pages+=1;
            }
            else {
                console.log("No products Found", products);
                moreItems = false;
                break;
            }

            console.log("success");
        }
        
    } catch (error) {
       throw error;
    }
}

main()
    .then(success => console.log(success))
    .catch(error => console.log(error));
