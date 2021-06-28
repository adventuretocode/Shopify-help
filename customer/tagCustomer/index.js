const path = require("path");
const fs = require("fs");
const neatCsv = require("neat-csv");
const findCustomerByEmail = require("../searchCustomer/customerSearchByEmail");
const tagCustomer = require("./tagCustomer");

const main = (start = 0) => {
  const file = path.resolve(__dirname, "../customer_wholesale.csv");

  fs.readFile(file, async (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const csvArr = await neatCsv(data);
    for (let i = start; i < csvArr.length; i++) {
			try {
				
      const { Email } = csvArr[i];
      const { data } = await findCustomerByEmail(Email);
      const {
        customers: { edges: customers },
      } = data;
      if (!customers.length) {
        console.log("No customer found");
        continue;
      } else if (customers.length > 1) {
        console.log("More than one is found");
      }

			const tag = "B2B_Agree";
      const customer = customers[0];
			const customerId = customer.node.id;
			const results = await tagCustomer(customerId, tag);
			console.log(`==============`);
			console.log(`${Email} - ${tag}`);
			} catch (error) {
				console.log(error);
			}
    }
  });
};

main();
