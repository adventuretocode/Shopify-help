const mongojs = require("mongojs");
var db = mongojs("teefury", ["product_images"]);

var count = () => {
  db.product_images.count({}, function (err, data) {
    if (err) {
      console.log("Error: ", err);
    } else {
      console.log(data);
    }

    process.exit();
  });
};

count();
