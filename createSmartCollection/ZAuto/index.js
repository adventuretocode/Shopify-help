
const ZAutoJsonCreate = require("./ZAutoJsonCreate.js");
const ZAutoArtworkProductCreateCollection = require("./ZAutoArtworkProductCreateCollection");

ZAutoJsonCreate()
    .then(success => {
      console.log("ZAutoJsonCreate", success);
      ZAutoArtworkProductCreateCollection()
        .then(success => {
          console.log("ZAutoArtworkProductCreateCollection", success);
        })
        .catch(error => console.log("error", error));
    })
    .catch(error => console.log("error", error));

