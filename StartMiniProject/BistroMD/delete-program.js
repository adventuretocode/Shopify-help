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
      const result = await shopify.order.delete(cleanIDGraphql(orderId));
      console.log({ orderId }, result);
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
      let hasCustomerBeenDeleted = false;
      do {
        hasCustomerBeenDeleted = await deleteCustomerController(gid, email);
        if (!hasCustomerBeenDeleted) {
          await sleep(3000);
        }
      } while (!hasCustomerBeenDeleted);
    }
  } catch (error) {
    console.log(error);
  }
};

const rechargeRemoveCustomerAndSubscriptions = async (rechargeCustomer) => {
  const { id, subscriptions_total_count } = rechargeCustomer;

  try {
    if (subscriptions_total_count > 0) {
      // Cancel the subscription
      const subscriptionsResult = await Recharge.Subscriptions.list(id);
      // TODO: next with next_cursor
      const { next_cursor, subscriptions } = subscriptionsResult;
      for (let i = 0; i < subscriptions.length; i++) {
        const subscription = subscriptions[i];
        const { id: subscription_id, status } = subscription;
        if (status === "active") {
          await Recharge.Subscriptions.cancel(subscription_id);
        }
        await Recharge.Subscriptions.remove(subscription_id);
      }
    }

    await Recharge.Customers.remove(id);
    // Cancel active subscription first
    return "Success";
  } catch (error) {
    console.log("Unable to remove customer from Recharge");
    throw error;
  }
};

const removeCustomerReChargeAndShopify = async (rechargeCustomer) => {
  const {
    email,
    subscriptions_total_count,
    external_customer_id: { ecommerce: shopify_customer_id },
  } = rechargeCustomer;

  // Temporary due to Shopify error
  // the customer has an active subscription now, or if the customer ever had a subscription in the past
  if (subscriptions_total_count > 0) {
    return "";
  }

  try {
    try {
      await rechargeRemoveCustomerAndSubscriptions(rechargeCustomer);
    } catch (error) {
      console.log("Recharge Delete error");
      console.log(error);
    }

    try {
      await shopifyRemoveCustomerAndOrders(email);
    } catch (error) {
      console.log("Shopify Delete error");
      console.log(error);
    }

    if (DEBUG_MODE) {
      console.log(`\u001b[38;5;${id % 255}m${email}\u001b[0m`);
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
      const { customers: rechargeCustomers } =
        await Recharge.Customers.listAnyCustomer();

      if (rechargeCustomers.length == 0) {
        return "Completed";
      }

      const length = rechargeCustomers.length;
      for (let i = 0; i < length; i++) {
        const customer = rechargeCustomers[i];
        try {
          await removeCustomerReChargeAndShopify(customer);
        } catch (error) {
          console.log(error);
          console.log("===== removeCustomerReChargeAndShopify ========");
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

    await removeCustomerReChargeAndShopify(customers[0]);
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
