const path = require("path");
const { NODE_ENV, STORE } = process.env;
let keys = "";

if (STORE === "teefury") {
  if (NODE_ENV === "prod") {
    keys = require("dotenv").config({
      path: path.join(__dirname, "./.env.teefury-production")
    });
  }
  else if (NODE_ENV === "stage") {
    keys = require("dotenv").config({
      path: path.join(__dirname, "./.env.teefury-stage")
    });
  }
  else if (NODE_ENV === "dev") {
    keys = require("dotenv").config({
      path: path.join(__dirname, "./.env.teefury-dev")
    });
  }
}
else if (STORE === "rivaltees") {
  if (NODE_ENV === "prod") {
    keys = require("dotenv").config({
      path: path.join(__dirname, "./.env.rivaltees-production")
    });
  }
  else if (NODE_ENV === "stage") {
    keys = require("dotenv").config({
      path: path.join(__dirname, "./.env.rivaltees-stage")
    });
  }
}

module.exports = keys;
