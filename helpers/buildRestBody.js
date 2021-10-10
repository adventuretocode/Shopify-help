require("../config.js");
const axiosRequest = require("./axiosRequest.js");
const { SHOP, ACCESS_TOKEN } = process.env;

/**
 * Building rest API end point
 *
 * @param  {String} url    the url param of the end point
 * @param  {String} method HTTP method: GET, POST, PUT, DELETE
 * @param  {Object} body   The body if need to post data
 */

const buildRestBody = async (url, method, body) => {
  try {
    const params = {
      url: `https://${SHOP}.myshopify.com${url}`,
      headers: {
        "X-Shopify-Access-Token": ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      method: method,
    };
    const result = await axiosRequest(params);
    return result.data;
  } catch (error) {
    console.log("buildRestBody Error: ", error);
    throw error;
  }
};

module.exports = buildRestBody;
