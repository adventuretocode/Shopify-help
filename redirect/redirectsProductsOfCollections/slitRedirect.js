const fs = require("fs");
const { NODE_ENV, SHOP } = process.env;
const fileName = `./redirect-${NODE_ENV}-${SHOP}.json`;
const fileText = `./redirect-${NODE_ENV}-${SHOP}.csv`;

const slitRedirect = function() {
  const file = fs.readFileSync(fileName, 'utf8');
  const jsonObject = JSON.parse(file);

  for (const product in jsonObject) {
    const collectionUrls = jsonObject[product];
    const redirectProducts = collectionUrls.map(collectionUrl => {
      return `${collectionUrl}/${product},\n`;
    });
    fs.appendFileSync(fileText, redirectProducts.join(""));
  }

  console.log("Redirect with products completed");
}

module.exports = slitRedirect;
