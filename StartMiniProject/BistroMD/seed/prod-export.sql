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
  `authorizedotnet_customer_profile_id`,
	`authorizedotnet_customer_payment_profile_id`,
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
  `prod_bistro_recharge_migration`
WHERE 
  `status` != 'DONT_PROCESS';
