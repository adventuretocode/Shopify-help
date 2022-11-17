import axios from "axios";
const { SHOP_NAME, SHOPIFY_ACCESS_TOKEN, SHOPIFY_API_VERSION } = process.env;

const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const buildGraphqlQuery = async (query, variables) => {
  try {
    const options = {
      url: `https://${SHOP_NAME}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      method: "POST",
      data: {
        query: query,
        variables: variables,
      },
    };

    const result = await axios(options);
    const { data, extensions, errors } = result.data;

    if (errors) { throw errors; }

    const { cost } = extensions;

    const {
      throttleStatus: { currentlyAvailable },
    } = cost;

    if (currentlyAvailable < 1000) {
      console.log("currentlyAvailable: ", currentlyAvailable);
      await sleep(2000);
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export default buildGraphqlQuery;
