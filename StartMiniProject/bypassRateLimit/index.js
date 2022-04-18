import neatCsv from "neat-csv";
import { readFile, writeFile } from "fs/promises";
import dotenv from "dotenv";
import processRow from "./controllers/processDeleteOrder.js";

dotenv.config();

const fileLocation = `./data/shopify-order-numbers-for-deletion.csv`;
const trackFile = `./data/track.txt`;

(async () => {
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
    await processRow(rowCSV, i);
    await writeFile(new URL(trackFile, import.meta.url), (i + 1).toString());
  }
})();
