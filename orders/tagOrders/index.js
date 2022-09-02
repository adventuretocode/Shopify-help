const paginate = require("../../GraphQL/paginate");
const consoleColor = require("../../helpers/consoleColor");
const sleep = require("../../helpers/sleep");
const findOpenOrderByTag = require("../searchOrder/findOpenOrderByTag");
const tagOrder = require("./tagOrder");

/**
 * Give the console a little color
 *
 * @param {String} start        Shopify Graphql Cursor After
 * @param {Number} pauseAmount  Pausing for a length of time
 * @param {Number} pauseNum     Pause every X 
 */

const main = async (start, pauseAmount = 300000, pauseNum = 25) => {
  const tag = "BlockX-trigger-redeem,FRAUD_PASS";
  const tagCheck = "BlockX-trigger-redeem";
  // const tag = "test-tag";
  const findTag = "NFT_ORDER_PAY_CAP";
  // const findTag = "NFT_MINT_LIST";

  let alreadyProcessedNum = 0;
  let processedNum = 0;

  let continuePagination = true;
  let cursor = start;
  while (continuePagination) {
    const { hasNextPage, lastCursor, edges } = await paginate(
      findOpenOrderByTag,
      "orders",
      [50, findTag, cursor]
    );

    for (let i = 0; i < edges.length; i++) {
      // if (i % pauseNum === 0 && i !== 0) {
      //   await sleep(pauseAmount);
      // }

      const order = edges[i];
      const { id, name, tags, email } = order.node;

      consoleColor(id, `==========================================`);

      if (tags.includes(tagCheck)) {
        consoleColor(id, `Already Processed ${name} - ${email}`);
        continue;
      }
      try {
        await tagOrder(id, tag);
        consoleColor(id, `${name} -- ${tag} -- ${email}`);
      } catch (error) {
        console.error(error);
        console.error(new Error("Order tag unsuccessful"));
      }
    }

    cursor = lastCursor;
    continuePagination = hasNextPage;
    console.log(cursor);
  }
};

main();
