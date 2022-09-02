require("../../../config");
const pool = require("../../../libs/connection");
const consoleColor = require("../../../helpers/consoleColor.js");
const shopifyOrders = require("./getOrdersFromShopify");
const { cleanDate } = require("../../../helpers/cleanDataDate");
const cleanIDGraphql = require("../../../helpers/cleanIDGraphql");

/**
 * @summary Graphql does not stop at time specified but keeps going. This method stops the while loop from keep going
 * @param  {Array}  edges  Shopify cursor to paginate
 * @param  {String} start  The start time in 24 hours format
 * @param  {String} end    The end time in 24 hours format
 * @return {Boolean}       Cursor or Null to stop while loop
 */
const didGraphReturnPastHourMark = (edges, end) => {
  const lastOrder = edges[edges.length - 1];
  const {
    node: { createdAt },
  } = lastOrder;
  const [data, time] = cleanDate(createdAt).split(" ");
  const [hour] = time.split(":");
  if (+hour >= +end) {
    return true;
  } else {
    return false;
  }
};

/**
 * @summary Extract Line property from lineItems
 * @param  {Array<{node: { title:String, sku:String, vendor:String, quantity:String, product:{ productType:String} }}>} lineItems
 * @return {Array<{productTitle:String, variantSku:String, vendor:String, quantity:Number, productType:String }>}
 */

const extractLineItemProperty = (lineItems) => {
  const { edges } = lineItems;
  return edges.map(({ node }) => {
    const { title, sku, vendor, quantity, product } = node;

    const productType = product ? product.productType : "Product Deleted";

    return {
      productTitle: title,
      variantSku: sku,
      vendor,
      quantity,
      productType,
    };
  });
};

/**
 * @summary Process shopify orders
 * @param  {Array} edges Orders
 * @return {Promise<String>} Cursor for the next set of items
 */
const storeEdgesIntoDatabase = function (edges) {
  return new Promise(async function (resolve, reject) {
    let conn;
    try {
      const orderLength = edges.length;
      const lastEdge = orderLength - 1;
      conn = await pool.getConnection();

      for (let i = 0; i < orderLength; i++) {
        const {
          node: { id: orderId, createdAt, name, lineItems },
        } = edges[i];

        const [
          queryResult,
        ] = await pool.query(
          "SELECT EXISTS(SELECT * FROM `orders_test` WHERE `order`=?)",
          [name]
        );
        const hasOrderBeenStored = Object.values(queryResult)[0];

        if (hasOrderBeenStored) {
          console.log({
            name,
            orderId,
            createdAt,
            lineItems,
          });
          consoleColor(
            cleanIDGraphql(orderId),
            "==============Skip==============="
          );
          if (i === lastEdge) {
            conn.end();
            return resolve(edges[lastEdge].cursor);
          }
          continue;
        }

        const lineItemArr = extractLineItemProperty(lineItems);
        const lineItemLength = lineItemArr.length;
        for (let j = 0; j < lineItemLength; j++) {
          const {
            productTitle,
            variantSku,
            quantity,
            vendor,
            productType,
          } = lineItemArr[j];

          let commissionsPayout = null;

          if (productType !== "Product Deleted") {
            const [
              commissionsAmount,
            ] = await pool.query(
              "SELECT `commissions_payout` FROM `payouts` WHERE `product_type`=?",
              [productType]
            );

            commissionsPayout = commissionsAmount.commissions_payout;
          }

          const queryString =
            "INSERT INTO `orders_test` (`order`, " +
            "`order_id`, `order_created_at`, `product_title`, `variant_sku`, " +
            "`vendor`, `quantity`, `product_type`, `commissions_amount`) " +
            "VALUES (?,?,?,?,?,?,?,?,?)";

          const queryValue = [
            name,
            cleanIDGraphql(orderId),
            cleanDate(createdAt),
            productTitle,
            variantSku,
            vendor,
            quantity,
            productType,
            commissionsPayout,
          ];

          const { insertId } = await pool.query(queryString, queryValue);
          consoleColor(
            cleanIDGraphql(orderId),
            `${insertId}: ${name}, ${cleanIDGraphql(orderId)}, ${cleanDate(
              createdAt
            )}, ${productTitle}, ${variantSku}, ${vendor}, ${quantity}, ${productType}, ${commissionsPayout}`
          );
        }
      }

      conn.end();
      resolve(edges[lastEdge].cursor);
    } catch (error) {
      if (conn) {
        conn.end();
      }
      reject(error);
    }
  });
};

const main = async (date, start, end) => {
  let cursor = "";
  let keepLooping = true;

  try {
    while (keepLooping) {
      const {
        orders: { pageInfo, edges },
      } = await shopifyOrders(cursor, date, start, end);
      const hasNextPage = pageInfo.hasNextPage;
      cursor = await storeEdgesIntoDatabase(edges);

      const isOverHour = didGraphReturnPastHourMark(edges, end);

      if (!hasNextPage || !cursor || isOverHour) {
        keepLooping = false;
        break;
      }
    }

    return "Done";
  } catch (error) {
    throw error;
  }
};

// let tempDate = Date.parse("5/13/2020, 23:05:00");
let now = Date.parse("5/14/2020, 00:05:00");

const eastCoastTime = new Date(now).toLocaleString("en-US", {
  hour12: false,
  // timeZone: "America/New_York",
});

const [date, time] = eastCoastTime.split(", ");

const [month, day, year] = date.split("/");

const [hour] = time.split(":");

const calStartTime = (num) => {
  const str = +num - 1 + "";
  return str.length === 1 ? "0" + str : str;
};

let start = "";
let end = "";
let databaseDate = "";

if (hour === "00") {

  start = "23";
  end = "24";
  
  const date = new Date(now);
  let previousDay = new Date(date).setDate(date.getDate()-1);
  databaseDate = [year, month, new Date(previousDay).getDate()].join("-");
} else {
  start = calStartTime(hour);
  end = hour;
  databaseDate = [year, month, day].join("-");
}

console.log(databaseDate, start, end);

main(databaseDate, start, end)
  .then((success) => {
    console.log("Success", success)
    process.exit();
  })
  .catch((error) => console.log("error", error));
