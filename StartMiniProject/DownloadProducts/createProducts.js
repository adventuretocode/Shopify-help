import "dotenv/config";
import { BasicProduct } from "./database/sequelize/models/basic-product.js";
import createProductGraphql from "./Shopify/create-product-graphql.js";
import consoleColor from "./helper/consoleColor.js";

const addProductsToStore = async (products) => {
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    try {
      const { productCreate } = await createProductGraphql({
        product: product.data,
      });
      console.log(
        consoleColor(
          productCreate.product.id,
          `Created! Handle: ${productCreate.product.handle}`
        )
      );
      // Mark product has been updated
      const res = await BasicProduct.update(
        { created_on_dev_store: true },
        { where: { id: product.id } }
      );
      console.log(res);
    } catch (error) {
      console.log("------------------------------");
      console.log("-----------ERROR!!!!!!!!!------------");
      console.log(`Issue Creating ${product.id}`);
      console.log("------------------------------");
      throw error;
    }
  }
  return "Batch Completed";
}

const main = async () => {
  try {
    while (true) {
      const products = await BasicProduct.findAll({
        limit: 1000,
        where: {
          created_on_dev_store: false,
        },
      }); 

      if(!products.length) {
        return "Finished";
      }
      await addProductsToStore(products);
    }
  } catch (error) {
    throw error;
  }
};

main()
  .then(() => {
    console.log("Completed");
    process.exit();
  })
  .catch((err) => {
    console.log("============ Main Errored =============");
    console.log(err);
  });
