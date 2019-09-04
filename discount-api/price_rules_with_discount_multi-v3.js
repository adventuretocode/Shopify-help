require("dotenv").config()
var request = require("request");
var fs = require("fs");
var beautify = require("json-beautify");

/**
 * Read file on disk
 * @param   {String} fileName Read a filename requested
 * @param   {String} type     discount_code or price_rule
 * @returns {Promise}         Promise object represents the ID of the shopify property.
 */
var fsReadFile = function (fileName, type) {

    return new Promise(function (resolve, reject) {
        fs.readFile(fileName, "utf8", function (err, body) {
            if (err) {
                reject(err, "Error: POST - " + type);
            }
            resolve(JSON.parse(body)[type].id);
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
                resolve();
            }, 500);
        });
    });
}

/**
 * Posting discount code or price rules to shopify
 * 
 * @param   {Object} option The request object for shopify
 * @param   {String} type   discount_code or price_rule
 * @returns {Promise}       Promise object represents the post body
 */

var postShopify = function (option, type) {

    return new Promise(function (resolve, reject) {
        request.post(option, function (err, res, body) {
            if (err) {
                reject(err, "Error: POST " + type);
            }
            
            if(res && res.statusCode < 400) {
                console.log(type + " ID: ", body && body[type].id, "statusCode:", res && res.statusCode);
                resolve(body);
            }
            else {
                console.log(type + " \nstatusCode:", res && res.statusCode);
                reject(body);
            }
        });
    });
}

/**
 * Creating a price rule on the store
 * 
 * @param   {String} promotionCode The promo code to be created within the price rule
 * @returns {Promise}              Empty promise object if resolved
 */

var priceRules = function (promotionCode) {

    return new Promise(async function (resolve, reject) {

        var params = {
            url: `https://${process.env.SHOP}/admin/price_rules.json`,
            headers: {
                "X-Shopify-Access-Token": process.env.ACCESS_TOKEN,
                "Content-Type": "application/json",
            },
            json: true,
            body: {
                "price_rule": {
                    "title": promotionCode,
                    "target_type": "line_item",
                    "target_selection": "all",
                    "allocation_method": "across",
                    "value_type": "percentage",
                    "value": "0.0",
                    "customer_selection": "all",
                    "starts_at": new Date,
                    "once_per_customer": true,
                }
            }
        };

        try {
            var discountJson = await postShopify(params, "price_rule");
            var crateDiscountJson = await fsWriteFile(`${promotionCode}_price_rule.json`, discountJson, "Error: POST - priceRules");
            resolve();
        } catch (error) {
            reject(error);
        }

    });
}

/**
 * Creating a discount code on the store
 * 
 * @param   {String} promotionCode The promo code to be created within the discount code
 * @returns {Promise}              Empty promise object if resolved
 */

var discounts = function (promotionCode) {

    return new Promise(async function (resolve, reject) {

        try {
            var priceRuleId = await fsReadFile(`./${promotionCode}_price_rule.json`, "price_rule");

            var params = {
                url: `https://${process.env.SHOP}/admin/price_rules/${priceRuleId}/discount_codes.json`,
                headers: {
                    "X-Shopify-Access-Token": process.env.ACCESS_TOKEN,
                    "Content-Type": "application/json",
                },
                json: true,
                body: {
                    "discount_code": {
                        "code": promotionCode,
                    }
                }
            };

            var discountJson = await postShopify(params, "discount_code");
            var crateDiscountJson = await fsWriteFile(`${promotionCode}_discount.json`, discountJson, "Error: WriteFile discount");
            resolve();
        } catch (error) {
            reject(error);
        }

    });
}

/**
 * Recursive shopify post, Controls rate limit of shopify 
 * 
 * @param {String[]} discountCodeArray Discount codes to be created
 */

var shopifyRateLimit = async function (discountCodeArray) {

    if (discountCodeArray.length === 0) {
        return;
    }
    try {
        var discountCode = discountCodeArray.pop();
        var postPrice = await priceRules(discountCode);
        var postDiscount = await discounts(discountCode);
        console.log("\u001b[32;1m" + discountCode + "\u001b[0m");
        shopifyRateLimit(discountCodeArray);
    } catch (error) {
        console.log("ShopifyRateLimit: ", discountCode);
        console.log("Error: ", error);
    }

}


module.exports = function (discountCodeArray) {
    shopifyRateLimit(discountCodeArray);
}

