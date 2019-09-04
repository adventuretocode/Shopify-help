require("dotenv").config()
var request = require("request");
var fs = require("fs");

var postReqDelete = function (url, successMessage) {
    return new Promise(function (resolve, reject) {
        var option = {
            headers: {
                "X-Shopify-Access-Token": process.env.ACCESS_TOKEN,
                "Content-Type": "application/json",
            },
            json: true,
            url: url,
        }

        request.delete(option, function (err, res, body) {
            if (err) reject(err);

            if (body) {
                resolve("errors: Not Found");
            }
            else {
                resolve(successMessage);
            }
        });
    });
}

var delete_price_rule = function () {
    fs.readFile(`./${process.argv[2]}_price_rule.json`, "utf8", function (err, body) {
        if (err) throw err;

        var priceRuleId = JSON.parse(body).price_rule.id;

        delete_discount(priceRuleId)

            .then(function () {
                postReqDelete(`https://zr-dev-btran.myshopify.com/admin/price_rules/${priceRuleId}.json`, "Price Rule deleted")
                    .then(function (message) {
                        console.log(message);
                    });
            }).
            catch(function (message) {
                console.log(message);
            });


    });
}

var delete_discount = function (priceRuleId) {
    return new Promise(function (resolve, reject) {

        fs.readFile(`./${process.argv[2]}_discount.json`, "utf8", function (err, body) {
            if (err) reject(err);

            var discountCodeId = JSON.parse(body).discount_code.id;

            postReqDelete(`https://zr-dev-btran.myshopify.com/admin/price_rules/${priceRuleId}/discount_codes/${discountCodeId}.json`, "Discount deleted")
                .then(function (message) {
                    console.log(message);
                    resolve();
                });

        });
    });
}

delete_price_rule();