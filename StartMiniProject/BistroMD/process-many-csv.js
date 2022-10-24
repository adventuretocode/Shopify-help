// Example file for future use
import dotenv from "dotenv";
import neatCsv from "neat-csv";
import { readFile, writeFile, access } from "fs/promises";

dotenv.config();

const DIRECTORY = `~/Document`;
const FOLDER = `/project`;
const APPEND_FILE_NAME = `export`;
const TRACK_FILE = `./track.txt`;

const main = async () => {
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
        if (fileNumber == 1) {
          throw new Error("File Location Not Found");
        } else {
          return "=============  COMPLETED ALL FILES =======";
        }
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

export default main;
