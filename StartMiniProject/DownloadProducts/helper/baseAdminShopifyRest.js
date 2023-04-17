import axios from "axios";

const { SHOPIFY_DOMAIN, SHOPIFY_VERSION, SHOPIFY_TOKEN } = process.env;

/**
 * Building rest API end point
 *
 * @param  {String} resource URL will will contain the resource 'products/01234' 'collections/56789'
 * @param  {String} method   HTTP method: GET, POST, PUT, DELETE
 * @param  {Object} params   Url parameter search, an object with key value pair
 * @param  {Object} data     The body if need to post data
 */

const baseAdminShopifyRequest = async (resource, method, params, data) => {
  try {
    const options = {
      url: `/admin/api/${SHOPIFY_VERSION}/${resource}.json`,
      method,
      params,
      data,
      baseURL: `https://${SHOPIFY_DOMAIN}.myshopify.com`,
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

export default baseAdminShopifyRequest;
