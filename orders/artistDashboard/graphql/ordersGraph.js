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

/**
 * @summary  Get all orders from shopify to upload onto database 1 time
 * @param   {String} cursor Shopify's graphQLs cursor
 * @returns {Promise<>}
 */

const getOrdersFromShopify = function (cursor = "") {
  return new Promise(async function (resolve, reject) {
    try {
      const query = `
        query ordersFulfilled($first: Int!, $query: String, $cursor: String) {
          orders(first: $first, query: $query, after: $cursor) {
            pageInfo {
              hasNextPage
            }
            edges{
              cursor
              node {
                id
                createdAt
                displayFulfillmentStatus
                name
                lineItems(first: 30) {
                  edges {
                    node {
                      fulfillmentStatus,
                      id,
                      name,
                      quantity,
                      vendor,
                      product {
                        productType
                      }
                    }
                  }
                }
              }
            }  
          }
        }
      `;

      const variables = {
        first: 2,
      };

      if (cursor) {
        variables.curser = cursor;
      } else {
        // variables.query = "created_at:>'2020-01-01'";
      }

      const response = await buildAxiosQuery(query, variables);
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @summary Extract Line property from lineItems
 * @param  {Array} lineItems
 * @return {Array<{quantity:Number, vendor:String, product_type:String }>}
 */

const extractLineItemProperty = (lineItems) => {
  const { edges } = lineItems;
  return edges.map(({ node }) => {
    const {
      id,
      name,
      quantity,
      vendor,
      product,
    } = node;

    const productType = product ? product.productType : "Product Deleted";
    

    return {
      product_id: id,
      name,
      quantity,
      vendor,
      product_type: productType,
    };
  });
};

const storeEdgesIntoDatabase = function (edges) {
  return new Promise(async function (resolve, reject) {
    let conn;
    try {
      const length = edges.length;
      const lastEdge = length - 1;
      conn = await pool.getConnection();

      for (let i = 0; i < length; i++) {
        const {
          node: { id, createdAt, displayFulfillmentStatus, name, lineItems },
        } = edges[i];

        const [queryResult] = await pool.query("SELECT EXISTS(SELECT * FROM `shopify_orders` WHERE `order`=?)", [name]);
        const hasOrderBeenStored = Object.values(queryResult)[0];
        
        if(hasOrderBeenStored) {
          console.log({ id, createdAt, displayFulfillmentStatus, name, lineItems });
          consoleColor(cleanIDGraphql(id), "==============Skip===============")
          if (i === lastEdge) {
            return resolve(edges[lastEdge].cursor);
          }
          continue;
        }

        const lineItemArr = extractLineItemProperty(lineItems);
        for (let j = 0; j < lineItemArr.length; j++) {
          const {
            product_id,
            name: productTitle,
            quantity,
            vendor,
            product_type: productType,
          } = lineItemArr[j];

          const queryString =
            "INSERT INTO `shopify_orders` (`order`, " +
            "`order_id`, `create_at`, `status`, `product_id`, " +
            "`product_title`, `quantity`, `vender`, `product_type`) " +
            "VALUES (?,?,?,?,?,?,?,?,?)";

          const queryValue = [
            name,
            cleanIDGraphql(id),
            cleanDataDate(createdAt),
            displayFulfillmentStatus,
            cleanIDGraphql(product_id),
            productTitle,
            quantity,
            vendor,
            productType,
          ];

          const { insertId } = await pool.query(queryString, queryValue);
          consoleColor(
            cleanIDGraphql(product_id),
            `${insertId}: ${name}, ${cleanIDGraphql(id)}, ${cleanDataDate(createdAt)}, ${displayFulfillmentStatus}, ${cleanIDGraphql(product_id)}, ${productTitle}, ${quantity}, ${vendor}, ${productType}`
          );
        }
      }

      conn.end();
      resolve(edges[lastEdge].cursor);
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
 * @param  {String}  [cursorStartAt] Start off point where the program last exit
 * @return {Promise}
 */

const main = async (cursorStartAt = undefined, loopStartAt = 0, loopStopAt) => {
  let keepLooping = true,
    iteration = loopStartAt,
    currentCurser = cursorStartAt;

  try {
    while (keepLooping) {
      const {
        orders: { pageInfo, edges },
      } = await getOrdersFromShopify(currentCurser);
      console.log(edges);
      currentCurser = await storeEdgesIntoDatabase(edges);
      hasNextPage = pageInfo.hasNextPage;

      // Log curser to file just incase program dies.
      // If program dies pass cursor into function to start at the same spot again
      await fsAppendFile(
        iteration,
        currentCurser,
        path.join(__dirname, `./cursor-${NODE_ENV}-${SHOP}.json`)
      );

      consoleColor(iteration, `iteration: ${iteration}`);

      // Exit the loop
      if (!hasNextPage || (loopStopAt ? iteration >= loopStopAt : false)) {
        keepLooping = false;
        break;
      }

      iteration += 1;
    }
    return "Done!"
  } catch (error) {
    await createFileIfNotExist(path.join(__dirname, errorFileName));

    const errorJson = require(path.join(__dirname, errorFileName));
    errorJson[`${Date.now()}`] = error;

    await fsWriteFile(path.join(__dirname, errorFileName), errorJson);

    throw error;
  }
};

module.exports = main;
module.exports.getOrdersFromShopify = getOrdersFromShopify;
