require("dotenv").config()
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
                reject("GET: ", err);
            }

            setTimeout(() => {
                resolve(body);
            }, 250);
        });
    });
}

/**
 * Delete from shopify
 *
 * @param   {Object} option The request object for shopify
 * @returns {Promise}       Promise object represents the post body
 */

const deleteFromShopify = function (option) {

    return new Promise(function (resolve, reject) {
        request.delete(option, function (err, res, body) {
            if (err) {
                reject(err);
            }
            
            setTimeout(() => {
                resolve(body);
            }, 1000);
        });
    });
}

/**
 * File system create a file with json object
 * 
 * @param   {String} fileName     The name of the file is to be called
 * @param   {Object} jsonObj      The object to be printed on the disk
 * @param   {String} errorMessage Error message to be returned debug
 * @returns {Promise}             Promise object represents the success or failure of writing to disk
 */

var fsWriteFile = function (fileName, jsonObj, errorMessage) {

    return new Promise(function (resolve, reject) {
        fs.writeFile(fileName, beautify(jsonObj, null, 2, 80), function (err) {
            if (err) {
                reject(err, errorMessage);
            }
            setTimeout(function () {
                resolve("Success: Writing File");
            }, 250);
        });
    });
}

/**
 * File system create a file with json object
 * 
 * @param   {Array{}} products Array of shopify product object
 * @param   {String}  key      Only 1 level deep key
 * @param   {String}  value    Value to be compared with
 * @returns {Array{}}          The filtered products
 */

const filterShopifyProducts = function(products, key, value) {
    return products.map(product => {
        if(product[key] === value) {
            return product;
        }
    });
}

/**
 * Delete a single product from shopify
 * 
 * @param {String|Number} productId The Id of the product to be delete
 */

const deleteProducts = function(productId) {
    return new Promise(async function (resolve, reject){
        const params = {
            url: `https://${process.env.SHOP}.myshopify.com/admin/api/2019-10/products/${productId}.json`,
            headers: {
                "X-Shopify-Access-Token": process.env.ACCESS_TOKEN,
                "Content-Type": "application/json",
            },
            json: true,
        };
        
        deleteFromShopify(params).then(() => {
            resolve("Success Deleted: " + productId);
        })
        .catch((error) => {
            reject(error);
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
        url: `https://${process.env.SHOP}.myshopify.com/admin/products.json?limit=${limit}&page=${page}`,
        headers: {
            "X-Shopify-Access-Token": process.env.ACCESS_TOKEN,
            "Content-Type": "application/json",
        },
        json: true,
    };
    
    const products = await getShopify(params);
    return products;
}



const deleteAndWriteProducts = function(filteredProducts) {
    return new Promise(async function(resolve, reject) {
        try {
            filteredProducts.forEach(async product => {
                const { id } = product
                const writeFileMessage = await fsWriteFile(`./stage_deleted_products/${id}.json`, product, `Error: file save - ${id}`);
                const deleteMessage = await deleteProducts(id);
                console.log(writeFileMessage);
                console.log("\u001b[32;1m" + deleteMessage + "\u001b[0m");
            });
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

const main = async function() {
    try {
        let pages = 1;
        let moreItems = true;
        let pagesGoneBy = 0;
        
        while (moreItems) {
            const { products } = await getProducts(100, pages);
            if(!products) {
                moreItems = false;
                throw "Products is null"
            };
            if(products.length) {
                const filteredProducts = await filterShopifyProducts(products);

                if(filteredProducts.length) {
                    await deleteAndWriteProducts(filteredProducts);
                    pagesGoneBy = 0;
                }
                else {
                    pages+=1;
                    pagesGoneBy+=1;
                    
                    if(pagesGoneBy > 5) {
                        moreItems = false;
                        console.log("Gone Over");
                        break;
                    }
                }
            }
            else {
                console.log("No products Found", products);
                moreItems = false;
                break;
            }
        }
        
    } catch (error) {
        console.log(error);
    }
}

main();
