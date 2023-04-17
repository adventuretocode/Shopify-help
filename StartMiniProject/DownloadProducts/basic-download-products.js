import "dotenv/config";
import retrieveProductsByCollection from "./Shopify/retrieve-products-by-collection.js";
import { PaginationLinkHeaders } from "./Shopify/pagination-link-headers.js";
import { BasicProduct } from "./database/sequelize/models/basic-product.js";
import consoleColor from "./helper/consoleColor.js";

const { COLLECTION_ID } = process.env;

const addProductsToDatabase = async (products) => {
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    try {
      /////// BASIC
      // We are straight storing the product json into 1 column
      const res = await BasicProduct.create({
        id: product.id,
        data: product,
      });

      console.log(
        consoleColor(
          product.id,
          `Saved! Shopify ID: ${product.id} Handle: ${product.handle}`
        )
      );
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
BasicProduct.sync({ force: reloadDataBase })
  .then(() => {
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
    console.log("=========== conn.sq Errored ===========");
    console.log(err);
  });
