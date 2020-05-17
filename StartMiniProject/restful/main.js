const path = require("path");
const createFileIfNotExist = require("../../../helpers/createFileIfNotExist");
const nextPageFromHeader = require("../../helpers/restPaginateNext");
const fsAppendFile = require("../../helpers/fsAppendFile");
const fsWriteFile = require("../../helpers/fsWriteFile");
const consoleColor = require("../../helpers/consoleColor");

const { NODE_ENV, SHOP, ACCESS_TOKEN } = process.env;
const errorFileName = `./error-${NODE_ENV}-${SHOP}.json`;
const nextPageFileName = `./next-${NODE_ENV}-${SHOP}.json`;

/**
 *  Might have to revaluate how to execute pagination. 
 *  Since the headers.link comes back with a full URL. 
 *  That might be how to truly paginate
 * 
 *  Which means the extracting pagination is incorrect then
 * 
 */

/**
 * @summary  End Point of shopify
 * @param   {String} endPoint  Shopify endpoint that needs to be head
 * @param   {String} page_info Shopify's graphQLs cursor
 * @param   {Number} [limit]   Amount of items that will return in an array
 * @returns {Promise<{body:Object, header:Object}>} Body and header of restful request
 * 
 * @example
 * const { headers, body } = await shopifyRestFul("order.json", nextPageRef);
 * const { headers, body } = await shopifyRestFul("product.json", page_nextPageRef, 5);
 */

const getFromShopifyRestFul = (endPoint, page_info, limit = 10) => {
  return new Promise(async (resolve, reject) => {
    try {
      const nextPage = page_info ? `&page_info${page_info}` : "";
      const params = {
        url: `https://${SHOP}.myshopify.com/admin/api/2019-10/${endPoint}?limit=${limit}${nextPage}`,
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

const executionOnData = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Save to database or something.
      resolve();
    } catch (error) {
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
      const { headers, body } = await getFromShopifyRestFul("xxxxxx.json", currentPage);
      const nextPage = await nextPageFromHeader(headers);
      await executionOnData(body);

      // Log curser to file just incase program dies.
      // If program dies pass cursor into function to start at the same spot again
      currentPage = nextPage;
      await fsAppendFile(
        iteration,
        nextPage,
        path.join(__dirname, nextPageFileName)
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
