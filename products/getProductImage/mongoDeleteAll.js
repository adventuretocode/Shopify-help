const mongojs = require("mongojs");
var db = mongojs("teefury", ["product_images"]);

var removeAll = function () {
  db.product_images.remove({}, function (error, response) {
    if (error) {
      console.log("Error: ", error);
    } else {
      console.log("Success: ", response);
    }

    process.exit();
  });
};

removeAll();
