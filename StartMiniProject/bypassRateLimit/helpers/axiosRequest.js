import axios from "axios";

const { ACCESS_TOKEN } = process.env;
const shopifyAccessToken = JSON.parse(ACCESS_TOKEN)[0];

/********************************
const SHOP = "";
const ACCESS_TOKEN = "";
const exampleQuery = {
  url: `https://${SHOP}.myshopify.com/admin/api/2019-10/graphql.json`,
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': ACCESS_TOKEN,
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
}

/**
 * Post request to shopify
 *
 * @param   {Object}  query Request body
 * @param   {Number}  delay Delay of request for rapid request
 * @returns {Promise}       Promise object represents the post body
 */

const axiosRequest = async (query, delay = 500) => {
  try {
    query.headers["X-Shopify-Access-Token"] = shopifyAccessToken;
    const result = await axios(query);
    return result.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default axiosRequest;
