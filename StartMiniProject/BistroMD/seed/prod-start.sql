CREATE DATABASE IF NOT EXISTS `bistromd`;
USE `bistromd`;

DROP TABLE IF EXISTS `prod_bistro_recharge_migration`;
CREATE TABLE `prod_bistro_recharge_migration` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `gender` ENUM("Male", "Female"),
  `customer_id` INT DEFAULT NULL,
  `external_product_name` varchar(100) DEFAULT NULL,
  `external_variant_name` varchar(100) DEFAULT NULL,
  `external_product_id` bigint DEFAULT NULL,
  `external_variant_id` bigint NOT NULL,
  `quantity` int DEFAULT NULL,
  `recurring_price` float DEFAULT NULL,
  `charge_interval_unit_type` varchar(20) DEFAULT NULL,
  `charge_interval_frequency` int DEFAULT NULL,
  `shipping_interval_unit_type` varchar(10) DEFAULT NULL,
  `shipping_interval_frequency` int DEFAULT NULL,
  `is_prepaid` varchar(30) DEFAULT '',
  `charge_on_day_of_month` varchar(30) DEFAULT '',
  `last_charge_date` varchar(30) DEFAULT '',
  `next_charge_date` varchar(30) DEFAULT NULL,
	`shipping_day` varchar(30) DEFAULT NULL,
	`program_week` varchar(5) DEFAULT NULL,
  `status` ENUM("active", "cancelled", "DONT_PROCESS"),
  `customer_stripe_id` varchar(16) DEFAULT NULL,
	`authorizedotnet_customer_profile_id` varchar(30),
	`authorizedotnet_customer_payment_profile_id` varchar(30),
  `customer_created_at` varchar(30) DEFAULT '',
  `shipping_email` varchar(100) NOT NULL,
  `shipping_first_name` varchar(30) DEFAULT NULL,
  `shipping_last_name` varchar(50) DEFAULT NULL,
  `shipping_phone` varchar(30) DEFAULT NULL,
  `shipping_address_1` varchar(255) DEFAULT NULL,
  `shipping_address_2` varchar(150) DEFAULT NULL,
  `shipping_city` varchar(30) DEFAULT NULL,
  `shipping_province` varchar(5) DEFAULT NULL,
  `shipping_zip` varchar(20) DEFAULT NULL,
  `shipping_country` varchar(50) DEFAULT NULL,
  `shipping_company` varchar(50) DEFAULT NULL,
  `billing_first_name` varchar(100) DEFAULT NULL,
  `billing_last_name` varchar(100) DEFAULT NULL,
  `billing_address_1` varchar(255) DEFAULT NULL,
  `billing_address_2` varchar(250) DEFAULT NULL,
  `billing_city` varchar(30) DEFAULT NULL,
  `billing_postalcode` varchar(30) DEFAULT NULL,
  `billing_province_state` varchar(30) DEFAULT NULL,
  `billing_country` varchar(30) DEFAULT NULL,
  `billing_phone` varchar(30) DEFAULT NULL,
  UNIQUE(`customer_id`, `shipping_email`),
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `prod_source_bistro_recharge_migration`;
CREATE TABLE `prod_source_bistro_recharge_migration` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `gender` ENUM("Male", "Female"),
  `customer_id` INT DEFAULT NULL,
  `external_product_name` varchar(100) DEFAULT NULL,
  `external_variant_name` varchar(100) DEFAULT NULL,
  `external_product_id` bigint DEFAULT NULL,
  `external_variant_id` bigint NOT NULL,
  `quantity` int DEFAULT NULL,
  `recurring_price` float DEFAULT NULL,
  `charge_interval_unit_type` varchar(20) DEFAULT NULL,
  `charge_interval_frequency` int DEFAULT NULL,
  `shipping_interval_unit_type` varchar(10) DEFAULT NULL,
  `shipping_interval_frequency` int DEFAULT NULL,
  `is_prepaid` varchar(30) DEFAULT '',
  `charge_on_day_of_month` varchar(30) DEFAULT '',
  `last_charge_date` varchar(30) DEFAULT '',
  `next_charge_date` varchar(30) DEFAULT NULL,
	`shipping_day` varchar(30) DEFAULT NULL,
	`program_week` varchar(5) DEFAULT NULL,
  `status` ENUM("active", "cancelled", "DONT_PROCESS"),
  `customer_stripe_id` varchar(16) DEFAULT NULL,
	`authorizedotnet_customer_profile_id` varchar(30),
	`authorizedotnet_customer_payment_profile_id` varchar(30),
  `customer_created_at` varchar(30) DEFAULT '',
  `shipping_email` varchar(100) NOT NULL,
  `shipping_first_name` varchar(30) DEFAULT NULL,
  `shipping_last_name` varchar(50) DEFAULT NULL,
  `shipping_phone` varchar(30) DEFAULT NULL,
  `shipping_address_1` varchar(255) DEFAULT NULL,
  `shipping_address_2` varchar(150) DEFAULT NULL,
  `shipping_city` varchar(30) DEFAULT NULL,
  `shipping_province` varchar(5) DEFAULT NULL,
  `shipping_zip` varchar(20) DEFAULT NULL,
  `shipping_country` varchar(50) DEFAULT NULL,
  `shipping_company` varchar(50) DEFAULT NULL,
  `billing_first_name` varchar(100) DEFAULT NULL,
  `billing_last_name` varchar(100) DEFAULT NULL,
  `billing_address_1` varchar(255) DEFAULT NULL,
  `billing_address_2` varchar(250) DEFAULT NULL,
  `billing_city` varchar(30) DEFAULT NULL,
  `billing_postalcode` varchar(30) DEFAULT NULL,
  `billing_province_state` varchar(30) DEFAULT NULL,
  `billing_country` varchar(30) DEFAULT NULL,
  `billing_phone` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `prod_track__customer`;
CREATE TABLE `prod_track__customer` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `new_email` varchar(100) NOT NULL,
  `old_email` varchar(100),
  `action` ENUM("UPDATED", "CREATED", "NO CHANGE"),
  `status` ENUM("TO_ADD", "UPDATE", "COMPLETED", "NONE", "DONT_PROCESS"),
  `what_changed` TEXT,
  `program_status` ENUM("On Program","New Customer","Returning Customer","Card Declined","Fraud","Verify Address","Hold with Resume Date", "Finished","On Hold", "Never Started", "Gift Certificate Verify"),
  PRIMARY KEY (`id`)
);


ALTER TABLE `prod_bistro_recharge_migration`
   ADD `reprocessing` boolean default false;


SELECT
	`migration`.`shipping_email`,
	 `migration`.`customer_id` AS `leg_customer_id`
FROM
  `prod_bistro_recharge_migration` `migration`
INNER JOIN 
  `prod_holds_customers` `skip`
  ON `migration`.`customer_id` = `skip`.`leg_customer_id`
WHERE 
  `migration`.`shipping_day` = 'Monday' AND `migration`.`status` = 'active';


ALTER TABLE `customer_active_skip_monday`
  ADD `reprocessed` boolean default false,
  ADD `shipping_day` varchar(10) default 'Monday',
  ADD `status` varchar(10) default 'active';


ALTER TABLE `grand-father-price-full`
  ADD `reprocessed` boolean default false,
  ADD `is_same_price` boolean default false,
  ADD `current_price_is_lower` boolean default false,
  ADD `has_product_changed` boolean default false,
  ADD `has_cancelled` boolean default false,
  ADD `has_skips` boolean default false,
  ADD `has_pending_charge` boolean default false;

SELECT
 *
FROM
 `grand-father-customers`
INNER JOIN
  `prod_bistro_recharge_migration`
ON
  `grand-father-customers`.`Email` = `prod_bistro_recharge_migration`.`shipping_email`;

