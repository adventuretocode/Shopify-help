const path = require("path");

let keys = "";
if (process.env.NODE_ENV === "stage-teefury") {
  keys = require("dotenv").config({
    path: path.join(__dirname, "./.env.stage-teefury")
  });
} else if (process.env.NODE_ENV === "prod-teefury") {
  keys = require("dotenv").config({
    path: path.join(__dirname, "./.env.prod-teefury")
  });
} else if (process.env.NODE_ENV === "stage-rivalTees") {
  keys = require("dotenv").config({
    path: path.join(__dirname, "./.env.stage-rivalTees")
  });
} else if (process.env.NODE_ENV === "prod-rivalTees") {
  keys = require("dotenv").config({
    path: path.join(__dirname, "./.env.prod-rivalTees")
  });
}

module.exports = keys;
