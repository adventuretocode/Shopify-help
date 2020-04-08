const mongojs = require("mongojs");
var db = mongojs("teefury", ["product_images"]);

var findAll = function () {
  db.product_images.find({}, function (err, data) {
    if (err) {
      console.log("Error: ", err);
    } else {
      console.log(data);
    }

    process.exit();
  });
};

findAll();
