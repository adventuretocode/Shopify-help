
/**
 * ZAutoJsonCreate make the list of all the ZAuto products.
 * Then
 * ZAutoArtworkProductCreateCollection then created the collection if they don't exist
 */
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
