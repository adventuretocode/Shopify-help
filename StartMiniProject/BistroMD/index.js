import dotenv from "dotenv";
import neatCsv from "neat-csv";
import { readFile, writeFile, access } from "fs/promises";
import momentJS from "./helpers/moment.js";

// TODO: script to skip a future week(s)
// TODO: authorize.net payment id
// TODO: Update `process-many-csv.`

const DEBUG_MODE = false;

const BISTRO_ENV = "dev";
const BISTRO_DAY = "monday";

dotenv.config({ path: `./.env.${BISTRO_ENV}` });

const CUSTOMER_TABLE = `${BISTRO_ENV}_bistro_recharge_migration`;
const CUSTOMER_TABLE_SOURCE = `${BISTRO_ENV}_source_bistro_recharge_migration`;
const PRODUCT_TABLE = `${BISTRO_ENV}_prices_from_cart`;
const TRACK_CUSTOMER_UPDATE = `${BISTRO_ENV}_${BISTRO_DAY}_track_customer`;

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

  const Program_Type = rowData['Program_Type'] || rowData["Program Type"];
  const Program_Status = rowData['Program_Status'] || rowData["Program Status"];
  const Program_Snack_Type = rowData['Program_Snack_Type'] || rowData["Program Snack Type"];
  const Customer_ID = rowData['Customer_ID'] || rowData["Customer ID"];
  const Shipping_Day = rowData['Shipping_Day'] || rowData["Shipping Day"];
  const Shipping_Address_Line_1 = rowData['Shipping_Address_Line_1'] || rowData['Shipping Address Line 1'];
  const Shipping_City = rowData['Shipping_City'] || rowData['Shipping City'];
  // TODO: mark email as unique
  const Email = rowData['Email'];
  let status = "";

  if(!Email) return "";

  if(
    Email == "eric.carestia+narvarstoretest2@bistromd.com" || 
    Email == "eric.carestia+authorizecardtester@bistromd.com" ||
    Email == "eric.carestia+narvarbistrotest@bistromd.com" ||
    Email == "eric.narvartest@bistromd.com" ||
    Email == "eric.carestia+carttesternov30@gmail.com" ||
    Email == "eric.carestia+urlparamterster@bistromd.com" ||
    Email == "eric.carestia+pricechangetestorder@bistromd.com" ||
    Email == "eric.carestia+bistrofbapitestorder@bistromd.com" ||
    Email == "eric.carestia+betatester11@gmail.com" ||
    Email == 'eric.carestia+betatester10@bistromd.com' ||
    Email == 'eric.carestia+betatester5@bistromd.com' ||
    Email == 'ericcarestia+asdkfljsdflkjddd@gmail.com' ||
    Email == 'ericcarestia+storetesterspeed@bistromd.com' ||
    Email.includes('eric.carestia') ||
    Email.includes('ericcarestia+')
  ) {
    return '';
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
    nextChargeDate = momentJS.getNextDayOfWeek(
      "2022-10-21", // TODO: "2022-11-07"
      Shipping_Day.replace("-MUST SHIP", "")
    );
  } else if (Program_Status == "Hold with Resume Date") {
    // TODO: will need to create a program to start skipping
  } else if (Program_Status == "Finished" || Program_Status == "On Hold") {
    // Next Charge date can be left blank
    status = "cancelled";
  } else if (
    Program_Status == "Never Started" ||
    Program_Status == "Gift Certificate Verify"
  ) {
    if(DEBUG_MODE) console.log("skipped!!!!!!, Never Started, Gift Certificate Verify");
    return;
  } else {
    console.log(Program_Status);
    console.log(new Error("New program status, unaccounted for"));
    throw new Error("New program status, unaccounted for");
  }

  const data = {
    customer_id: Customer_ID,
    // program_week: Program_Week_Updated,
    gender: rowData['Gender'],

    status: status,

    external_product_name: productData.external_product_name,
    external_product_id: productData.external_product_id,
    external_variant_id: productData.external_variant_id,
    recurring_price: productData.recurring_price.trim(),
    next_charge_date: nextChargeDate,

    // shipping_company: "??????????????????",
    billing_first_name: rowData['First_Name'] || rowData["First Name"],
    billing_last_name: rowData['Last_Name'] || rowData["Last Name"],

    quantity: 1,
    charge_interval_unit_type: "week",
    charge_interval_frequency: 1,
    shipping_interval_unit_type: "week",
    shipping_interval_frequency: 1,

    customer_stripe_id: "",
    // authorizedotnet_customer_profile_id: CIM_Profile_ID
    // authorizedotnet_customer_payment_profile_id:
    // TODO: email is unique
    shipping_email: Email,
    shipping_first_name: rowData['First_Name'] || rowData["First Name"],
    shipping_last_name: rowData['Last_Name'] || rowData["Last Name"],
    shipping_phone: rowData['Phone'],
    shipping_address_1: Shipping_Address_Line_1,
    shipping_address_2: rowData['Shipping_Address_Line_2'] || rowData['Shipping Address Line 2'],
    shipping_city: Shipping_City,
    shipping_province: rowData['Shipping_StateProvince'] || rowData["Shipping State/Province"],
    shipping_zip: rowData['Shipping_ZipPostal_Code'] || rowData["Shipping Zip/Postal Code"],
    shipping_country: rowData['Shipping_Country'] || rowData["Shipping Country"],
    billing_address_1: rowData['Billing_Address_Line_1'] || rowData["Billing Address Line 1"],
    billing_address_2: rowData['Billing_Address_Line_2'] || rowData["Billing Address Line 2"],
    billing_city: rowData['Billing_City'] || rowData["Billing City"],
    billing_postalcode: rowData['Billing_ZipPostal_Code'] || rowData["Billing Zip/Postal Code"],
    billing_province_state: rowData['Billing_StateProvince'] || rowData["Billing State/Province"],
    billing_country: rowData['Billing_Country'] || rowData["Billing Country"],
    billing_phone: rowData['Account_Phone'] || rowData["Account: Phone"],
    
    is_prepaid: '',
    charge_on_day_of_month: '',
    last_charge_date: '',
    customer_created_at: '',
  };

  if (BISTRO_ENV == "prod") {
    data.shipping_email = Email;
  } else {
    const email = Email.replace("@", "---").concat("@example.com");
    data.shipping_email = email;
  }

  try {
    let action = "NO CHANGE";
    let trackStatus = "NONE";
    let whatChanged = "";
    let query = `customer_id = ${Customer_ID}`;
    const [foundOne] = await ORM.findOne(CUSTOMER_TABLE_SOURCE, query);
    if (foundOne) {

      delete foundOne['charge_on_day_of_month'];
      delete foundOne['is_prepaid'];
      delete foundOne['last_charge_date'];
      delete foundOne['customer_created_at'];

      const isTheSame = compareObjects(foundOne, data);
      if (!isTheSame) {
        // TODO: Possibly log the changes with the tuesday updates
        whatChanged = findAllChangesKeys(foundOne, data).join(",");
        if(DEBUG_MODE) console.log(whatChanged);

        action = "UPDATED";
        trackStatus = "UPDATED";
        // If not the same then update and log that it has been updated
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
      action = "TO_ADD";
    }
    const addItemIntoList = await ORM.insertOneObj(TRACK_CUSTOMER_UPDATE, {
      customer_id: Customer_ID,
      new_email: Email,
      old_email: foundOne ? foundOne.shipping_email : "",
      type: action,
      status: trackStatus,
      what_changed: whatChanged,
      program_status: Program_Status,
    });

    if(DEBUG_MODE) {
      console.log(
        `\u001b[38;5;${Customer_ID % 255}m${Email} -- action: ${action}\u001b[0m`
      );
    }
  } catch (error) {
    if (error.code == "ER_DUP_ENTRY") {
      return "Already added";
    } else {
      console.log(error);
      throw error;
    }
  }
};

const main = async () => {
  try {
    const trackFileLocation = `./track.txt`;

    try {
      await access(trackFileLocation);
    } catch (error) {
      await writeFile( new URL(trackFileLocation, import.meta.url), `1:0`);
    }

    while (true) {
      let trackFile = await readFile( new URL(trackFileLocation, import.meta.url), { encoding: "utf8", });
      let fileNumber = parseInt(trackFile.split(":")[0]);
      let startNum = parseInt(trackFile.split(":")[1]);

      let fileLocation = `/Volumes/XTRM-Q/Code/Projects/ChelseaAndRachel/BistroMD/Migrations/Customer/ReCharge/export_1-1/customer_${fileNumber}.csv`;
      // let fileLocation = `/Volumes/XTRM-Q/Code/Projects/ChelseaAndRachel/BistroMD/Migrations/Customer/ReCharge/export_1-0/splitcsv-6176e074-0acd-4ea0-8571-17b26e6473f5-results/customers_salesforce-${fileNumber}.csv`;

      try {
        await access(fileLocation)
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
        await processRowData(rowCSV);
        // TODO: update recharge customer if UPDATED API
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
