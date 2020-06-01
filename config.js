const path = require("path");
const { NODE_ENV, STORE } = process.env;
let keys = "";

if (STORE === "teefury") {
  if (NODE_ENV === "prod") {
    keys = require("dotenv").config({
      path: path.join(__dirname, "./.env.teefury-production"),
    });
  } else if (NODE_ENV === "stage") {
    keys = require("dotenv").config({
      path: path.join(__dirname, "./.env.teefury-stage"),
    });
  } else if (NODE_ENV === "dev") {
    keys = require("dotenv").config({
      path: path.join(__dirname, "./.env.teefury-dev"),
    });
  }
} else if (STORE === "rivaltees") {
  if (NODE_ENV === "prod") {
    keys = require("dotenv").config({
      path: path.join(__dirname, "./.env.rivaltees-production"),
    });
  } else if (NODE_ENV === "stage") {
    keys = require("dotenv").config({
      path: path.join(__dirname, "./.env.rivaltees-stage"),
    });
  }
} else if (STORE === "cloudapparel") {
  keys = require("dotenv").config({
    path: path.join(__dirname, "./.env.cloudapparel-production"),
  });
} else if (STORE === "sculptsweat") {
  keys = require("dotenv").config({
    path: path.join(__dirname, "./.env.sculptsweat-production"),
  });
} else if (STORE === "miraclebrow") {
  keys = require("dotenv").config({
    path: path.join(__dirname, "./.env.miraclebrow-production"),
  });
} else if (STORE === "fantasticheadbands") {
  keys = require("dotenv").config({
    path: path.join(__dirname, "./.env.fantasticheadbands-dev"),
  });
} else if (STORE === "mooblio") {
  keys = require("dotenv").config({
    path: path.join(__dirname, "./.env.moobilo-production"),
  });
} else if (STORE === "odacite") {
  if (NODE_ENV === "prod") {
    keys = require("dotenv").config({
      path: path.join(__dirname, "./.env.odacite-production"),
    });
  } else if (NODE_ENV === "dev") {
    keys = require("dotenv").config({
      path: path.join(__dirname, "./.env.odacite-dev"),
    });
  }
}

module.exports = keys;
