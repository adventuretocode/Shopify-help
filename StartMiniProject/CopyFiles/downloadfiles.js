import "dotenv/config";
import Shopify from "./Shopify/index.js";
import { File } from "./database/sequelize/models/File.js";
import cleanIDGraphql from "./helper/cleanIDGraphql.js";
import conn from "./database/sequelize/config/connection.js";
import consoleColor from "./helper/consoleColor.js";

const addFilesToDatabase = async (file) => {
  try {
    const { id: gid, alt, preview } = file;
    const { image } = preview;
    const { url, id: ImageSourceGid } = image;

    const id = cleanIDGraphql(gid ? gid : ImageSourceGid);
    const name = url.split("/").pop().split("?v=").shift();

    const res = await File.create({
      id,
      alt,
      old_gid: gid,
      url,
      name,
    });

    console.log(consoleColor(id, `Saved! Shopify ID: ${id}`));
  } catch (error) {
    console.log("------------------------------");
    console.log("-----------ERROR!!!!!!!!!------------");
    console.log(`Issue saving id: ${id}`);
    console.log(error.message);
    console.log("------------------------------");
  }
  return "Finished!";
};

const main = async () => {
  console.time();
  try {
    let hasNextPage;
    let after;
    do {
      const { files } = await Shopify.Files.listFiles(after);
      // console.log("Files: ", files);
      // console.log("node: ", files.edges[0].node);

      const { pageInfo, edges } = files;
      const { endCursor } = pageInfo;

      // Setting up pagination
      after = endCursor;
      hasNextPage = pageInfo.hasNextPage;

      for (let i = 0; i < edges.length; i++) {
        const { node } = edges[i];
        await addFilesToDatabase(node);
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
