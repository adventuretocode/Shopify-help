require('dotenv').config()
var request = require('request');
var fs = require('fs');
var beautify = require("json-beautify");

var options = {
    url: process.env.SHOP + "/admin/shop.json",
    headers: {
        "X-Shopify-Access-Token": process.env.ACCESS_TOKEN,
        "Content-Type": "application/json",
    }
}


request.get(options, function (error, response, body) {
    if (err) {
        console.error('error posting json: ', error);
        throw err;
    }

    console.log('statusCode:', response && response.statusCode); 

    fs.writeFile('shop.json', beautify(JSON.parse(body), null, 2, 80), function (err) {
        if (err) throw err;
        console.log('The file has been saved!');
    });
});
