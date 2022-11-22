SELECT
  `migration`.`external_product_name`,
  `migration`.`external_variant_name`,
  `migration`.`external_product_id`,
  `migration`.`external_variant_id`,
  `migration`.`quantity`,
  `migration`.`recurring_price`,
  `migration`.`charge_interval_unit_type`,
  `migration`.`charge_interval_frequency`,
  `migration`.`shipping_interval_unit_type`,
  `migration`.`shipping_interval_frequency`,
  `migration`.`is_prepaid`,
  `migration`.`charge_on_day_of_month`,
  `migration`.`last_charge_date`,
  `migration`.`next_charge_date`,
  `migration`.`status`,
  `migration`.`customer_stripe_id`,
  `migration`.`authorizedotnet_customer_profile_id`,
  `migration`.`authorizedotnet_customer_payment_profile_id`,
  `migration`.`customer_created_at`,
  `migration`.`shipping_email`,
  `migration`.`shipping_first_name`,
  `migration`.`shipping_last_name`,
  `migration`.`shipping_phone`,
  `migration`.`shipping_address_1`,
  `migration`.`shipping_address_2`,
  `migration`.`shipping_city`,
  `migration`.`shipping_province`,
  `migration`.`shipping_zip`,
  `migration`.`shipping_country`,
  `migration`.`shipping_company`,
  `migration`.`billing_first_name`,
  `migration`.`billing_last_name`,
  `migration`.`billing_address_1`,
  `migration`.`billing_address_2`,
  `migration`.`billing_city`,
  `migration`.`billing_postalcode`,
  `migration`.`billing_province_state`,
  `migration`.`billing_country`,
  `migration`.`billing_phone`
FROM
  `stage_bistro_recharge_migration` `migration`
INNER JOIN 
  `stage_track__customer` `track`
  ON `migration`.`customer_id` = `track`.`customer_id`
WHERE 
  `track`.`status` = 'TO_ADD';

---

UPDATE
  `stage_track__customer`
SET 
  `status` = 'COMPLETED'
WHERE 
  `status` = 'TO_ADD';
