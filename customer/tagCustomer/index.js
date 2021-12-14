const path = require("path");
const fs = require("fs");
const neatCsv = require("neat-csv");
const findCustomerByEmail = require("../searchCustomer/customerSearchByEmail");
const tagCustomer = require("./tagCustomer");
const consoleColor = require("../../helpers/consoleColor");
const cleanIDGraphql = require("../../helpers/cleanIDGraphql");

console.log(process.versions);

const main = (start = 0) => {
  const file = path.resolve(__dirname, "../12-13_Not_Tagged_Emails.csv");
  const resultFile = path.resolve(__dirname, "../tagged_customer.csv");
  const tag = "NFT-Preorder";

  fs.readFile(file, async (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const csvArr = await neatCsv(data);
    for (let i = start; i < csvArr.length; i++) {
      try {
        
      const { Email } = csvArr[i];
      const data = await findCustomerByEmail(Email.trim());
      const {
        customers: { edges: customers },
      } = data;
      if (!customers.length) {
        console.log(`==============`);
        console.log("No customer found", Email);
        continue;
      } else if (customers.length > 1) {
        console.log(Email);
        console.log("More than one is found");
        continue;
      }

      const customer = customers[0];
      const customerId = customer.node.id;
      const results = await tagCustomer(customerId, tag);
      console.log(`==============`);
      consoleColor(cleanIDGraphql(customerId), `${Email} - ${tag} - ${i}`);
      
      fs.appendFileSync(resultFile, `\n${Email.trim()}`);
      } catch (error) {
        console.log(error);
      }
    }
  });
};

main();
