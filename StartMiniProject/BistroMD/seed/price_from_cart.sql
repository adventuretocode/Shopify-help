DROP TABLE IF EXISTS `_price_from_cart`;
CREATE TABLE `_price_from_cart` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `price` double DEFAULT NULL,
  `recurring_price` double DEFAULT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `shopify_sku` varchar(255) DEFAULT NULL,
  `ProductName` varchar(255) DEFAULT NULL,
  `product_type` varchar(255) DEFAULT NULL,
  `snack_type` varchar(255) DEFAULT NULL,
  `VariantName` varchar(255) DEFAULT NULL,
  `external_product_name` varchar(255) DEFAULT NULL,
  `external_product_id` varchar(255) DEFAULT NULL,
  `external_variant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
