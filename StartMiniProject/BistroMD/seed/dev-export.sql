SELECT 
  `external_product_name`,
  `external_variant_name`,
  `external_product_id`,
  `external_variant_id`,
  `quantity`,
  `recurring_price`,
  `charge_interval_unit_type`,
  `charge_interval_frequency`,
  `shipping_interval_unit_type`,
  `shipping_interval_frequency`,
  `is_prepaid`,
  `charge_on_day_of_month`,
  `last_charge_date`,
  `next_charge_date`,
  `status`,
  `customer_stripe_id`,
  `customer_created_at`,
  `shipping_email`,
  `shipping_first_name`,
  `shipping_last_name`,
  `shipping_phone`,
  `shipping_address_1`,
  `shipping_address_2`,
  `shipping_city`,
  `shipping_province`,
  `shipping_zip`,
  `shipping_country`,
  `shipping_company`,
  `billing_first_name`,
  `billing_last_name`,
  `billing_address_1`,
  `billing_address_2`,
  `billing_city`,
  `billing_postalcode`,
  `billing_province_state`,
  `billing_country`,
  `billing_phone`
FROM
  `dev_bistro_recharge_migration`
LIMIT 0, 5000;

-- 

SELECT
  `dev_bistro_recharge_migration`.`external_product_name`,
  `dev_bistro_recharge_migration`.`external_variant_name`,
  `dev_bistro_recharge_migration`.`external_product_id`,
  `dev_bistro_recharge_migration`.`external_variant_id`,
  `dev_bistro_recharge_migration`.`quantity`,
  `dev_bistro_recharge_migration`.`recurring_price`,
  `dev_bistro_recharge_migration`.`charge_interval_unit_type`,
  `dev_bistro_recharge_migration`.`charge_interval_frequency`,
  `dev_bistro_recharge_migration`.`shipping_interval_unit_type`,
  `dev_bistro_recharge_migration`.`shipping_interval_frequency`,
  `dev_bistro_recharge_migration`.`is_prepaid`,
  `dev_bistro_recharge_migration`.`charge_on_day_of_month`,
  `dev_bistro_recharge_migration`.`last_charge_date`,
  `dev_bistro_recharge_migration`.`next_charge_date`,
  `dev_bistro_recharge_migration`.`status`,
  `dev_bistro_recharge_migration`.`customer_stripe_id`,
  `dev_bistro_recharge_migration`.`customer_created_at`,
  `dev_bistro_recharge_migration`.`shipping_email`,
  `dev_bistro_recharge_migration`.`shipping_first_name`,
  `dev_bistro_recharge_migration`.`shipping_last_name`,
  `dev_bistro_recharge_migration`.`shipping_phone`,
  `dev_bistro_recharge_migration`.`shipping_address_1`,
  `dev_bistro_recharge_migration`.`shipping_address_2`,
  `dev_bistro_recharge_migration`.`shipping_city`,
  `dev_bistro_recharge_migration`.`shipping_province`,
  `dev_bistro_recharge_migration`.`shipping_zip`,
  `dev_bistro_recharge_migration`.`shipping_country`,
  `dev_bistro_recharge_migration`.`shipping_company`,
  `dev_bistro_recharge_migration`.`billing_first_name`,
  `dev_bistro_recharge_migration`.`billing_last_name`,
  `dev_bistro_recharge_migration`.`billing_address_1`,
  `dev_bistro_recharge_migration`.`billing_address_2`,
  `dev_bistro_recharge_migration`.`billing_city`,
  `dev_bistro_recharge_migration`.`billing_postalcode`,
  `dev_bistro_recharge_migration`.`billing_province_state`,
  `dev_bistro_recharge_migration`.`billing_country`,
  `dev_bistro_recharge_migration`.`billing_phone`
FROM
  `dev_sunday_track_customer`
RIGHT JOIN
  `dev_bistro_recharge_migration`
  ON `dev_bistro_recharge_migration`.`shipping_email` = `dev_sunday_track_customer`.`new_email`
 AND `dev_sunday_track_customer`.`type` = 'CREATED'
LIMIT 
  0, 5000;

--
