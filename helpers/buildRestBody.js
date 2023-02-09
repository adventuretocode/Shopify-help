import axios from "axios";

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
      url: url,
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_TOKEN,
        "Content-Type": "application/json",
      },
      method: method,
    };

    if(body) {
      params.data = body;
    }

    const result = await axios(params);
    return result;
  } catch (error) {
    throw error;
  }
};

export default buildRestBody;
