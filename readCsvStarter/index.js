import neatCsv from "neat-csv";
import { readFile, writeFile } from "fs/promises";
import dotenv from "dotenv";
// main processor
import processRow from "./controllers/index.js";

dotenv.config();

// Data CSV
const fileLocation = `./data/shopify-order-numbers-for-deletion.csv`;
// Tracker left off
const trackFile = `./data/track.txt`;

(async () => {
  const data = await readFile(new URL(fileLocation, import.meta.url), {
    encoding: "utf8",
  });
  const csvArr = await neatCsv(data);
  let endNum = csvArr.length;

	// TODO: create tracker file if not exist
  let startNum = parseInt(
    await readFile(new URL(trackFile, import.meta.url), {
      encoding: "utf8",
    })
  );

  for (let i = startNum; i < endNum; i++) {
    const rowCSV = csvArr[i];
    await processRow(rowCSV);
    await writeFile(new URL(trackFile, import.meta.url), i.toString());
  }
})();