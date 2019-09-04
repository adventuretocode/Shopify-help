require("dotenv").config()
var request = require("request");
var fs = require("fs");
var beautify = require("json-beautify");

var fsReadFile = function (fileName) {

    return new Promise(function (resolve, reject) {
        fs.readFile(fileName, "utf8", function (err, body) {
            if (err) {
                reject(err, "Error: POST - priceRules");
            }

            resolve(JSON.parse(body).price_rule.id);
        });
    });

}

var priceRules = function (promotionCode) {

    return new Promise(function (resolve, reject) {

        var option = {
            url: "https://zr-dev-btran.myshopify.com/admin/price_rules.json",
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

        request.post(option, function (err, res, body) {
            if (err) {
                console.error("error posting json: ", err);
                reject(err, "Error: POST - priceRules");
            }

            console.log("39Ln Price Rule ID: ", body.price_rule.id, "statusCode:", res && res.statusCode);

            fs.writeFile(`${promotionCode}_price_rule.json`, beautify(body, null, 2, 80), function (err) {
                if (err) {
                    reject(err, "Error: WriteFile discounts");
                }

                setTimeout(function () {
                    resolve();
                }, 500);

            });
        });

    });
}

var discounts = function (promotionCode) {

    return new Promise(async function (resolve, reject) {

        var priceRuleId = await fsReadFile(`./${promotionCode}_price_rule.json`);

        var option = {
            url: `https://zr-dev-btran.myshopify.com/admin/price_rules/${priceRuleId}/discount_codes.json`,
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

        request.post(option, function (err, res, body) {
            if (err) {
                reject(err, "Error: POST discounts");
            }

            console.log("83Ln Discount Code ID: ", body && body.discount_code.id, "statusCode:", res && res.statusCode);

            fs.writeFile(`${promotionCode}_discount.json`, beautify(body, null, 2, 80), function (err) {
                if (err) {
                    reject(err, "Error: WriteFile discount");
                }

                setTimeout(function () {
                    resolve();
                }, 500);

            });

        });
    });
}

var shopifyRateLimit = async function (discountCodeArray) {

    if (discountCodeArray.length === 0) {
        return;
    }
    var discountCode = discountCodeArray.pop();
    var postPrice = await priceRules(discountCode);
    var postDiscount = await discounts(discountCode);
    shopifyRateLimit(discountCodeArray);
}

var start = function (discountCodeArray) {
    shopifyRateLimit(discountCodeArray);
}

start(["SAMPLE10570", "SAMPLE10571", "SAMPLE10696", "SAMPLE10697"]);
