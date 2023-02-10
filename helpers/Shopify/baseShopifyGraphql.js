import axios from "axios";
const { SHOPIFY_DOMAIN, SHOPIFY_TOKEN, SHOPIFY_VERSION } = process.env;

const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const baseShopifyGraphql = async (query, variables) => {
  try {
    const options = {
      data: {
        query: query,
        variables: variables,
      },
      method: "POST",
      url: `/admin/api/${SHOPIFY_VERSION}/graphql.json`,
      baseURL: `https://${SHOPIFY_DOMAIN}.myshopify.com`,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_TOKEN,
      },
    };

    const result = await axios(options);
    const { data, extensions, errors } = result.data;

    if (errors) {
      throw errors;
    }

    const { cost } = extensions;

    const {
      throttleStatus: { currentlyAvailable },
    } = cost;

    if (currentlyAvailable < 1000) {
      console.log("currentlyAvailable: ", currentlyAvailable);
      await sleep(1000);
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export default baseShopifyGraphql;
