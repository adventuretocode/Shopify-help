import dotenv from "dotenv";
import neatCsv from "neat-csv";
import say from "say";
import { readFile, writeFile, access } from "fs/promises";
import { phone } from "phone";
import { getNextDayOfWeek } from "./helpers/moment.js";

// TODO: script to skip a future week(s)

const DEBUG_MODE = false;

const START_DATE = "2022-11-06";
const BISTRO_ENV_TABLE = "prod";
const BISTRO_ENV_DATA = "prod";
const BISTRO_DAY = "sunday";
const FOLDER = "export_2-2"; // Restart the track file

const DIRECTORY =
  "/Volumes/XTRM-Q/Code/Projects/ChelseaAndRachel/BistroMD/Migrations/Customer/ReCharge";

dotenv.config({ path: `./.env.${BISTRO_ENV_DATA}` });

const CUSTOMER_TABLE = `${BISTRO_ENV_TABLE}_bistro_recharge_migration`;
const CUSTOMER_TABLE_SOURCE = `${BISTRO_ENV_TABLE}_source_bistro_recharge_migration`;
const PRODUCT_TABLE = `${BISTRO_ENV_TABLE}_prices_from_cart`;
const TRACK_CUSTOMER_UPDATE = `${BISTRO_ENV_TABLE}_track_${BISTRO_DAY}_customer`;

import ORM from "./db/orm.js";
import compareObjects from "./helpers/compareObjects.js";
import findAllChangesKeys from "./helpers/findAllChangesKeys.js";

const sleep = async (timeInMillieSec) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeInMillieSec);
  });
};

const processRowData = async (rowData) => {
  // "Program Week Updated"
  // "Account: Created Date"
  // "CIM Profile ID"

  const Program_Type = rowData["Program_Type"] || rowData["Program Type"];
  const Program_Status = rowData["Program_Status"] || rowData["Program Status"];
  const Program_Snack_Type =
    rowData["Program_Snack_Type"] || rowData["Program Snack Type"];
  const Customer_ID = rowData["Customer_ID"] || rowData["Customer ID"];
  const Shipping_Day = rowData["Shipping_Day"] || rowData["Shipping Day"];
  const Shipping_Address_Line_1 =
    rowData["Shipping_Address_Line_1"] || rowData["Shipping Address Line 1"];
  const Shipping_City = rowData["Shipping_City"] || rowData["Shipping City"];
  // TODO: mark email as unique
  let Email = rowData["Email"];
  let status = "";

  if (!Email) return "";

  if (
    Email == "eric.narvartest@bistromd.com" ||
    Email == "ericcarestia+asdkfljsdflkjddd@gmail.com" ||
    Email == "ericcarestia+storetesterspeed@bistromd.com" ||
    Email.includes("eric.carestia") ||
    Email.includes("ericcarestia+") ||
    Email.includes("eric.carestia+")
  ) {
    return "";
  }

  if (!Program_Type || !Shipping_Address_Line_1 || !Shipping_City) {
    return "No Program Type";
  }

  if (!Customer_ID) {
    return "No Customer ID";
  }

  let productData = {};

  try {
    let snackQuery;
    if (!Program_Snack_Type) {
      snackQuery = `(snack_type IS NULL OR snack_type = '')`;
    } else {
      snackQuery = `snack_type = '${Program_Snack_Type}'`;
    }
    const product = await ORM.findOne(
      PRODUCT_TABLE,
      `product_type = '${Program_Type}' AND ${snackQuery}`
    );

    if (product.length > 1) throw new Error("More than 1 product");

    const {
      external_product_name,
      external_product_id,
      external_variant_id,
      recurring_price,
    } = product[0];

    productData = {
      external_product_name,
      external_product_id,
      external_variant_id,
      recurring_price,
    };
  } catch (error) {
    console.log(error);
    console.log(new Error("Unable to get product"));
    throw error;
  }

  let nextChargeDate = "";

  if (
    Program_Status == "On Program" ||
    Program_Status == "New Customer" ||
    Program_Status == "Returning Customer" ||
    //
    Program_Status == "Card Declined" ||
    Program_Status == "Fraud" ||
    Program_Status == "Verify Address"
  ) {
    nextChargeDate = getNextDayOfWeek(
      START_DATE,
      Shipping_Day.replace("-MUST SHIP", "")
    );
    status = "active";
  } else if (Program_Status == "Hold with Resume Date") {
    // TODO: will need to create a program to start skipping
    nextChargeDate = getNextDayOfWeek(
      START_DATE,
      Shipping_Day.replace("-MUST SHIP", "")
    );
    status = "active";
  } else if (Program_Status == "Finished" || Program_Status == "On Hold") {
    // Next Charge date can be left blank
    status = "cancelled";
  } else if (
    Program_Status == "Never Started" ||
    Program_Status == "Gift Certificate Verify"
  ) {
    if (DEBUG_MODE)
      console.log("skipped!!!!!!, Never Started, Gift Certificate Verify");
    return;
  } else {
    console.log(Program_Status);
    console.log(new Error("New program status, unaccounted for"));
    throw new Error("New program status, unaccounted for");
  }

  let phoneNumber = rowData["Phone"];
  let billingPhoneNumber =
    rowData["Account_Phone"] || rowData["Account: Phone"];
  try {
    const phoneResult = phone(phoneNumber, { country: "USA" });
    if (phoneResult.isValid) {
      phoneNumber = phoneResult.phoneNumber;
    }
    const billingPhoneResult = phone(billingPhoneNumber, { country: "USA" });
    if (billingPhoneResult.isValid) {
      billingPhoneNumber = billingPhoneResult.phoneNumber;
    }
  } catch (error) {
    console.log("Phone Number Error: ", Customer_ID);
    throw new Error("Phone Number Error");
  }

  if (BISTRO_ENV_DATA == "prod") {
  } else {
    Email = Email.replace("@", "---").concat("@example.com");
  }

  const data = {
    customer_id: Customer_ID,
    // program_week: Program_Week_Updated,
    gender: rowData["Gender"],

    status: status,

    external_product_name: productData.external_product_name,
    external_product_id: productData.external_product_id,
    external_variant_id: productData.external_variant_id,
    recurring_price: productData.recurring_price.trim(),
    next_charge_date: nextChargeDate,

    // shipping_company: "??????????????????",
    billing_first_name: rowData["First_Name"] || rowData["First Name"],
    billing_last_name: rowData["Last_Name"] || rowData["Last Name"],

    quantity: 1,
    charge_interval_unit_type: "week",
    charge_interval_frequency: 1,
    shipping_interval_unit_type: "week",
    shipping_interval_frequency: 1,

    customer_stripe_id: "",

    shipping_email: Email,
    shipping_first_name: rowData["First_Name"] || rowData["First Name"],
    shipping_last_name: rowData["Last_Name"] || rowData["Last Name"],
    shipping_phone: phoneNumber,
    shipping_address_1: Shipping_Address_Line_1,
    shipping_address_2:
      rowData["Shipping_Address_Line_2"] || rowData["Shipping Address Line 2"],
    shipping_city: Shipping_City,
    shipping_province:
      rowData["Shipping_StateProvince"] || rowData["Shipping State/Province"],
    shipping_zip:
      rowData["Shipping_ZipPostal_Code"] || rowData["Shipping Zip/Postal Code"],
    shipping_country:
      rowData["Shipping_Country"] ||
      rowData["Shipping Country"] ||
      "United States",
    billing_address_1:
      rowData["Billing_Address_Line_1"] || rowData["Billing Address Line 1"],
    billing_address_2:
      rowData["Billing_Address_Line_2"] || rowData["Billing Address Line 2"],
    billing_city: rowData["Billing_City"] || rowData["Billing City"],
    billing_postalcode:
      rowData["Billing_ZipPostal_Code"] || rowData["Billing Zip/Postal Code"],
    billing_province_state:
      rowData["Billing_StateProvince"] || rowData["Billing State/Province"],
    billing_country:
      rowData["Billing_Country"] ||
      rowData["Billing Country"] ||
      "United States",
    billing_phone: billingPhoneNumber,

    is_prepaid: "",
    charge_on_day_of_month: "",
    last_charge_date: "",
    customer_created_at: "",
  };

  if (BISTRO_ENV_DATA == "prod") {
    data.authorizedotnet_customer_profile_id = rowData["CIM Profile ID"];
    data.authorizedotnet_customer_payment_profile_id =
      rowData["Payment Profile ID"];
  }

  try {
    let action = "NO CHANGE";
    let trackStatus = "NONE";
    let whatChanged = "";
    let query = `customer_id = ${Customer_ID}`;
    const [foundOne] = await ORM.findOne(CUSTOMER_TABLE_SOURCE, query);
    if (foundOne) {
      if (foundOne.status === "DONT_PROCESS") {
        trackStatus = "DONT_PROCESS";
        return "Manual overwrite Don't process";
      }

      delete foundOne["charge_on_day_of_month"];
      delete foundOne["is_prepaid"];
      delete foundOne["last_charge_date"];
      delete foundOne["customer_created_at"];

      const isTheSame = compareObjects(foundOne, data);
      if (!isTheSame) {
        whatChanged = findAllChangesKeys(foundOne, data).join(",");
        if (DEBUG_MODE) console.log(whatChanged);

        action = "UPDATED";
        trackStatus = "UPDATE";
        const resultUpdatedOne = await ORM.updateOneObj(
          CUSTOMER_TABLE,
          data,
          query
        );

        const resultUpdatedSourceOne = await ORM.updateOneObj(
          CUSTOMER_TABLE_SOURCE,
          data,
          query
        );
      }
    } else {
      const resultAddedOne = await ORM.insertOneObj(CUSTOMER_TABLE, data);
      const resultAddedOneSource = await ORM.insertOneObj(
        CUSTOMER_TABLE_SOURCE,
        data
      );
      action = "CREATED";
      trackStatus = "TO_ADD";
    }
    const addItemIntoList = await ORM.insertOneObj(TRACK_CUSTOMER_UPDATE, {
      customer_id: Customer_ID,
      new_email: Email,
      old_email: foundOne ? foundOne.shipping_email : "",
      action: action,
      status: trackStatus,
      what_changed: whatChanged,
      program_status: Program_Status,
    });

    if (DEBUG_MODE) {
      console.log(
        `\u001b[38;5;${
          Customer_ID % 255
        }m${Email} -- action: ${action}\u001b[0m`
      );
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const main = async () => {
  try {
    console.time();
    const trackFileLocation = `./track.txt`;

    try {
      await access(trackFileLocation);
    } catch (error) {
      await writeFile(new URL(trackFileLocation, import.meta.url), `1:0`);
    }

    while (true) {
      let trackFile = await readFile(
        new URL(trackFileLocation, import.meta.url),
        { encoding: "utf8" }
      );
      let fileNumber = parseInt(trackFile.split(":")[0]);
      let startNum = parseInt(trackFile.split(":")[1]);

      let fileLocation = `${DIRECTORY}/${FOLDER}/customer_${fileNumber}.csv`;

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
        await processRowData(rowCSV);
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
    say.speak("Node js has completed successfully");
    process.exit();
  })
  .catch((err) => {
    console.log("==========================================");
    console.log(err);
    console.log("==========================================");
    console.timeEnd();
    console.log("==========================================");
    say.speak("Node js has exited with errors " + err.message);
    process.exit();
  });

export default main;
