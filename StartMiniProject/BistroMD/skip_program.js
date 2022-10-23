// Week starts on Sunday ends on Monday
// looks like skips are just 1 week per row (should test)
// Some rows don't have ID's

// Example file for future use
import dotenv from "dotenv";
import neatCsv from "neat-csv";
import { readFile, writeFile, access } from "fs/promises";

dotenv.config();

const DIRECTORY = `/Volumes/XTRM-Q/Code/Projects/ChelseaAndRachel/BistroMD/Migrations/Customer/ReCharge`;
const FOLDER = `/skip_1-0`;
const APPEND_FILE_NAME = `customer_split`;
const TRACK_FILE = `./track_split.txt`;

(async () => {
  console.time();
  try {
    try {
      await access(TRACK_FILE);
    } catch (error) {
      await writeFile(new URL(TRACK_FILE, import.meta.url), `1:0`);
    }

    while (true) {
      let trackFile = await readFile(new URL(TRACK_FILE, import.meta.url), {
        encoding: "utf8",
      });
      let fileNumber = parseInt(trackFile.split(":")[0]);
      let startNum = parseInt(trackFile.split(":")[1]);

      let fileLocation = `${DIRECTORY}/${FOLDER}/${APPEND_FILE_NAME}_${fileNumber}.csv`;

      try {
        await access(fileLocation);
      } catch (error) {
        console.log("==========================================");
        console.log("=============  COMPLETED ALL FILES =======");
        console.log("==========================================");
        console.timeEnd();
        process.exit();
      }

      const data = await readFile(new URL(fileLocation, import.meta.url), {
        encoding: "utf8",
      });
      const csvArr = await neatCsv(data);
      let endNum = csvArr.length;

      for (let i = startNum; i < endNum; i++) {
        const rowCSV = csvArr[i];
        // =============================================
        // TODO: try catch and log errors and continue to process the rest: WATCH_MODE
        // Example to where processing should happen
        console.log(rowCSV);
        // await processRowData(rowCSV);
        // =============================================
        await writeFile(
          new URL(TRACK_FILE, import.meta.url),
          `${fileNumber}:${(i + 1).toString()}`
        );
      }
      fileNumber += 1;

      await writeFile(new URL(TRACK_FILE, import.meta.url), `${fileNumber}:0`);
    }
  } catch (error) {
    debugger;
    console.log("Error: ", error);
    throw error;
  }
})();
