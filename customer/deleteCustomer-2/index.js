const dotenv = require("dotenv");

dotenv.config({path: "../../.env.liliq-wholesale"})

const deleteCustomer = require("./deleteCustomers");
const cleanIDGraphql = require("../../helpers/cleanIDGraphql.js");
const deleteOrder = require("../../orders/deleteOrders/deleteOrder");
const listAllCustomers = require("../searchCustomer/listAllCustomers");

const wholeSaleCustomersObject = require("./wholeSaleCustomers.json");
const getOrdersByCustomerId = require("../../orders/getOrders/getOrdersByCustomerId");

const stallingForTime = (num = 1000) => {
  return new Promise((resolve) => {
    console.log("Stalling for shopify to update customer");
    setTimeout(() => {
      resolve();
    }, num);
  });
};

const deleteCustomerOrder = async (orders) => {
  try {
    const {
      edges: ordersEdges,
      pageInfo: { hasNextPage: hasNextPageOrder },
    } = orders;

    for (let j = 0; j < ordersEdges.length; j++) {
      const order = ordersEdges[j];
      const {
        node: { id: orderId },
      } = order;

      const result = await deleteOrder(cleanIDGraphql(orderId));
      console.log({ orderId }, result.body);
    }

    await stallingForTime(2000);

    if (hasNextPageOrder) {
      console.log("Order Has Next Page");
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw error;
  }
};

const deleteCustomerController = async (gid, email, i) => {
  try {
    const {
      data: { customerDelete },
    } = await deleteCustomer(gid);

    if (customerDelete.userErrors.length) {
      console.log("Delete Customer error");
      console.log("++++++++++++++++++++++++++++++");
      console.log(JSON.stringify(customerDelete.userErrors));
      console.log("++++++++++++++++++++++++++++++");
      if (customerDelete.userErrors[0].message === "Customer can't be found") {
        return true;
      }
      return false;
    }

    let ranNum = Math.floor(Math.random() * 255) + 1;
    const deleteMessage = `${email} ${i}`;
    console.log(`\u001b[38;5;${ranNum}m${deleteMessage}\u001b[0m`);
    return true;
  } catch (error) {
    throw error;
  }
};

const main = async () => {
  let isStillHasCustomers;
  do {
    isStillHasCustomers = false;
    let {
      data: { customers },
    } = await listAllCustomers(20);

		console.log("--------------Customers Found:", customers.edges.length + 1);

		if (customers.edges.length < 8) {
			console.log("==========================================");
			console.log(customers.edges.length);
			stallingForTime(15000)
		}

    for (let i = 0; i < customers.edges.length; i++) {
      isStillHasCustomers = true;
      try {
        const { id, email, tags } = customers.edges[i].node;

        // check if customer is apart of the wholesale list
        if (wholeSaleCustomersObject[email]) {
          console.log("STOP! Customer Found", email);
          return;
        }

        if (tags.toString().includes("B2B")) {
          console.log("STOP! B2B Customer Found", email);
          return;
        }

        const {
          data: { customer },
        } = await getOrdersByCustomerId(id);

        if (customer.orders.edges.length) {
          let orders = customer.orders;
          let ordersToBeDeleted = true;
          while (ordersToBeDeleted) {
            ordersToBeDeleted = await deleteCustomerOrder(orders);
            if (ordersToBeDeleted) {
              const {
                data: { customer },
              } = await getOrdersByCustomerId(id);
              orders = customer.orders;
            }
          }
        }

        let hasCustomerBeenDeleted = false;
        do {
          hasCustomerBeenDeleted = await deleteCustomerController(id, email, i);
          if (!hasCustomerBeenDeleted) {
            await stallingForTime(3000);
          }
        } while (!hasCustomerBeenDeleted);
      } catch (error) {
        console.log(error);
      }
    }
  } while (isStillHasCustomers);

	console.log("Exited");
};

main();
