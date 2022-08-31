import dotenv from "dotenv";
import neatCsv from "neat-csv";
import { readFile, writeFile } from "fs/promises";

dotenv.config();

const main = async () => {
  try {
    let fileExist = true;
    let fileNumber = 1;
    const trackFileLocation = `./data/track.txt`;

    while (fileExist) {
      await writeFile(
        new URL(trackFileLocation, import.meta.url),
        `${fileNumber}\n:0)}`
      );

      let fileLocation = `/Users/bryantran/Documents/Code/Projects/ChelseaAndRachel/BistroMD/Migrations/splitcsv-6176e074-0acd-4ea0-8571-17b26e6473f5-results/customers_salesforce-${fileNumber}.csv`;
      const data = await readFile(new URL(fileLocation, import.meta.url), {
        encoding: "utf8",
      });
      const csvArr = await neatCsv(data);
      let endNum = csvArr.length;
      let trackFile = await readFile(
        new URL(trackFileLocation, import.meta.url),
        {
          encoding: "utf8",
        }
      );
      let startNum = parseInt(trackFile.split(":")[1]);

      for (let i = startNum; i < endNum; i++) {
        const rowCSV = csvArr[i];
				// =============================================
        console.log(rowCSV);
				// =============================================
        await writeFile(
          new URL(trackFileLocation, import.meta.url),
          `${fileNumber}:${(i + 1).toString()}`
        );
      }
			fileNumber += 1;
    }
  } catch (error) {
    console.log("Error: ", error);
  }
};

main();
