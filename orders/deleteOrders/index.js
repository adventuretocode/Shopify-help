require("../../config.js");
const getAllOrders = require("./getAllOrders.js");
const deleteOrder = require("./deleteOrder.js");
const cancelOrder = require("./cancelOrder.js");

getAllOrders()
  .then(async order => {
    try {
      for (let i = 0; i < order.length; i++) {
        const { id, email, gateway } = order[i];
        await deleteOrder(id);
        console.log(`\u001b[38;5;${id % 255}mDeleted ${id} ${email} ${gateway}\u001b[0m`);
      }
    } catch (error) {
      console.log(error);
    }
  })
  .catch(error => console.log("error", error));

// getAllOrders()
//   .then(async order => {
//     try {
//       for (let i = 0; i < order.length; i++) {
//         const { id, email, gateway } = order[i];
//         await cancelOrder(id);
//         console.log(`\u001b[38;5;${id % 255}mCancel ${id} ${email} ${gateway}\u001b[0m`);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   })
//   .catch(error => console.log("error", error));
