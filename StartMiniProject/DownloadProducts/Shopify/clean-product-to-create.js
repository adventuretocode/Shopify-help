const WEIGHT_UNIT_MAP = [
  { graphName: "KILOGRAMS", restName: "kg" },
  { graphName: "GRAMS", restName: "g" },
  { graphName: "POUNDS", restName: "lbs" },
  { graphName: "OUNCES", restName: "oz" },
];

/**
 * Create product using graphQL
 *
 * @param  {<Object>}       param               Product object from Rest query
 * @param  {String}         param.title         Product title
 * @param  {String}         param.body_html     Product content on pdp
 * @param  {String}         param.vendor        Product artist
 * @param  {String}         param.product_type  Product type
 * @param  {String}         param.handle        Product URL
 * @param  {Array<String>}  param.tags          Product tags
 * @param  {Array<Object>}  param.variants      Variants attached to this product
 * @param  {Array<Object>}  param.options       Options selected such as size
 * @param  {Array<Object>}  param.images        Images attached to product
 * @param  {Array<Object>}  param.image         Image variant attaches itself too
 * @param  {Array<Object>}  param.metafields    metafields of the product
 * @param  {String}         template_suffix     Template product to be used
 * @return {Promise<{Object}>}
 */

export const cleanProductToCreateGraphql = (
  {
    product: {
      title,
      body_html,
      vendor,
      product_type,
      handle,
      tags,
      variants,
      options,
      images,
      image,
      metafields,
    },
  },
  template_suffix = ""
) => {
  try {
    const cleanTags = tags.split(", ");

    const cleanOption = options.map(({ name }) => {
      return name;
    });

    const cleanImages = images.map((image) => {
      return image?.src ? { src: image.src } : {};
    });

    const cleanVariant = variants.map(
      ({
        option1 = null,
        option2 = null,
        option3 = null,
        price,
        sku,
        title,
        weight,
        inventory_policy,
        requires_shipping,
        inventory_management,
        weight_unit,
      }) => {
        const weightUnit = WEIGHT_UNIT_MAP.find(
          (weightUnit) => weightUnit.restName == weight_unit
        );
        return {
          imageSrc: image?.src ? image.src : null,
          inventoryItem: {
            tracked: inventory_management == "shopify" ? true : false,
          },
          inventoryPolicy: inventory_policy.toUpperCase(),
          options: [option1, option2, option3],
          price,
          requiresShipping: requires_shipping,
          sku,
          title,
          weight,
          weightUnit: weightUnit.graphName,
        };
      }
    );

    const cleanProduct = {
      input: {
        handle,
        bodyHtml: body_html,
        images: cleanImages,
        options: cleanOption,
        productType: product_type,
        tags: cleanTags,
        title,
        vendor,
        variants: cleanVariant,
      },
    };

    if (template_suffix) {
      cleanProduct.input.template_suffix = template_suffix;
    }

    if (metafields && metafields.length) {
      cleanProduct.metafields = metafields.map(
        ({ key, value, value_type, namespace }) => {
          return {
            key,
            value,
            value_type,
            namespace,
          };
        }
      );
    }

    return cleanProduct;
  } catch (error) {
    throw error;
  }
};
