import dotenv from "dotenv";
import Shopify from "./Shopify/index.js";
import { File } from "./database/sequelize/models/File.js";
import cleanIDGraphql from "./helper/cleanIDGraphql.js";
import conn from "./database/sequelize/config/connection.js";
import consoleColor from "./helper/consoleColor.js";

const saveData = async (node) => {
  // Save to Database
};

const retrieveData = async () => {
  console.time();
  try {
    let hasNextPage;
    let after;
    do {
      const { resource } = await Shopify['Resource'].listAll(after);

      const { pageInfo, edges } = resource;
      const { endCursor } = pageInfo;

      // Setting up pagination
      after = endCursor;
      hasNextPage = pageInfo.hasNextPage;

      for (let i = 0; i < edges.length; i++) {
        const node = edges[i];
        await saveData(node);
      }
    } while (hasNextPage);

    return "Files Completed";
  } catch (error) {
    console.log("Error: ", error);
    throw error;
  }
};

const reloadDataBase = true;
conn.sq
  .sync({ force: reloadDataBase })
  .then(() => {
    main()
      .then((success) => {
        console.log("==========================================");
        console.log(success);
        console.log("==========================================");
        console.timeEnd();
        console.log("==========================================");
        process.exit();
      })
      .catch((err) => {
        console.log("==========================================");
        console.log(err);
        console.log("==========================================");
        console.timeEnd();
        console.log("==========================================");
        process.exit();
      });
  })
  .catch((err) => {
    console.log("=========== conn.sq Errored ===========");
    console.log(err);
  });
