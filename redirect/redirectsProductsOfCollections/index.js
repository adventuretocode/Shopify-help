const productsGetCollection = require("../../GraphQL/productsGetCollection.js");
const createFileIfNotExist = require("../../helpers/createFileIfNotExist.js");
const fsWriteFile = require("../../helpers/fsWriteFile.js");
const cleanIDGraphql = require("../../helpers/cleanIDGraphql.js");
const path = require("path");
const { NODE_ENV, SHOP } = process.env;
const fileName = `./redirect-${NODE_ENV}-${SHOP}.json`;
const errorFileName = `./error-redirect-${NODE_ENV}-${SHOP}.json`;

const parseProductForCollectionHandle = function(products) {
  return new Promise(async function(resolve, reject) {
    try {
      let productCursor = "";
      for (let i = 0; i < products.length; i++) {

        const { cursor, node } = products[i];
        const {
          collections: { edges: collectionEdges },
          handle,
          id,
          publishedAt
        } = node;

        productCursor = cursor;

        if (!publishedAt) {
          const json = require(path.join(__dirname, fileName));

          json[`product/${handle}`] = collectionEdges.map(
            ({ node: { handle } }) => {
              return `/collections/${handle}`;
            }
          );
          await fsWriteFile(path.join(__dirname, fileName), json);

          console.log(
            `\u001b[38;5;${cleanIDGraphql(id) %
              255}mSuccess: ${handle}\u001b[0m`
          );
        }
      }

      resolve(productCursor);
    } catch (error) {
      reject(error);
    }
  });
};

const main = function() {
  return new Promise(async function(resolve, reject) {
    try {
      let hasNextPage = true;
      let cursor = "";

      await createFileIfNotExist(path.join(__dirname, fileName));

      while (hasNextPage) {
        const {
          products: { pageInfo, edges: productEdges }
        } = await productsGetCollection(cursor);

        cursor = await parseProductForCollectionHandle(productEdges);
        hasNextPage = pageInfo.hasNextPage;
      }

      resolve("Completed Successfully");
    } catch (error) {
      await createFileIfNotExist(path.join(__dirname, errorFileName));

      const errorJson = require(path.join(__dirname, errorFileName));
      errorJson[`${Date.now()}`] = error;

      await fsWriteFile(path.join(__dirname, errorFileName), errorJson);

      reject(error);
    }
  });
};

main()
  .then(console.log)
  .catch(error => console.log("Error: ", error));
