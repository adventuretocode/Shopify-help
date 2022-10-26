import dotenv from "dotenv";
import neatCsv from "neat-csv";
import { readFile, writeFile, access } from "fs/promises";
import ORM from "./db/orm.js";

dotenv.config();

const DIRECTORY = `/Volumes/XTRM-Q/Code/Projects/myGIT/Shopify-help/StartMiniProject/BistroMD`;
const FILE_NAME = `./data/DONT_PROCESS`;
const TRACK_FILE = `./track-dont_process.txt`;

const BISTRO_ENV = "dev";

const CUSTOMER_TABLE = `${BISTRO_ENV}_bistro_recharge_migration`;

const processRowData = async (rowData) => {
  try {
    const email = rowData["email"];
    const query = `shipping_email = '${email}'`;
    const result = await ORM.updateOne(CUSTOMER_TABLE, "status", "DONT_PROCESS", query);
    console.log(result);
  } catch (error) {
    console.log(error);
    throw error; 
  }
}

const main = async () => {
  console.time();
  try {
    try {
      await access(TRACK_FILE);
    } catch (error) {
      await writeFile(new URL(TRACK_FILE, import.meta.url), `0`);
    }

    let trackFile = await readFile(new URL(TRACK_FILE, import.meta.url), {
      encoding: "utf8",
    });
    let startNum = parseInt(trackFile);

    let fileLocation = `${DIRECTORY}/${FILE_NAME}.csv`;

    try {
      await access(fileLocation);
    } catch (error) {
      throw new Error("File Location Not Found");
    }

    const data = await readFile(new URL(fileLocation, import.meta.url), {
      encoding: "utf8",
    });
    const csvArr = await neatCsv(data);
    let endNum = csvArr.length;

    for (let i = startNum; i < endNum; i++) {
      const rowCSV = csvArr[i];
      // =========================================================
      await processRowData(rowCSV);
      // =========================================================
      await writeFile(new URL(TRACK_FILE, import.meta.url), (i + 1).toString());
    }
  } catch (error) {
    console.log("Error: ", error);
    throw error;
  }
};

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
