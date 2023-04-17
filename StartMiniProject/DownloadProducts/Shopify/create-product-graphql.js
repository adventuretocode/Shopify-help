import { cleanProductToCreateGraphql } from "./clean-product-to-create.js";
import { networkRequestGraphQL, buildGraphqlOptions } from "./base.js";

const graphqlCreateProduct = async (input) => {
  try {
    const query = `
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
              handle
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

    const options = buildGraphqlOptions(query, input);
    const result = await networkRequestGraphQL(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const createProductGraphql = async (productData) => {
  try {
    const cleanProduct = await cleanProductToCreateGraphql(productData);
    const createdProduct = await graphqlCreateProduct(cleanProduct);
    return createdProduct;
  } catch (error) {
    throw error;
  }
};

export default createProductGraphql;
