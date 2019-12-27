const path = require("path");
const { NODE_ENV, STORE } = process.env;
let keys = "";

if (STORE === "teefury") {
  if (NODE_ENV === "prod") {
    keys = require("dotenv").config({
      path: path.join(__dirname, "./.env.prod-teefury")
    });
  }
  else if (NODE_ENV === "stage") {
    keys = require("dotenv").config({
      path: path.join(__dirname, "./.env.stage-teefury")
    });
  }
}
else if (STORE === "rivaltees") {
  if (NODE_ENV === "prod") {
    keys = require("dotenv").config({
      path: path.join(__dirname, "./.env.prod-rivalTees")
    });
  }
  else if (NODE_ENV === "stage") {
    keys = require("dotenv").config({
      path: path.join(__dirname, "./.env.stage-rivalTees")
    });
  }
}

module.exports = keys;
