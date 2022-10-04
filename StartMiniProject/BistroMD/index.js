import dotenv from "dotenv";
import neatCsv from "neat-csv";
import { readFile, writeFile } from "fs/promises";
import momentJS from "./helpers/moment.js";

const BISTRO_ENV = "dev"; 
dotenv.config({ path: `/.env.${BISTRO_ENV}` });

const CUSTOMER_TABLE = `${BISTRO_ENV}_bistro_recharge_migration`;
const PRODUCT_TABLE = `${BISTRO_ENV}_price_from_cart`;
const TRACK_CUSTOMER_UPDATE = `${BISTRO_ENV}_monday_track_customer`

import ORM from "./db/orm.js";
import compareObjects from "./helpers/compareObjects.js";

const sleep = async (timeInMillieSec) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, timeInMillieSec);
  });
}

const processRowData = async (rowData) => {
  const {
    Customer_ID,
    Program_Type,
    Program_Snack_Type,
    Program_Status,

    // Things Menu Admin needs to know.
    // Email
    Program_Week_Updated,
    Gender,
    Shipping_Day,

    First_Name,
    Last_Name,
    Email,
    Shipping_Address_Line_1,
    Shipping_Address_Line_2,
    Shipping_StateProvince,
    Shipping_City,
    Shipping_ZipPostal_Code,
    Shipping_Country,
    Phone,
    Billing_Address_Line_1,
    Billing_Address_Line_2,
    Billing_City,
    Billing_ZipPostal_Code,
    Billing_StateProvince,
    Billing_Country,
    Account_Phone,
    CIM_Profile_ID,
  } = rowData;

  if (!Program_Type || !Shipping_Address_Line_1 || !Shipping_City) {
    return "No Program Type";
  }

  let productData = {};

  try {
    let snackQuery;
    if (!Program_Snack_Type) {
      snackQuery = `(snack_type IS NULL OR snack_type = '')`;
    }
    else {
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
    nextChargeDate = momentJS.getNextDayOfWeek("2022-10-21", Shipping_Day.replace("-MUST SHIP", ""));
  } else if (Program_Status == "Hold with Resume Date") {
    // Issue is unskipping
    nextChargeDate = momentJS.getNextDayOfWeek("2022-10-28", Shipping_Day.replace("-MUST SHIP", ""));
  } else if (
    Program_Status == "Finished" ||
    Program_Status == "On Hold"
  ) {
    // Add but in the past
    nextChargeDate = momentJS.getNextDayOfWeek("2022-10-01", Shipping_Day.replace("-MUST SHIP", ""));
  } else if (Program_Status == "Never Started" || Program_Status == "Gift Certificate Verify") {
    console.log("skipped!!!!!!, Never Started, Gift Certificate Verify");
    return;
  } else {
    console.log(Program_Status);
    debugger;
  }

  const data = {
    customer_id: Customer_ID,
    // program_week: Program_Week_Updated,
    // gender: Gender,

    external_product_name: productData.external_product_name,
    external_product_id: productData.external_product_id,
    external_variant_id: productData.external_variant_id,
    recurring_price: productData.recurring_price,
    next_charge_date: nextChargeDate,

    // shipping_company: "??????????????????",
    // billing_first_name: "?????????????",
    // billing_last_name: "?????????????????",

    quantity: 1,
    charge_interval_unit_type: "week",
    charge_interval_frequency: 1,
    shipping_interval_unit_type: "week",
    shipping_interval_frequency: 1,

    customer_stripe_id: CIM_Profile_ID,
    shipping_email: Email,
    shipping_first_name: First_Name,
    shipping_last_name: Last_Name,
    shipping_phone: Phone,
    shipping_address_1: Shipping_Address_Line_1,
    shipping_address_2: Shipping_Address_Line_2,
    shipping_city: Shipping_City,
    shipping_province: Shipping_StateProvince,
    shipping_zip: Shipping_ZipPostal_Code,
    shipping_country: Shipping_Country,
    billing_address_1: Billing_Address_Line_1,
    billing_address_2: Billing_Address_Line_2,
    billing_city: Billing_City,
    billing_postalcode: Billing_ZipPostal_Code,
    billing_province_state: Billing_StateProvince,
    billing_country: Billing_Country,
    billing_phone: Account_Phone,
  };

  try {
    let action = "Nothing";
    const [findOne] = await ORM.findOne(CUSTOMER_TABLE, `customer_id = ${Customer_ID || "''"} AND shipping_email = '${Email}'`);
    if(findOne) {
      const isTheSame = compareObjects(findOne, data);
      if(!isTheSame) {
        // If not the same then update and log that it has been updated
        const resultUpdatedOne = await ORM.updateOneObj(CUSTOMER_TABLE, data, `customer_id = ${Customer_ID}`);

        const addItemIntoList = await ORM.insertOneObj(TRACK_CUSTOMER_UPDATE, {
          customer_id: Customer_ID, 
          new_email: Email,
          old_email: findOne.email,
          type: "UPDATED",
        });
        action = "UPDATED";
      }
    }
    else {
      const resultAddedOne = await ORM.insertOneObj(CUSTOMER_TABLE, data);
      const addItemIntoList = await ORM.insertOneObj(TRACK_CUSTOMER_UPDATE, {
        customer_id: Customer_ID, 
        new_email: Email,
        type: "CREATED",
      });
      action = "CREATED";
    }
    // console.log(`\u001b[38;5;${Customer_ID % 255}m${Email} -- action: ${action}\u001b[0m`);
    await sleep(100);
  } catch (error) {
    if (error.code == "ER_DUP_ENTRY") {
      return "Already added";
    } else {
      console.log(error);
      throw error;
    }
  }
};

// If no track file
// await writeFile(
//   new URL(trackFileLocation, import.meta.url),
//   `0:0`
// )

const main = async () => {
  try {
    let fileExist = true;
    // let fileNumber = 2;
    const trackFileLocation = `./seed/track.txt`;

    while (fileExist) {
      // Write function to see if file exist or not
      // If it doesn't then create one

      let trackFile = await readFile(
        new URL(trackFileLocation, import.meta.url),
        {
          encoding: "utf8",
        }
      );
      let fileNumber = parseInt(trackFile.split(":")[0]);
      let startNum = parseInt(trackFile.split(":")[1]);

      let fileLocation = `/Volumes/XTRM-Q/Code/Projects/ChelseaAndRachel/BistroMD/Migrations/Customer/ReCharge/splitcsv-6176e074-0acd-4ea0-8571-17b26e6473f5-results/customers_salesforce-${fileNumber}.csv`;
      const data = await readFile(new URL(fileLocation, import.meta.url), {
        encoding: "utf8",
      });
      const csvArr = await neatCsv(data);
      let endNum = csvArr.length;
      

      for (let i = startNum; i < endNum; i++) {
        const rowCSV = csvArr[i];
        // =============================================
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
    debugger;
    console.log("Error: ", error);
  }
};

main();
