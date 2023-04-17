import "dotenv/config";
import retrieveProductsByCollection from "./Shopify/retrieve-products-by-collection.js";
import { PaginationLinkHeaders } from "./Shopify/pagination-link-headers.js";
import saveProduct from "./database/sequelize/controller/saveProduct.js";
import conn from "./database/sequelize/config/connection.js";

const { COLLECTION_ID } = process.env;

const addProductsToDatabase = async (products) => {
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    try {
      const res = await saveProduct(product);
      console.log(res);
    } catch (error) {
      console.log("------------------------------");
      console.log("-----------ERROR!!!!!!!!!------------");
      console.log(
        `Issue saving \nURL: ${product.url}\nProduct_id: ${product.id}`
      );
      console.log("------------------------------");
    }
  }
  return "Finished!";
};

const saveProductsInCollection = async (collectionId) => {
  let nextPageInfo;
  let paginationCount = 0;
  do {
    try {
      let result;
      if (nextPageInfo) {
        result = await retrieveProductsByCollection(undefined, nextPageInfo);
      } else {
        result = await retrieveProductsByCollection(collectionId);
      }

      const {
        headers,
        data: { products },
      } = result;

      await addProductsToDatabase(products);

      const { link } = headers;
      const paginationLinks = new PaginationLinkHeaders(link);
      const nextPageUrl = paginationLinks.nextLink?.url;
      const pageInfo = nextPageUrl?.searchParams.get("page_info");
      nextPageInfo = nextPageUrl ? pageInfo : undefined;
      paginationCount += 1;
    } catch (error) {
      console.log(`Paginated ${paginationCount} times`);
      console.log(`NextPageInfo: `, nextPageInfo);
      debugger;
    }
  } while (nextPageInfo);
};

const main = async (collectionId) => {
  try {
    await saveProductsInCollection(collectionId);
    return "Finished";
  } catch (error) {
    throw error;
  }
};

const reloadDataBase = false;
conn.sq.sync({ force: reloadDataBase }).then(() => {
  main(COLLECTION_ID)
    .then(() => {
      console.log("Completed");
      process.exit();
    })
    .catch((err) => {
      console.log("============ Main Errored =============");
      console.log(err);
    });
})
.catch((err) => {
  console.log("=========== conn.sq Errored ===========")
  console.log(err)
});
