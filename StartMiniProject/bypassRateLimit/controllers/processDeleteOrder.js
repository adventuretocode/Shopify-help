import findOrderIdByName from "../services/findOrderIdByName.js";
import cleanIDGraphql from "../helpers/cleanIDGraphql.js";
import deleteOrderById from "../services/deleteOrderById.js";
import consoleColor from "../helpers/consoleColor.js";

/**
 * Delete one order from shopify
 *
 * @param   {Object} rowData Id of the order
 * @return  {Promise}        If return object is empty then delete was successful
 */

const processDeleteOrder = async (rowData, index) => {
  const { Name: orderName } = rowData;
  try {
    const { id } = await findOrderIdByName(orderName);
    const orderId = cleanIDGraphql(id);
    await deleteOrderById(orderId);
    consoleColor(orderId, `${orderId} row #${index}`);
    return "success";
  } catch (error) {
		console.log(error?.response?.status);
		console.log(error?.response?.statusText);
		if(error?.response?.status >= 500) { /* restart*/ }
    throw error;
  }
};

export default processDeleteOrder;
