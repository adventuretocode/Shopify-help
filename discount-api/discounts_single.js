require('dotenv').config()
var request = require('request');
var fs = require('fs');
var beautify = require("json-beautify");

var skuList = ["SAMPLE10570"];

var option = {
    headers: {
        "X-Shopify-Access-Token": process.env.ACCESS_TOKEN,
        "Content-Type": "application/json",
    },
    json: true,
}

var discounts = new Promise(function (resolve, reject) {

    fs.readFile(`./${skuList[0]}_price_rule.json`, 'utf8', function (err, body) {
        if (err) {
            reject(err, "Error: Read File");
        }

        var priceRuleId = JSON.parse(body).price_rule.id;

        option.body = {
            "discount_code": {
                "code": skuList[0],
            }
        };
        
        option.url = `https://zr-dev-btran.myshopify.com/admin/price_rules/${priceRuleId}/discount_codes.json`;

        request.post(option, function (err, res, body) {
            if (err) {
                reject(err, "Error: posting json");
            }

            console.log('statusCode:', res && res.statusCode);

            fs.writeFile(`${skuList[0]}_discount.json`, beautify(body, null, 2, 80), function (err) {
                if (err) {
                    reject(err, "WriteFile Error");
                }
                resolve('The file has been saved!');
            });
        });

    });
});

discounts.
    then(function (message) {
        console.log(message);
    }).
    catch(function (error, message) {
        console.log(error, message);
    }); 
