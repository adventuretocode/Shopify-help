const path = require("path");
const createFileIfNotExist = require("../../../helpers/createFileIfNotExist");
const buildAxiosQuery = require("../../../helpers/buildAxiosQuery");
const restApiService = require("../../../helpers/restApiService");
const getCurrentPageFromHeader = require("../../../helpers/restPaginateNext");
const fsAppendFile = require("../../../helpers/fsAppendFile");
const fsWriteFile = require("../../../helpers/fsWriteFile");
const cleanDataDate = require("../../../helpers/cleanDataDate");
const pool = require("../../../libs/connection");
const consoleColor = require("../../../helpers/consoleColor.js");

const { NODE_ENV, SHOP, ACCESS_TOKEN } = process.env;
const errorFileName = `./error-${NODE_ENV}-${SHOP}.json`;

/**
 * @summary  Get all orders from shopify to upload onto database 1 time
 * @param   {String} page_info Shopify's graphQLs cursor
 * @param   {Number} limit     Amount of orders shopify gets back
 * @returns {Promise<>}
 */

const getOrdersFromShopify = function (page_info = "", limit = 10) {
  return new Promise(async function (resolve, reject) {
    try {
      const nextPage = page_info ? `&page_info${page_info}` : "";
      const params = {
        url: `https://${SHOP}.myshopify.com/admin/api/2019-10/orders.json?limit=${limit}${nextPage}`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN,
        },
        method: "GET",
        json: true,
      };
      const { headers, body } = await restApiService(params);
      resolve({ headers, body });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get Product typed by product id
 * @param   {Number} productId The product id
 * @returns {Promise<String>}  The Product type
 */

const getProductTypeById = async (productId) => {
  try {
    const query = `
      query getProductTypeById($Id: ID!) {
        product(id: $Id) {
          productType
        }
      }
    `;

    const variables = {
      Id: `gid://shopify/Product/${productId}`,
    };
    const {
      product: { productType },
    } = await buildAxiosQuery(query, variables);
    return productType;
  } catch (error) {
    throw error;
  }
};

/**
 * @summary Extract Line property from lineItems
 * @param  {Array} lineItems
 * @return {Promise<Array<{title:String, quantity:Number, vendor:String, productType:String }>}
 */

const extractLineItemProperty = (lineItems) => {
  return new Promise(async (resolve, reject) => {
    try {
      const cleanLineItems = [];
      for (let i = 0; i < lineItems.length; i++) {
        const {
          product_id,
          title,
          quantity,
          vendor,
          fulfillment_status,
        } = lineItems[i];
        const productType = await getProductTypeById(product_id);
        if (productType) {
          cleanLineItems.push({
            title,
            quantity,
            vendor,
            productType,
            fulfillment_status,
          });
        }
      }

      resolve(cleanLineItems);
    } catch (error) {
      reject(error);
    }
  });
};

const storeOrdersIntoDatabase = function ({ orders }) {
  return new Promise(async function (resolve, reject) {
    let conn;
    try {
      const length = orders.length;
      conn = await pool.getConnection();

      for (let i = 0; i < length; i++) {
        const { name, id, created_at, line_items } = orders[i];

        const [
          queryResult,
        ] = await pool.query(
          "SELECT EXISTS(SELECT * FROM `shopify_orders` WHERE `order`=?)",
          [name]
        );
        const hasOrderBeenStored = Object.values(queryResult)[0];

        if (hasOrderBeenStored) {
          console.log({
            id,
            name,
            line_items,
          });
          consoleColor(id, "==============Skip===============");
          continue;
        }

        const lineItemArr = await extractLineItemProperty(line_items);
        for (let j = 0; j < lineItemArr.length; j++) {
          const {
            title: productTitle,
            quantity,
            vendor,
            productType,
            fulfillment_status,
          } = lineItemArr[j];

          const queryString =
            "INSERT INTO `shopify_orders` (`order`, " +
            "`order_id`, `order_created_at`, `product_title`, " +
            "`quantity`, `vender`, `product_type`, " +
            "`shipping_fulfillment`, `commissions_paid`) VALUES (?,?,?,?,?,?,?,?,?)";

          const queryValue = [
            name,
            id,
            cleanDataDate(created_at),
            productTitle,
            quantity,
            vendor,
            productType,
            fulfillment_status,
            fulfillment_status ? true : false,
          ];

          const { insertId } = await pool.query(queryString, queryValue);
          const betterLog = queryValue.join(", ");
          consoleColor(id, betterLog);
        }
      }

      conn.end();
      resolve();
    } catch (error) {
      conn.end();
      reject(error);
    }
  });
};

/**
 * Execute main function
 *
 * @param  {Number}  [loopStartAt]   Start iteration at where program died before
 * @param  {Number}  [loopStopAt]    If value exit then the while loop will exit on that iteration.
 *                                   If value does not exist then hasNextPage will determine when loop will exit.
 * @param  {String}  [pageStartAt] Start off point where the program last exit
 * @return {Promise}
 */

const main = async (pageStartAt = undefined, loopStartAt = 0, loopStopAt) => {
  let keepLooping = true,
    iteration = loopStartAt,
    currentPage = pageStartAt;

  try {
    while (keepLooping) {
      const { headers, body } = await getOrdersFromShopify(currentPage);
      const nextPage = await getCurrentPageFromHeader(headers);
      await storeOrdersIntoDatabase(body);
      
      // Log curser to file just incase program dies.
      // If program dies pass cursor into function to start at the same spot again
      currentPage = nextPage
      await fsAppendFile(
        iteration,
        nextPage,
        path.join(__dirname, `./cursor-${NODE_ENV}-${SHOP}.json`)
      );

      consoleColor(iteration, `+++++++++++++++ iteration: ${iteration} +++++++++++++++`);

      // Exit the loop
      if (!nextPage || (loopStopAt ? iteration >= loopStopAt : false)) {
        keepLooping = false;
        break;
      }

      iteration += 1;
    }
    return "Done!";
  } catch (error) {
    await createFileIfNotExist(path.join(__dirname, errorFileName));

    const errorJson = require(path.join(__dirname, errorFileName));
    errorJson[`${new Date().toLocaleString("en-US")}`] = error;

    await fsWriteFile(path.join(__dirname, errorFileName), errorJson);

    throw error;
  }
};

module.exports = main;
module.exports.getOrdersFromShopify = getOrdersFromShopify;
