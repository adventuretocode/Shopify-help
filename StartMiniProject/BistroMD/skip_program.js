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
  formatDate,
} from "./helpers/moment.js";

const BISTRO_ENV = "prod";
const DEBUG_MODE = true;
const OFFICIAL_START = "12/04/2022";

const DIRECTORY = `/Volumes/XTRM-Q/Code/Projects/ChelseaAndRachel/BistroMD/Migrations/Customer/ReCharge`;
const FOLDER = `run-skip_2-11`;
const APPEND_FILE_NAME = `customer_split`;
const TRACK_FILE = `./track_split.txt`;

const CUSTOMER_TABLE = `${BISTRO_ENV}_bistro_recharge_migration`;

const processRowData = async (rowCSV) => {
  const customerId = rowCSV["Customer Id"];
  const startHoldDate = rowCSV["Start Hold Date"]; // MM/DD/YYYY;
  const endHoldDate = rowCSV["End Hold Date"]; // MM/DD/YYYY;

  if (!customerId) return "No Customer ID";
  if (!startHoldDate) return "No Start Date";
  if (!endHoldDate) return "No End Date";

  const daysBetween = getAmountOfDaysPassed(startHoldDate, endHoldDate);
  if (daysBetween > 6) throw new Error("More than 1 week is included");

  const isBeforeToday = isBefore(startHoldDate, OFFICIAL_START, "MM/DD/YYYY");
  if (isBeforeToday) return "Old Date";

  try {
    const query = `customer_id = ${customerId}`;
    const localCustomers = await ORM.findOne(CUSTOMER_TABLE, query);

    if (localCustomers.length != 1) {
      throw new Error(`Customer has ${localCustomers.length} records: ${customerId}`);
    }

    const { next_charge_date, shipping_email } = localCustomers[0];
    console.log(shipping_email);

    const { customers: rechargeCustomers } =
      await ReCharge.Customers.findByEmail(shipping_email);

    if (rechargeCustomers.length != 1) {
      throw new Error(`ReCharge Customer has ${localCustomers.length} records: ${shipping_email}`);
    }

    const warehouseDay = getDayOfTheWeek(next_charge_date);
    const nextDateOfWeek = next_charge_date == formatDate(startHoldDate) ? next_charge_date : getNextDayOfWeek(startHoldDate, warehouseDay);

    if(next_charge_date == formatDate(startHoldDate)) {
      console.log("-------");
    }

    const { subscriptions } = await ReCharge.Subscriptions.list(
      rechargeCustomers[0].id
    );

    if (subscriptions.length != 1)
      throw new Error(`Subscription has ${subscriptions.length} records`);

    const { id, status, address_id } = subscriptions[0];

    // TODO: what if subscription is cancelled
    if (status == "cancelled")
      throw new Error("No active subscription to skip");
    
    try {
      const result = await ReCharge.Addresses.skip_future_charge(
        address_id,
        nextDateOfWeek,
        [id]
      );
      console.log(result);
    } catch (error) {
      try {
        const  { charges } = await ReCharge.Charges.listByStatus(rechargeCustomers[0].id, "QUEUED");
        const charge = charges[0];
        if(charge.scheduled_at != nextDateOfWeek) {
          throw "";
        }
        const skipped = await ReCharge.Charges.skip(charge.id, [id]);
        console.log(charges, skipped);
      } catch (error) {
        throw new Error("Skips not possible");
      }
    }

    if (DEBUG_MODE) {
      console.log(
        `\u001b[38;5;${
          id % 255
        }m${shipping_email} -- ${nextDateOfWeek}\u001b[0m`
      );
    }

    return "Success";
  } catch (error) {
    if(error?.message.includes("Customer has 0 records")) {
      return;
    }
    debugger;
    throw error;
  }
};

const runMany = async () => {
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
};

const runOne = async (customerId, startHoldDate, endHoldDate) => {
  const row = {
    "Customer Id": customerId,
    "Start Hold Date": startHoldDate,
    "End Hold Date": endHoldDate,
  }
  try {
    await processRowData(row);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// runOne("3691404","12/5/2022","12/11/2022");
runMany();
