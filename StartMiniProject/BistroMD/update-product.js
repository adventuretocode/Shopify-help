import dotenv from "dotenv";

dotenv.config();

import ORM from "./db/orm.js";
import cleanIdGraphql from "./helpers/cleanIdGraphql.js";
import findProductBySku from "./services/findProductBySku.js";

const processDatabaseResults = async (rowData) => {
  for (let i = 0; i < rowData.length; i++) {
    try {
      const row = rowData[i];
      const {
        shopify_sku,
        external_product_id,
        external_product_name,
        external_variant_id,
        recurring_price,
      } = row;

      const product = await findProductBySku(shopify_sku);
      const { title, id: productId, variants } = product;
      const variant = variants.edges.find(
        ({ node }) => node.sku === shopify_sku
      );
      const { price, id: variantId } = variant.node;
      const whereClaus = "shopify_sku='" + shopify_sku + "'";

      console.log({ title, productId, price, variantId });

      if (!external_product_id) {
        await ORM.updateOne(
          "prices_from_cart",
          "external_product_id",
          cleanIdGraphql(productId),
          whereClaus
        );
      }
      if (!external_product_name) {
        await ORM.updateOne(
          "prices_from_cart",
          "external_product_name",
          title,
          whereClaus
        );
      }
      if (!external_variant_id) {
        await ORM.updateOne(
          "prices_from_cart",
          "external_variant_id",
          cleanIdGraphql(variantId),
          whereClaus
        );
      }
      if (!recurring_price) {
        await ORM.updateOne(
          "prices_from_cart",
          "recurring_price",
          price,
          whereClaus
        );
      }
      const result = await ORM.findOne("prices_from_cart", whereClaus);
      console.log(result);
    } catch (error) {
			console.log(rowData[i]);
      console.log(error);
    }
  }
};

const main = async () => {
  try {
    const result = await ORM.selectAll("prices_from_cart");
    processDatabaseResults(result);
  } catch (error) {
    console.log("Error: ", error);
  }
};

main();
