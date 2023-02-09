const buildAxiosQuery = require("./buildAxiosQuery");
/**
 * @param  {String} param.title  Title of the product
 * @param  {String} param.vendor Vendor/Artist associated to the art
 * @return {Object}              The product
 */

const searchMensBasicTeeByTitleGraph = function({ title, vendor }) {
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
                vendor
                tags
              }
            }
          }
        }
      `;
      const variables = {
        num: 50,
        query: `title:'${title}' AND vendor:'${vendor}' AND product_type:Tee AND tag:style-basic AND tag:gender-mens`
      };

      const products = await buildAxiosQuery(query, variables);
      resolve(products);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = searchMensBasicTeeByTitleGraph;
