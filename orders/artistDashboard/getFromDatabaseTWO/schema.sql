-- Old method joining the tranaction table with the order table
-- Then joining them togther then exporting
USE `artist_dashboard`
CREATE TABLE `transaction_table` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) DEFAULT NULL,
  `order` varchar(20) DEFAULT NULL,
  `order_created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
);

USE `artist_dashboard`
CREATE TABLE `order_export` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `order` varchar(20) DEFAULT NULL,
  `product_title` text DEFAULT NULL,
  `quantity` int(4) DEFAULT NULL,
  `vendor` varchar(30) DEFAULT NULL,
  `shipping_fulfillment` varchar(20) DEFAULT NULL,
  `commissions_paid` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
);

SELECT `order_export`.`id`, `transaction_export`.`order`, `transaction_export`.`order_id`, 
`transaction_export`.`order_created_at`, `order_export`.`product_title`, 
`order_export`.`quantity`, `order_export`.`vendor`, `order_export`.`shipping_fulfillment`, 
`order_export`.`commissions_paid` 
FROM `transaction_export`
INNER JOIN `order_export` 
ON `transaction_export`.`order`=`order_export`.`order`;

-- 
-- 
-- 


-- New way is just to use only the order_export table 
-- Search for the product type by variant sku
-- Order table is created with matching column names for easier import
-- Alter tables are included to test and import many different csv files

CREATE TABLE `orders` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `1. Name` varchar(20) DEFAULT NULL,
  `52. Id` bigint(20) DEFAULT NULL,
  `16. Create at` datetime DEFAULT NULL,
  `18. Lineitem name` text DEFAULT NULL,
  `17. Lineitem quantity` int(4) DEFAULT NULL,
  `51. Vendor` varchar(30) DEFAULT NULL,
  `product_type` varchar(20) DEFAULT NULL,
  `21. Lineitem sku` TEXT,
  `commissions_paid` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
);


ALTER TABLE `orders`
  CHANGE COLUMN `1. Name` `order`
    varchar(20) DEFAULT NULL;

ALTER TABLE `orders`
  CHANGE COLUMN `52. Id` `order_id`
    bigint(20) DEFAULT NULL;

ALTER TABLE `orders`
  CHANGE COLUMN `16. Create at` `order_created_at`
    datetime DEFAULT NULL;

ALTER TABLE `orders`
  CHANGE COLUMN `18. Lineitem name` `product_title`
    text DEFAULT NULL;

ALTER TABLE `orders`
  CHANGE COLUMN `17. Lineitem quantity` `quantity`
    int(4) DEFAULT NULL;

ALTER TABLE `orders`
  CHANGE COLUMN `51. Vendor` `vendor`
    varchar(30) DEFAULT NULL;

ALTER TABLE `orders`
  CHANGE COLUMN `21. Lineitem sku` `variant_sku`
    TEXT;


--

ALTER TABLE `orders`
  CHANGE COLUMN `order` `1. Name` 
    varchar(20) DEFAULT NULL;

ALTER TABLE `orders`
  CHANGE COLUMN `order_id` `52. Id` 
    bigint(20) DEFAULT NULL;

ALTER TABLE `orders`
  CHANGE COLUMN `order_created_at` `16. Create at` 
    datetime DEFAULT NULL;

ALTER TABLE `orders`
  CHANGE COLUMN `product_title` `18. Lineitem name` 
    text DEFAULT NULL;

ALTER TABLE `orders`
  CHANGE COLUMN `quantity` `17. Lineitem quantity` 
    int(4) DEFAULT NULL;

ALTER TABLE `orders`
  CHANGE COLUMN `vendor` `51. Vendor` 
    varchar(30) DEFAULT NULL;

ALTER TABLE `orders`
  CHANGE COLUMN `variant_sku` `21. Lineitem sku` 
    TEXT;
