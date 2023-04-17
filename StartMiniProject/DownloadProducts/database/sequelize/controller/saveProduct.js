import { Product, Variant, Option } from "../models/Product.js";
import consoleColor from '../../../helper/consoleColor.js'

const saveProduct = async (data) => {
  try {
    // Create product record
    const product = await Product.create({
      id: data.id,
      shopify_id: data.id,
      title: data.title,
      body_html: data.body_html,
      vendor: data.vendor,
      product_type: data.product_type,
      created_at: data.created_at,
      handle: data.handle,
      updated_at: data.updated_at,
      published_at: data.published_at,
      template_suffix: data.template_suffix,
      status: data.status,
      published_scope: data.published_scope,
      tags: data.tags,
      admin_graphql_api_id: data.admin_graphql_api_id,
    });

    // Create variants records
    const variants = await Promise.all(
      data.variants.map(async (variantData) => {
        const variant = await Variant.create({
          id: variantData.id,
          shopify_id: variantData.id,
          product_id: product.id,
          title: variantData.title,
          price: variantData.price,
          sku: variantData.sku,
          position: variantData.position,
          inventory_policy: variantData.inventory_policy,
          compare_at_price: variantData.compare_at_price,
          fulfillment_service: variantData.fulfillment_service,
          inventory_management: variantData.inventory_management,
          option1: variantData.option1,
          option2: variantData.option2,
          option3: variantData.option3,
          created_at: variantData.created_at,
          updated_at: variantData.updated_at,
          taxable: variantData.taxable,
          barcode: variantData.barcode,
          grams: variantData.grams,
          image_id: variantData.image_id,
          weight: variantData.weight,
          weight_unit: variantData.weight_unit,
          inventory_item_id: variantData.inventory_item_id,
          inventory_quantity: variantData.inventory_quantity,
          old_inventory_quantity: variantData.old_inventory_quantity,
          requires_shipping: variantData.requires_shipping,
          admin_graphql_api_id: variantData.admin_graphql_api_id,
        });
        return variant;
      })
    );

    // Create options records
    const options = await Promise.all(
      data.options.map(async (optionData) => {
        const option = await Option.create({
          id: optionData.id,
          shopify_id: optionData.id,
          product_id: product.id,
          name: optionData.name,
          position: optionData.position,
          values: optionData.values,
        });
        return option;
      })
    );

    consoleColor(data.id, `Saved! Shopify ID: ${data.id} Handle: ${data.handle}`);
    return "Saved!";
  } catch (error) {
    console.error(`Error saving product: ${error}`);
    throw error;
  }
};

export default saveProduct;
