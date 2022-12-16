import dotenv from "dotenv";

import ORM from "./db/orm.js";
import compareSpecificKey from "./helpers/compareSpecificKey.js";

import ReChargeCustom from "./ReCharge/Recharge.js";
import isStateProvinceAbv from "./helpers/isStateProvinceAbv.js";

const DEBUG_MODE = true;

const BISTRO_ENV = "prod";
const BISTRO_DAY = "wednesday";
//

dotenv.config();

// const CUSTOMER_TABLE = `${BISTRO_ENV}_bistro_recharge_migration`;
const CUSTOMER_TABLE = `b-wednesday-ship-full`;
const TRACK_CUSTOMER_UPDATE = `${BISTRO_ENV}_track_${BISTRO_DAY}_customer`;
const CUSTOMER_SHIP_DAY = `${BISTRO_ENV}_logistic_day`;
const PROCESSING_BOOLEAN = "has_update_next_charge";
const OUTER_CUSTOMER_TABLE = `limbo_customer_new`;

const updateReChargeSubscription = () => {
  
}


const updateReCustomerController = async (rechargeCustomer, localCustomer) => {
  try {
    await updateReChargeSubscription(rechargeCustomer, localCustomer);
    return "Completed";
  } catch (error) {
    throw error;
  }
};

const processCustomer = async (localCustomer) => {
  try {
    const results = await ReChargeCustom.Customers.findByEmail(
      localCustomer.shipping_email
    );

    const { customers: rechargeCustomer } = results;

    if (rechargeCustomer.length == 0) {
      debugger
      throw new Error("No customer");
    } else if (rechargeCustomer.length == 1) {
      // Update the customers

      // 
      await updateReCustomerController(rechargeCustomer[0], localCustomer);

      await ORM.updateOne(
        CUSTOMER_TABLE,
        PROCESSING_BOOLEAN,
        true,
        `id = '${localCustomer.id}'`
      );
    }

    if (DEBUG_MODE)
      console.log(
        `\u001b[38;5;${localCustomer.customer_id % 255}m${
          localCustomer.shipping_email
        }\u001b[0m`
      );

    return localCustomer.shipping_email;
  } catch (error) {
    console.log(error?.response?.data);
    if (error?.response?.data?.warning === "too many requests") {
      console.log("too many requests sleep for 2sec");
      await sleep(2000);
    } else {
      console.log("Error: ", error);
      console.log(error?.response?.data?.errors);
      if ((error.errno == -3008)) {
        return;
      } else {
        debugger;
        throw "";
      }
    }
  }
};

const runMany = async (customerId) => {
  const continuous = !customerId;
  do {
    try {
      let query = `${PROCESSING_BOOLEAN} = false LIMIT 1`;
      let [customerOne, customerTwo, customerThree] = await ORM.findOne(
        OUTER_CUSTOMER_TABLE,
        query
      );

      if (!customerOne && !customerTwo && !customerThree) return "Completed";

      let resultOne, resultTwo, resultThree;
      if (customerOne) {
        let query = `${PROCESSING_BOOLEAN} = false`;
        let [customerOneMin] = await ORM.findOne(
          CUSTOMER_TABLE,
          query
        );
        resultOne = processCustomer(customerOneMin);
      }

      if (customerTwo) {
        resultTwo = processCustomer(customerTwo);
      }

      if (customerThree) {
        resultThree = processCustomer(customerThree);
      }

      const resultArr = [];

      if (resultOne) {
        resultArr.push(resultOne);
      }

      if (resultTwo) {
        resultArr.push(resultTwo);
      }

      if (resultThree) {
        resultArr.push(resultThree);
      }

      const resultFinal = await Promise.all(resultArr);
      console.log(resultFinal);
    } catch (error) {
      throw error;
    }
  } while (continuous);
  process.exit();
};
