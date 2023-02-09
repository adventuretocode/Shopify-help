import axios from "axios";
const { SHOPIFY_DOMAIN, SHOPIFY_API_VERSION, SHOPIFY_TOKEN } = process.env;

/**
 * Building rest API end point
 *
 * @param  {String} url    URL will will contain the resource should end with .json
 * @param  {String} method HTTP method: GET, POST, PUT, DELETE
 * @param  {Object} params Url parameter search, an object with key value pair
 * @param  {Object} data   The body if need to post data
 */

const baseShopifyRequest = async (url, method, params, data) => {
  try {
    const options = {
      url,
      method,
      params,
      data,
      baseURL: `https://${SHOPIFY_DOMAIN}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}`,
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_TOKEN,
        "Content-Type": "application/json",
      },
    };

    if (!data) delete options.data;
    if (!params) delete options.params;

    const result = await axios(options);
    return result;
  } catch (error) {
    throw error;
  }
};

export default baseShopifyRequest;
