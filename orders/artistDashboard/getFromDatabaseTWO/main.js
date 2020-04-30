const path = require("path");
const createFileIfNotExist = require("../../../helpers/createFileIfNotExist");
const buildAxiosQuery = require("../../../helpers/buildAxiosQuery");
const fsAppendFile = require("../../../helpers/fsAppendFile");
const fsWriteFile = require("../../../helpers/fsWriteFile");
const pool = require("../../../libs/connection");
const consoleColor = require("../../../helpers/consoleColor.js");

const { NODE_ENV, SHOP } = process.env;
const errorFileName = `./error-${NODE_ENV}-${SHOP}.json`;
const nextPageFileName = `./next-${NODE_ENV}-${SHOP}.json`;
const tableName = "`order_exports_two`";

/**
 * @summary  Get product type by id
 * @param   {Number} id Shopify order id
 * @returns {Promise<{order: { lineItems: { edges:[{node:{ productType:String, vendor:String, title:String}}]}}}>}
 */

const getProductTypeByOrderId = function (variantSku) {
  return new Promise(async function (resolve, reject) {
    try {
      const query = `
        query searchProductBySku($query: String!) {
          productVariants(query: $query, first: 1) {
            pageInfo {
              hasNextPage
            }
            edges {
              node {
                product {
                  productType
                  title
                }
              }
            }
          }
        }
      `;

      const variables = {
        query: `sku:'${variantSku}'`,
      };

      const response = await buildAxiosQuery(query, variables);
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @param  {{variantSku:String, orderId:Number, orderName:String}} lineItem
 * @return {Promise<Number>} The next insertID that should be fired
 */
const processLineItems = function (lineItem, databaseId) {
  return new Promise(async function (resolve, reject) {
    let conn;
    try {
      conn = await pool.getConnection();

      const { variantSku } = lineItem;

      const { productVariants } = await getProductTypeByOrderId(variantSku);
      const { pageInfo, edges } = productVariants;

      if (pageInfo.hasNextPage) {
        console.error({ edges });
        reject("More than 1 variants was found");
        return;
      }

      const {
        node: {
          product: { productType, title, vendor },
        },
      } = edges;

      const findQuery = "SELECT `vendor` FROM " + tableName + " WHERE `id`=?";
      const [order] = await pool.query(findQuery, [databaseId]);

      if (order.vendor !== vendor) {
        console.error({ edges }, { order });
        reject("Vendors Do Not Match");
        return;
      }

      const updateQuery =
        "UPDATE INTO " +
        tableName +
        " SET `product_type`=?, `title`=? WHERE `id`=?";

      const updateValue = [productType, title, databaseId];

      const { insertId } = await pool.query(updateQuery, updateValue);

      conn.end();
      resolve(insertId);
    } catch (error) {
      conn.end();
      reject(error);
    }
  });
};

/**
 * @summary query database for row by ID
 * @param  {Number} databaseId Database primary key Id
 * @return {Promise<{variantSku:String, orderName:String}>} LineItem
 */

const getInfoFromRow = (databaseId) => {
  return new Promise(async (resolve, reject) => {
    let conn;
    try {
      conn = await pool.getConnection();

      const [
        data,
      ] = await pool.query(
        "SELECT `variant_sku` as `variantSku` FROM " +
          tableName +
          " WHERE `id`=?",
        [databaseId]
      );

      conn.end();
      resolve(data);
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
      const rowInfo = await getInfoFromRow(currentDatabaseId);

      if (!rowInfo.variantSku) {
        console.log("NO MORE DATABASE ROWS");
        keepLooping = false;
        break;
      }

      await processLineItems(rowInfo, currentDatabaseId);

      // Log curser to file just incase program dies.
      // If program dies pass cursor into function to start at the same spot again
      currentDatabaseId += 1;
      await fsAppendFile(
        iteration,
        currentDatabaseId,
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
