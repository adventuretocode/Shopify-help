// Week starts on Sunday ends on Monday
// looks like skips are just 1 week per row (should test)
// Some rows don't have ID's

// Example file for future use
import dotenv from "dotenv";
import neatCsv from "neat-csv";
import { readFile, writeFile, access } from "fs/promises";

dotenv.config();

import ORM from "./db/orm.js";
import ReCharge from "./ReCharge/Recharge.js";
import {
  getDayOfTheWeek,
  getNextDayOfWeek,
  getAmountOfDaysPassed,
  isBefore,
} from "./helpers/moment.js";

const BISTRO_ENV = "dev";
const DEBUG_MODE = true;

const DIRECTORY = `/Volumes/XTRM-Q/Code/Projects/ChelseaAndRachel/BistroMD/Migrations/Customer/ReCharge`;
const FOLDER = `run-skip_1-0`;
const APPEND_FILE_NAME = `customer_split`;
const TRACK_FILE = `./track_split.txt`;

const CUSTOMER_TABLE = `${BISTRO_ENV}_bistro_recharge_migration`;

const processRowData = async (rowCSV) => {
  const customerId = rowCSV["Customer ID"];
  const startHoldDate = rowCSV["Start Hold Date"]; // MM/DD/YYYY;
  const endHoldDate = rowCSV["End Hold Date"]; // MM/DD/YYYY;

  if (!customerId) return "No Customer ID";
  if (!startHoldDate) return "No Start Date";
  if (!endHoldDate) return "No End Date";

  const daysBetween = getAmountOfDaysPassed(startHoldDate, endHoldDate);
  if (daysBetween > 6) throw new Error("More than 1 week is included");

  const isBeforeToday = isBefore(startHoldDate);
  // if (isBeforeToday) return "Old Date";

  try {
    const query = `customer_id = ${customerId}`;
    const localCustomers = await ORM.findOne(CUSTOMER_TABLE, query);

    if (localCustomers.length != 1) {
      throw new Error(`Customer has ${localCustomers.length} records`);
    }

    const { next_charge_date, shipping_email } = localCustomers[0];

    const rechargeCustomers = await ReCharge.Customers.findByEmail(shipping_email);

    if (rechargeCustomers.length != 1) {
      throw new Error(`ReCharge Customer has ${localCustomers.length} records`);
    }

    const dayOfWeek = getDayOfTheWeek(next_charge_date);
    const nextDateOfWeek = getNextDayOfWeek(startHoldDate, dayOfWeek);

    const { subscriptions } = ReCharge.Subscriptions.list(shipping_email);

    if (subscriptions.length != 1)
      throw new Error(`Subscription has ${subscriptions.length} records`);

    const { id, status, address_id } = subscriptions[0];

    // TODO: what if subscription is cancelled
    if (status == "cancelled")
      throw new Error("No active subscription to skip");

    const result = await ReCharge.Addresses.skip_future_charge(
      address_id,
      nextDateOfWeek,
      [id]
    );

    if (DEBUG_MODE) {
      console.log(result);
    }

    return "Success";
  } catch (error) {
    debugger;
    throw error;
  }
};

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
        // console.log(rowCSV);
        await processRowData(rowCSV);
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
