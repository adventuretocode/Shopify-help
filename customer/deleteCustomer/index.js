const path = require("path");
const fs = require("fs");
const neatCsv = require("neat-csv");
const findCustomerByEmailWithOrder = require("../searchCustomer/customerSearchByEmailWithOrders");
const deleteCustomer = require("./deleteCustomers");
const cleanIDGraphql = require("../../helpers/cleanIDGraphql.js");
const deleteOrder = require("../../orders/deleteOrders/deleteOrder");

const stallingForTime = (num) => {
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

const main = (start = 0) => {
  const file = path.resolve(__dirname, "../order-filler.csv");

  fs.readFile(file, async (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const csvArr = await neatCsv(data);
    for (let i = start; i < csvArr.length; i++) {
      try {
        const { email } = csvArr[i];
        const { data } = await findCustomerByEmailWithOrder(email);
        const {
          customers: { edges: customers },
        } = data;
        if (!customers.length) {
          console.log("No customer found");
          continue;
        } else if (customers.length > 1) {
          console.log("More than one is found");
        }

        const customer = customers[0];

        if (customer.node.orders.edges.length) {
          let orders = customer.node.orders;
          let ordersToBeDeleted = true;
          while (ordersToBeDeleted) {
            ordersToBeDeleted = await deleteCustomerOrder(orders);
            if (ordersToBeDeleted) {
              const { data } = await findCustomerByEmailWithOrder(email);
              const {
                customers: { edges: customers },
              } = data;
              orders = customers[0].node.orders;
            }
          }
        }

        const gid = customer.node.id;
        if (gid) {
          let hasCustomerBeenDeleted = false;
          do {
            hasCustomerBeenDeleted = await deleteCustomerController(
              gid,
              email,
              i
            );
            if (!hasCustomerBeenDeleted) {
              await stallingForTime(3000);
            }
          } while (!hasCustomerBeenDeleted);
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
};

main();
