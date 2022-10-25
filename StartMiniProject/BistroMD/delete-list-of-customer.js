import dotenv from "dotenv";
import neatCsv from "neat-csv";
import { readFile, writeFile, access } from "fs/promises";

dotenv.config();

const DIRECTORY = `/Volumes/XTRM-Q/Code/Projects/ChelseaAndRachel/BistroMD/Migrations/Customer/ReCharge/Prod/Customer_to_delete`;
const FILE_NAME = `bisro_recharge_customer_dev-2022-10-24-23-38-54`;
const TRACK_FILE = `./track-delete.txt`;

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
      console.log(rowCSV);
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
