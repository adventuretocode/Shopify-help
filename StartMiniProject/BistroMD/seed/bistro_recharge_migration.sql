CREATE DATABASE IF NOT EXISTS `bistromd`;
USE `bistromd`;
DROP TABLE IF EXISTS `_bistro_recharge_migration`;
CREATE TABLE `_bistro_recharge_migration` (
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
  `status` varchar(30) DEFAULT '',
  `customer_stripe_id` varchar(16) DEFAULT NULL,
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

DROP TABLE IF EXISTS `_source_bistro_recharge_migration`;
CREATE TABLE `_source_bistro_recharge_migration` (
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
  `status` varchar(30) DEFAULT '',
  `customer_stripe_id` varchar(16) DEFAULT NULL,
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
