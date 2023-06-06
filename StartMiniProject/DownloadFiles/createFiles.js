import "dotenv/config";
import { File } from "./database/sequelize/models/File.js";
import consoleColor from "./helper/consoleColor.js";
import Shopify from "./Shopify/index.js";

const addProductsToStore = async (files) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const input = { alt: file.alt, url: file.url };
      const result = await Shopify.Files.create(input);
      console.log(result);
      console.log(consoleColor(file.id, `Created! File Name: ${file.name}`));

      // Mark resource has been updated
      const res = await file.update(
        {
          created_on_dev_store: true,
          new_gid: result.fileCreate.files[0].id,
        },
        { where: { id: file.id } }
      );
      console.log(res);
    } catch (error) {
      console.log("------------------------------");
      console.log("-----------ERROR!!!!!!!!!------------");
      console.log(`Issue Creating ${file.id}`);
      console.log(JSON.stringify(error));
      console.log("------------------------------");
      // const res = await files.update(
      //   { created_on_dev_store: true },
      //   { where: { id: file.id } }
      // );
      // console.log("++++++++++++++++++++++++++++++");
      // console.log("++++++++++ Marked as created mehhhhhh! +++++++++++++++++");
      console.log("++++++++++++++++++++++++++++++");
    }
  }
  return "Batch Completed";
};

const main = async () => {
  try {
    while (true) {
      const files = await File.findAll({
        limit: 1000,
        where: {
          created_on_dev_store: false,
        },
      });

      if (!files.length) {
        return "Finished";
      }
      try {
        await addProductsToStore(files);
      } catch (error) {
        // do nothing continue adding
      }
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
    console.log(err.toString());
  });
