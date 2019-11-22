const path = require("path");

let keys = "";
if(process.env.NODE_ENV === "stage") {
  keys = require("dotenv").config({
    path: path.join(__dirname, "./.env.stage"),
  });
}
else if (process.env.NODE_ENV === "prod") {
  keys = require("dotenv").config({
    path: path.join(__dirname, "./.env.prod"),
  });
}

module.exports = keys;
