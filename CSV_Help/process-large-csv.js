import dotenv from "dotenv";
import neatCsv from "neat-csv";
import { readFile, writeFile } from "fs/promises";

dotenv.config();

const main = async () => {
  try {
    let fileExist = true;
    const trackFileLocation = `./data/track.txt`;

    while (fileExist) {
      // TODO: Check if file exist, if not exist create file with 0:0
      // TODO: Full to own function. Write test.
      let trackFile = await readFile(
        new URL(trackFileLocation, import.meta.url),
        {
          encoding: "utf8",
        }
      );
      let fileNumber = parseInt(trackFile.split(":")[0]);
      let startNum = parseInt(trackFile.split(":")[1]);

      // TODO: Check if file exist, if not exist exit with successful complete
      let fileLocation = `/data/file-${fileNumber}.csv`;
      const data = await readFile(new URL(fileLocation, import.meta.url), {
        encoding: "utf8",
      });
      const csvArr = await neatCsv(data);
      let endNum = csvArr.length;

      for (let i = startNum; i < endNum; i++) {
        const rowCSV = csvArr[i];
        // =============================================
        // TODO: sallow error and export to a file to check later?
        // Example to where processing should happen
        // await processRow(rowCSV);
        console.log(rowCSV);
        // =============================================
        await writeFile(
          new URL(trackFileLocation, import.meta.url),
          `${fileNumber}:${(i + 1).toString()}`
        );
      }
      fileNumber += 1;

      await writeFile(
        new URL(trackFileLocation, import.meta.url),
        `${fileNumber}:0`
      );
    }
  } catch (error) {
    console.log("Error: ", error);
  }
};

main();
