require("dotenv").config();
const axiosRequest = require("../../../helpers/axiosRequest.js");
const fsWriteFile = require("../../../helpers/fsWriteFile");
const path = require("path");

const { SHOP, ACCESS_TOKEN, ENV } = process.env;

const buildAxiosBody = function(query, variables) {
  return new Promise(async function(resolve, reject){
    const option = {
      url: `https://${SHOP}.myshopify.com/admin/api/2019-10/graphql.json`,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ACCESS_TOKEN,
      },
      method: 'post',
      data: {
        query: query,
        variables: variables,
      },
    }
    
    try {
      const data = await axiosRequest(option);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });

}
/**
 * Query the admin to get products with specific tags
 *
 * @param   {String|Number} id The cursor is the spot where to query from next
 * @returns {Promise}          Return array of ids from the product
 */

const buildGraphqlQuery = function(id) {
  return new Promise(async function(resolve, reject) {
      const query = `
      mutation publishProductToWeb($product_id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $product_id, input: $input) {
          shop {
            name
          }
          userErrors {
            field
            message
          }
        }
      }
      `;
      
      const variables = {
        "product_id": "gid://shopify/Product/" + id,
        "input": [
          { 
            "publicationId": "gid://shopify/Publication/27298857049"
          }
        ]
      }

      try {
        const data = await buildAxiosBody(query, variables);
        resolve(data);
      } catch (error) {
        reject(error);
      }
  });
    
};

const main = async function(id) {
  try {
    const graphObject = buildGraphqlQuery(id);

    return graphObject;
  } catch (error) {
    throw error;
  }
};

main(4348923445347)
  .then(success => console.log("Success: ", success))
  .catch(error => { 
    console.log("Error: ", error);
    fsWriteFile(path.join(__dirname, `./error${ENV}/${4348923445347}.json`), error);
  });
  // .catch(({ errors: [ error ] }) => console.log("Error: ", error.message));
