const path = require("path");
const createFileIfNotExist = require("../../../helpers/createFileIfNotExist");
const buildAxiosQuery = require("../../../helpers/buildAxiosQuery");
const fsAppendFile = require("../../../helpers/fsAppendFile");
const fsWriteFile = require("../../../helpers/fsWriteFile");
const cleanIDGraphql = require("../../../helpers/cleanIDGraphql");
const cleanDataDate = require("../../../helpers/cleanDataDate");
const pool = require("../../../libs/connection");
const consoleColor = require("../../../helpers/consoleColor.js");

const { NODE_ENV, SHOP } = process.env;
const errorFileName = `./error-${NODE_ENV}-${SHOP}.json`;
const nextPageFileName = `./next-${NODE_ENV}-${SHOP}.json`;

/**
 * @summary  Get product type by id
 * @param   {Number} id Shopify order id
 * @returns {Promise<{order: { lineItems: { edges:[{node:{ productType:String, vendor:String, title:String}}]}}}>}
 */

const getProductTypeByOrderId = function (id) {
  return new Promise(async function (resolve, reject) {
    try {
      const query = `
        query getOrderById($id: ID!) {
          order(id: $id) {
            id
            lineItems(first: 20) {
              edges {
                node {
                  product {
                    productType
                    vendor
                    title
                  }
                }
              }
            }
          }
        }
      `;

      const variables = {
        id: `gid://shopify/Order/${id}`,
      };

      const response = await buildAxiosQuery(query, variables);
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @param  {Array<{node:{product:{productType:String,vendor:String,title:String}}}>} edges Graphql product edges within order issues
 * @param  {Number}  databaseId Local database primary key Id
 * @return {Promise} The next insertID that should be fired
 */
const processLineItems = function ({ edges }, databaseId) {
  return new Promise(async function (resolve, reject) {
    let conn, currentDatabaseId = databaseId;
    try {
      for (let i = 0; i < edges.length; i++) {
        conn = await pool.getConnection();
        const {
          node: { product },
        } = edges[i];
        const { productType, vendor, title } = product;

        const findQuery = "SELECT * FROM `order_exports_one` WHERE `id`=?";
        const [order] = await pool.query(findQuery, [currentDatabaseId]);

        if(order.title.includes(title)) {
          console.log({order});
          reject("shopify vender does not equal database vendor");
        }

        const query =
          "UPDATE INTO `order_exports_one` SET `product_type`=?, `vendor`=?, `title`=? WHERE `id`=?";

        const value = [productType, vendor, title, currentDatabaseId];

        const { insertId } = await pool.query(query, value);

        currentDatabaseId+=1;

        conn.end();
      }
      conn.end();
      resolve(currentDatabaseId);
    } catch (error) {
      conn.end();
      reject(error);
    }
  });
};

/**
 * @summary query database for row by ID
 * @param  {Number} databaseId Database primary key Id
 * @return {Promise<Number>}     The order Id
 */

const getOrderIdFromDatabase = (databaseId) => {
  return new Promise(async (resolve, reject) => {
    let conn;
    try {
      conn = await pool.getConnection();

      const [
        data,
      ] = await pool.query(
        "SELECT `order_id` FROM `order_exports_one` WHERE `id`=?",
        [databaseId]
      );
      const { order_id } = data;

      conn.end();
      resolve(order_id);
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
 * @param  {String}  [nextIdAt]      Start off point where the program last exit
 * @return {Promise}
 */

const main = async (nextIdAt = 1, loopStartAt = 0, loopStopAt) => {
  let keepLooping = true,
    iteration = loopStartAt,
    currentDatabaseId = nextIdAt;

  try {
    while (keepLooping) {
      const orderId = await getOrderIdFromDatabase(currentDatabaseId);

      if (!orderId) {
        console.log("NO MORE DATABASE ROWS");
        keepLooping = false;
        break;
      }

      const {
        order: { lineItems },
      } = await getProductTypeByOrderId(orderId);
      const nextDatabaseId = await processLineItems(
        lineItems,
        currentDatabaseId
      );

      // Log curser to file just incase program dies.
      // If program dies pass cursor into function to start at the same spot again
      currentDatabaseId = nextDatabaseId;
      await fsAppendFile(
        iteration,
        nextDatabaseId,
        path.join(__dirname, nextPageFileName)
      );

      consoleColor(iteration, `iteration: ${iteration}`);

      // Exit the loop
      if (loopStopAt ? iteration >= loopStopAt : false) {
        keepLooping = false;
        break;
      }

      iteration += 1;
    }
    return "Done!";
  } catch (error) {
    await createFileIfNotExist(path.join(__dirname, errorFileName));

    const errorJson = require(path.join(__dirname, errorFileName));
    errorJson[`${Date.now()}`] = error;

    await fsWriteFile(path.join(__dirname, errorFileName), errorJson);

    throw error;
  }
};

module.exports = main;
