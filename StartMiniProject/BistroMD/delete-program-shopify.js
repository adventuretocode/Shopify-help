// Delete Shopify
// Delete Recharge
import dotenv from "dotenv";
import Recharge from "./ReCharge/Recharge.js";
import Shopify from "shopify-api-node";
import ShopifyCustom from "./Shopify/Shopify.js";
import cleanIDGraphql from "../../helpers/cleanIDGraphql.js";

dotenv.config();

const DEBUG_MODE = true;
const { SHOP_NAME, SHOPIFY_KEY, SHOPIFY_ACCESS_TOKEN } = process.env;

const shopify = new Shopify({
  shopName: SHOP_NAME,
  apiKey: SHOPIFY_KEY,
  password: SHOPIFY_ACCESS_TOKEN,
});

const sleep = async (timeInMillieSec) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeInMillieSec);
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

      // const result = await deleteOrder(cleanIDGraphql(orderId));
      try {
        const result = await shopify.order.delete(cleanIDGraphql(orderId));
        console.log({ orderId }, result);
      } catch (error) {
        console.log(error);
        if (
          error.response.body.errors.base[0] ===
          "Cannot delete orders brokered by Shopify"
        ) {
          // await ShopifyCustom.Orders.archive(orderId);
        }
      }
    }

    await sleep(1000);

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

const deleteCustomerController = async (gid, email) => {
  try {
    const result = await ShopifyCustom.Customers.deleteCustomerGraphQL(gid);
    // TODO: may error out
    const { customerDelete } = result;

    if (customerDelete.userErrors.length) {
      console.log("Delete Customer error");
      console.log("++++++++++++++++++++++++++++++");
      console.log(JSON.stringify(customerDelete.userErrors));
      console.log("++++++++++++++++++++++++++++++");
      if (customerDelete.userErrors[0].message === "Customer can't be found") {
        return true;
      } else if (
        customerDelete.userErrors[0].message ===
          "Customer cannot be deleted because of existing subscription contracts" ||
        // TODO: Orders have this issue: "Cannot delete orders brokered by Shopify"
        customerDelete.userErrors[0].message ===
          "Customer can’t be deleted because they have associated orders"
      ) {
        return "Tag Customer";
      }
      return false;
    }

    let ranNum = Math.floor(Math.random() * 255) + 1;
    const deleteMessage = `${email}`;
    console.log(`\u001b[38;5;${ranNum}m${deleteMessage}\u001b[0m`);
    return true;
  } catch (error) {
    throw error;
  }
};

const shopifyRemoveCustomerAndOrders = async (email) => {
  try {
    const customerResults =
      await ShopifyCustom.Customers.findCustomerByEmailWithOrder(email);

    const {
      customers: { edges: customers },
    } = customerResults;

    if (!customers.length) {
      console.log("No customer found on Shopify");
      return;
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
          const { data } =
            await ShopifyCustom.Customers.findCustomerByEmailWithOrder(email);
          const {
            customers: { edges: customers },
          } = data;
          orders = customers[0].node.orders;
        }
      }
    }

    // delete metafield

    const gid = customer.node.id;
    if (gid) {
      // TODO: should return object
      // currently returning bool and string
      let hasCustomerBeenDeleted = false;
      do {
        hasCustomerBeenDeleted = await deleteCustomerController(gid, email);
        if (!hasCustomerBeenDeleted) {
          await sleep(3000);
        }
      } while (!hasCustomerBeenDeleted);
      return hasCustomerBeenDeleted;
    }
  } catch (error) {
    console.log(error);
  }
};

const removeShopifyCustomers = async (customer) => {
  const { email, id: gid } = customer.node;

  try {
    let isTagCustomer = false;
    try {
      const result = await shopifyRemoveCustomerAndOrders(email);
      if (result === "Tag Customer") {
        isTagCustomer = true;
      }
    } catch (error) {
      console.log("Shopify Delete error");
      console.log(error);
    }

    try {
      if (isTagCustomer) {
        await ShopifyCustom.Customers.tagCustomer(gid, "pre-migration");
        console.log("===== Tag Customer: pre-migration =====");
        await ShopifyCustom.Customers.tagRemove(gid, "Active Subscriber")
        console.log("===== Remove Tag: Active Subscriber =====");
      }
    } catch (error) {
      console.log("Shopify Delete error");
      console.log(error);
    }

    if (DEBUG_MODE) {
      console.log(`\u001b[38;5;${cleanIDGraphql(gid) % 255}m${email}\u001b[0m`);
    }
  } catch (error) {
    throw error;
  }
};

const deleteMany = async () => {
  console.time();
  try {
    while (true) {
      // List recharge customers
      const {
        customers: { edges: shopifyCustomers },
      } = await ShopifyCustom.Customers.listCustomerByQuery(
        ""
      );

      if (shopifyCustomers.length == 0) {
        return "Completed";
      }

      const length = shopifyCustomers.length;
      for (let i = 0; i < length; i++) {
        const customer = shopifyCustomers[i];
        try {
          await removeShopifyCustomers(customer);
        } catch (error) {
          console.log(error);
          console.log("===== removeShopifyCustomers ========");
        }
      }
    }
  } catch (error) {
    throw error;
  }
};

deleteMany()
  .then((success) => {
    console.log("==========================================");
    console.log(success);
    console.log("==========================================");
    console.timeEnd();
    console.log("==========================================");
    process.exit();
  })
  .catch((err) => {
    console.log("==========================================");
    console.log(err);
    console.log("==========================================");
    console.timeEnd();
    console.log("==========================================");
    process.exit();
  });

const deleteOne = async (email) => {
  try {
    const { customers } = await Recharge.Customers.findByEmail(email);
    if (customers.length != 1) {
      throw new Error(`Customers does not equal to one`);
    }

    await removeShopifyCustomers(customers[0]);
  } catch (error) {
    throw error;
  }
};

// deleteOne()
//   .then((success) => {
//     console.log("==========================================");
//     console.log(success);
//     console.log("==========================================");
//     console.timeEnd();
//     console.log("==========================================");
//     process.exit();
//   })
//   .catch((err) => {
//     console.log("==========================================");
//     console.log(err);
//     console.log("==========================================");
//     console.timeEnd();
//     console.log("==========================================");
//     process.exit();
//   });
