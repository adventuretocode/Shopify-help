require("../../config");
const cleanData = require("../../helpers/cleanData.js");
const buildGraphqlQuery = require("../../helpers/buildGraphqlQuery.js");

const { SHOP, ACCESS_TOKEN } = process.env;

const searchProductByTitle = function(title) {
  return new Promise(async function(resolve, reject) {
    try {
      const query = `
        query mensBasicTeeByTitle($num: Int!, $query: String!) {
          products(first: $num, query: $query) {
            edges {
              node {
                id
                handle
                title
              }
            }
          }
        }
      `;
      const variables = {
        num: 50,
        query:
          `title:${title} AND product_type:Tee AND tag:style-basic AND tag:gender-mens`
      };
      const product =  await buildGraphqlQuery(query, variables, SHOP, ACCESS_TOKEN);
      resolve(product);
    } catch (error) {
      reject(error);
    }
  });
};

const prepareSmartCollection = function(title) {
  return new Promise(async function(resolve, reject) {
    try {
      const vendor = await searchProductByTitle(title);
      resolve(vendor);
    } catch (error) {
      reject(error);
    }
  });
};

const main = async function(arr) {
  try {
    for (let i = 0; i < arr.length; i += 1) {
      const thing = await prepareSmartCollection(arr[i]);
      console.log("thing", thing);
    }
  } catch (error) {
    throw error;
  }
};

const arrayOfTitle = require("./titlesOfNewProducts.json");
main(arrayOfTitle)
  .then(success => console.log("Success", success))
  .catch(error => console.log("Error: Main - ", error));
