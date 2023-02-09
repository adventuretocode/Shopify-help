import axios from "axios";

/**
 * Building rest API end point
 *
 * @param  {String} url    the url param of the end point
 * @param  {String} method HTTP method: GET, POST, PUT, DELETE
 * @param  {Object} params Url parameter search
 * @param  {Object} data   The body if need to post data
 */

const buildRestBody = async (url, method, params, data) => {
  try {
    const options = {
      url: url,
      method: method,
      params: params,
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

export default buildRestBody;
