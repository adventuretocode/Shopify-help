import axiosRequest from "../helpers/axiosRequest.js";

const { SHOP, API_VERSION } = process.env;

/**
 * Delete one order from shopify
 *
 * @param   {Number|String} id Id of the order
 * @return  {Promise}          If return object is empty then delete was successful
 */

const deleteOrderById = async (id) => {
  try {
    const options = {
      url: `https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/orders/${id}.json`,
      headers: {
        "X-Shopify-Access-Token": "",
      },
      method: "DELETE",
    };

    const results = await axiosRequest(options);
    return results;
  } catch (error) {
    throw error;
  }
};

export default deleteOrderById;