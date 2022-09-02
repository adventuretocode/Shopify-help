require("dotenv").config()
var request = require("request");
var fs = require("fs");
var beautify = require("json-beautify");

var option = {
    headers: {
        "X-Shopify-Access-Token": process.env.ACCESS_TOKEN,
        "Content-Type": "application/json",
    },
    json: true,
}

var priceRules = function (promotionCode) {
    return new Promise(function (resolve, reject) {

        option.body = {
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
        };

        option.url = "https://zr-dev-btran.myshopify.com/admin/price_rules.json",

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

    return new Promise(function (resolve, reject) {

        fs.readFile(`./${promotionCode}_price_rule.json`, "utf8", function (err, body) {
            if (err) {
                reject(err, "Error: ReadFile discounts");
            }

            var priceRuleId = JSON.parse(body).price_rule.id;
            console.log("66Ln priceRuleId:", priceRuleId);

            option.body = {
                "discount_code": {
                    "code": promotionCode,
                }
            };

            option.url = `https://zr-dev-btran.myshopify.com/admin/price_rules/${priceRuleId}/discount_codes.json`;

            request.post(option, function (err, res, body) {
                if (err) {
                    reject(err, "Error: POST discounts");
                }

                if (body.errors === "Not Found") {
                    throw "Error Throw Not Found"
                }
                else {
                    console.log("83Ln Discount Code ID: ", body && body.discount_code.id, "statusCode:", res && res.statusCode);

                    fs.writeFile(`${promotionCode}_discount.json`, beautify(body, null, 2, 80), function (err) {
                        if (err) {
                            reject(err, "Error: WriteFile discount");
                        }
                        resolve();
                    });
                }

            });

        });
    });
}

//F 1
//B 4
//F 1
//B 3
//F 1

var shopifyRateLimit = function (discountCodeArray) {

    if (discountCodeArray.length === 0) {
        return;
    }
    var discountCode = discountCodeArray.pop();
    priceRules(discountCode).
        then(function (message) {

            discounts(discountCode)
                .then(function () {
                    console.log("Completed Successfully");
                    setTimeout(function () {
                        shopifyRateLimit(discountCodeArray);
                    }, 1000)
                }).
                catch(function (error, message) {
                    console.log(error, message);
                });

        }).
        catch(function (error, message) {
            console.log(error, message);
        });
}

var start = function (discountCodeArray) {
    shopifyRateLimit(discountCodeArray);
}

start(["SAMPLE10570", "SAMPLE10571", "SAMPLE10696", "SAMPLE10697"]);