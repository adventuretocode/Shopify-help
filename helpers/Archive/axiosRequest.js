import axios from "axios";

/********************************
// example graphql query
const SHOPIFY_DOMAIN = "";
const SHOPIFY_TOKEN = "";
const SHOPIFY_VERSION = "";
const exampleQuery = {
  url: `https://${SHOP}.myshopify.com/admin/api/${SHOPIFY_VERSION}/graphql.json`,
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': SHOPIFY_TOKEN,
  },
  method: 'POST',
  data: {
    query: query,
    variables: variables,
  },
}
*******************************/

const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

/**
 * Post request to shopify
 *
 * @param   {Object}  query Request body
 * @param   {Number}  delay Delay of request for rapid request
 * @returns {Promise}       Promise object represents the post body
 */

const axiosRequest = async (query, delay) => {
  try {
    const result = await axios(query);
    sleep(delay);
    return result.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default axiosRequest;
