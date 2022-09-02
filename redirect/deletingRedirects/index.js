const redirects = require("./redirects.json.js");
const deleteManyRedirects = require("./deleteManyRedirects.js");

deleteManyRedirects(redirects["create-redirects-old-odad-to-gallery"])
  .then(data => console.log("Success", data))
  .catch(error => console.log("Error: ", error));
