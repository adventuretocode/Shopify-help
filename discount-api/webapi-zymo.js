var request = require('request');
var fs = require('fs');
var beautify = require("json-beautify");
var all_varaint = require("./all_varaint.js");

console.log(all_varaint["D6202-1-40"]);

// request.get("https://webapi.zymoresearch.com/api/variants", function (err, res, body) {
//     if (err) {
//         console.error('error posting json: ', err);
//         throw err;
//     }

//     console.log('statusCode:', res && res.statusCode);

//     const variantObj = {};

//     JSON.parse(body).forEach(variant => {
//         variantObj[variant.sku] = {
//             name: variant.name,
//             shopifyID: variant.shopifyID,
//             zreShopifyID: variant.zreShopifyID,
//         } 
//     });

//     fs.writeFile('all_varaint.js', beautify(variantObj, null, 2, 80), function (err) {
//         if (err) throw err;
//         console.log('The file has been saved!');
//     });
// });
