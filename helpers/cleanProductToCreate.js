/**
 * Create Product via shopify rest api
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
 * @param  {Array<Object>}  param.metafields    metafields of the product
 * @return {Promise<Object>}
 */

exports.cleanProductToCreateRest = (
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
      metafields
    }
  },
  template_suffix = ""
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const cleanVariant = variants.map(
        ({
          title,
          price,
          sku,
          option1,
          option2,
          option3,
          weight,
          weight_unit
        }) => {
          return {
            title,
            price,
            sku,
            option1,
            option2,
            option3,
            weight,
            weight_unit
          };
        }
      );

      const cleanOption = options.map(({ name, values }) => {
        return { name, values };
      });

      const cleanImages = images.map(({ src }) => {
        return { src };
      });

      const cleanProduct = {
        product: {
          title,
          body_html,
          vendor,
          product_type,
          handle,
          published: true,
          template_suffix,
          tags,
          variants: cleanVariant,
          options: cleanOption,
          images: cleanImages
        }
      };

      if (metafields && metafields.length) {
        cleanProduct.metafields = metafields.map(
          ({ key, value, value_type, namespace }) => {
            return {
              key,
              value,
              value_type,
              namespace
            };
          }
        );
      }

      resolve(cleanProduct);
    } catch (error) {
      reject(error);
    }
  });
};

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

exports.cleanProductToCreateGraphql = (
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
      metafields
    }
  },
  template_suffix = ""
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const cleanTags = tags.split(", ");

      const cleanOption = options.map(({ name }) => {
        return name;
      });

      const cleanImages = images.map(({ src }) => {
        return { src };
      });

      const cleanVariant = variants.map(
        ({
          option1 = null,
          option2 = null,
          option3 = null,
          price,
          sku,
          title,
          weight
        }) => {
          return {
            imageSrc: image.src,
            inventoryItem: {
              tracked: false
            },
            inventoryPolicy: "DENY",
            options: [option1, option2, option3],
            price,
            requiresShipping: true,
            sku,
            title,
            weight,
            weightUnit: "POUNDS"
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
          variants: cleanVariant
        }
      };

      if(template_suffix) {
        cleanProduct.input.template_suffix = template_suffix;
      }

      if (metafields && metafields.length) {
        cleanProduct.metafields = metafields.map(
          ({ key, value, value_type, namespace }) => {
            return {
              key,
              value,
              value_type,
              namespace
            };
          }
        );
      }

      resolve(cleanProduct);
    } catch (error) {
      reject(error);
    }
  });
};
