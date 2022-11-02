import axios from "axios";
// import dotenv from "dotenv";

// dotenv.config({ path: `./.env` });

const { SHOP_NAME, SHOPIFY_API_VERSION, SHOPIFY_ACCESS_TOKEN } = process.env;

const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

// TODO: Write docs
export const buildOptions = (url, method, params, data) => {
  // TODO: throw errors if url, method, or data is missing
  try {
    const options = {
      url: url,
      method: method,
      params: params,
      data: data,
      baseURL: `https://${SHOP_NAME}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}`,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
    };

    if (!data) delete options.data;
    if (!params) delete options.params;

    return options;
  } catch (error) {
    throw error;
  }
};

export const buildGraphqlOptions = (query, variables) => {
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

  return options;
};

export const networkRequest = async (options) => {
  try {
    const result = await axios(options);
    return result.data;
  } catch (error) {
    throw error;
  }
};

export const networkRequestGraphQL = async (options) => {
  try {
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
      await sleep(2000);
    }
    return data;
  } catch (error) {
    throw error;
  }
};
