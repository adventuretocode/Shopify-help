import dotenv from "dotenv";
import neatCsv from "neat-csv";
import { readFile, writeFile } from "fs/promises";

dotenv.config();

const fileLocation = `./data/file.csv`;
const trackFile = `./data/track.txt`;

// TODO: the todos no the process-large-csv.js
const main = async () => {
  try {
    const data = await readFile(new URL(fileLocation, import.meta.url), {
      encoding: "utf8",
    });
    const csvArr = await neatCsv(data);
    let endNum = csvArr.length;
    let startNum = parseInt(
      await readFile(new URL(trackFile, import.meta.url), {
        encoding: "utf8",
      })
    );

    for (let i = startNum; i < endNum; i++) {
      const rowCSV = csvArr[i];
			// =========================================================
      console.log(rowCSV);
			// =========================================================
      await writeFile(new URL(trackFile, import.meta.url), (i + 1).toString());
    }
  } catch (error) {
    console.log("Error: ", error);
  }
};

main();

