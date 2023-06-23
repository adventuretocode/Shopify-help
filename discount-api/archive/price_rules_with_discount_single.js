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
                    reject(err, "POST Error");
                }

                console.log("40Ln statusCode:", res && res.statusCode, "Price Rule ID: ", body.price_rule.id);

                fs.writeFile(`${promotionCode}_price_rule.json`, beautify(body, null, 2, 80), function (err) {
                    if (err) {
                        reject(err, "WriteFile Error");
                    }

                    setTimeout(function () {
                        setTimeout(function () {
                            resolve("The file has been saved!");
                        }, 1000);
                    }, 1000);

                });
            });

    });
}
var discounts = function (promotionCode) {
    return new Promise(function (resolve, reject) {

        fs.readFile(`./${promotionCode}_price_rule.json`, "utf8", function (err, body) {
            if (err) {
                reject(err, "Error: Read File");
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
                    reject(err, "Error: posting json");
                }

                console.log("83Ln ", body);
                if (body.errors === "Not Found") {
                    throw "Error Throw Not Found"
                }
                else {
                    console.log("Discount Code ID: ", body && body.discount_code.id, "statusCode:", res && res.statusCode);

                    fs.writeFile(`${promotionCode}_discount.json`, beautify(body, null, 2, 80), function (err) {
                        if (err) {
                            reject(err, "WriteFile Error");
                        }
                        resolve("Success");
                    });
                }

            });

        });
    });
}

priceRules("SAMPLE10570").
    then(function (message) {

        discounts("SAMPLE10570")
            .then(function () {
                console.log("Completed Successfully");
            }).
            catch(function (error, message) {
                console.log(error, message);
            });

    }).
    catch(function (error, message) {
        console.log(error, message);
    }); 
