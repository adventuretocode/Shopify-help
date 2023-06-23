require("dotenv").config();
var request = require("request");
var fs = require("fs");
var beautify = require("json-beautify");

var skuList = ["SAMPLE10570"];

var body = {
  price_rule: {
    title: skuList[0],
    target_type: "line_item",
    target_selection: "all",
    allocation_method: "across",
    value_type: "percentage",
    value: "0.0",
    customer_selection: "all",
    starts_at: new Date(),
    once_per_customer: true,
  },
};

var option = {
  url: "https://zr-dev-btran.myshopify.com/admin/price_rules.json",
  headers: {
    "X-Shopify-Access-Token": process.env.ACCESS_TOKEN,
    "Content-Type": "application/json",
  },
  body: body,
  json: true,
};

var promise = new Promise(function (resolve, reject) {
  request.post(option, function (err, res, body) {
    if (err) {
      console.error("error posting json: ", err);
      reject(err, "POST Error");
    }

    console.log("statusCode:", res && res.statusCode);

    fs.writeFile(
      `${skuList[0]}_price_rule.json`,
      beautify(body, null, 2, 80),
      function (err) {
        if (err) {
          reject(err, "WriteFile Error");
        }
        resolve("The file has been saved!");
      }
    );
  });
});

promise
  .then(function (message) {
    console.log(message);
  })
  .catch(function (error, message) {
    console.log(error, message);
  });
