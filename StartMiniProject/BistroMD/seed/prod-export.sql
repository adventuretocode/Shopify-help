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
  `prod_bistro_recharge_migration` `migration`
INNER JOIN 
  `prod_track__customer` `track`
  ON `migration`.`customer_id` = `track`.`customer_id`
WHERE 
  `track`.`status` = 'TO_ADD';
  
----------------------------------

SELECT
	COUNT(*)
FROM
  `prod_track__customer`
WHERE 
  `status` = 'TO_ADD';

----------------------------------

SELECT
	COUNT(*)
FROM
  `prod_bistro_recharge_migration` `migration`
INNER JOIN 
  `prod_track__customer` `track`
  ON `migration`.`customer_id` = `track`.`customer_id`
WHERE 
  `track`.`status` = 'TO_ADD';

-----------------------
  
SELECT
  COUNT(*)
FROM
  `prod_track__customer`
WHERE 
  `status` = 'UPDATE';

-----------------------
UPDATE
  `prod_track__customer`
SET 
  `status` = 'COMPLETED'
WHERE 
  `status` = 'TO_ADD';


--------------------------------


SELECT 
  `Customer Id`,
  `Email` 
FROM 
  `z-bistro-full` 
WHERE 
  `Customer Id`
in 
  (
    SELECT
      `Customer Id`
    FROM 
      `z-bistro-full`
    GROUP BY
      `Customer Id`
    HAVING COUNT(*) > 2
  )
AND 
  `Program Status` != 'Finished'
AND 
  `Program Status` != 'Never Started'
AND 
  `Customer Id` != '';


SELECT 
  * 
FROM 
  `z-bistro-full`
WHERE `Shipping Day` = 'Unassigned'
AND `Program Status` != 'Never Started'
AND `Program Status` != 'Finished';



SELECT 
  CONCAT_WS(' ', `z-bistro-full`.`First Name`, `z-bistro-full`.`Last Name`) AS NAME
FROM 
  `z-bistro-full`
WHERE `Customer Id` = ''
AND `Program Status` != 'Never Started'
AND `Program Status` != 'On Hold'
AND `Program Status` != 'Finished'
AND `CIM Profile ID` != ''
AND NOT EXISTS (SELECT * FROM `prod_bistro_recharge_migration` WHERE `shipping_email` = `z-bistro-full`.`Email`);


SELECT
  `Hold_customer_no_id`.`Account Name`,
  CONCAT_WS(' ', `z-bistro-full`.`First Name`, `z-bistro-full`.`Last Name`) AS NAME,
  `z-bistro-full`.`Email`,
  `Hold_customer_no_id`.`End Hold Date`,
  `Hold_customer_no_id`.`Start Hold Date`
FROM 
  `z-bistro-full`
RIGHT JOIN
  `Hold_customer_no_id`
ON 
  CONCAT_WS(' ', `z-bistro-full`.`First Name`, `z-bistro-full`.`Last Name`) = `Hold_customer_no_id`.`Account Name`
WHERE `z-bistro-full`.`Customer Id` = ''
AND `z-bistro-full`.`Program Status` != 'Never Started'
AND `z-bistro-full`.`Program Status` != 'On Hold'
AND `z-bistro-full`.`Program Status` != 'Finished'
AND `z-bistro-full`.`CIM Profile ID` != ''
AND NOT EXISTS (SELECT * FROM `prod_bistro_recharge_migration` WHERE `shipping_email` = `z-bistro-full`.`Email`);



-- 

SELECT
  `Email`
FROM 
  `z-bistro-full`
WHERE 
  (`Program Status` = 'On Program' OR
  `Program Status` = "New Customer" OR
  `Program Status` = "Returning Customer" OR
  `Program Status` = "Hold with Resume Date")
AND 
  `Shipping Day` != 'Unassigned'
AND 
  EXISTS (SELECT `emails` FROM `b-monday-ship` WHERE `emails` = `z-bistro-full`.`Email`)
  


/* SELECT
 shipping_email
FROM
 `prod_bistro_recharge_migration`
WHERE
 `prod_bistro_recharge_migration`.`shipping_day` = 'Wednesday' AND
 `prod_bistro_recharge_migration`.`status` = 'active' AND
 `prod_bistro_recharge_migration`.`customer_id` NOT IN 
  (SELECT `leg_customer_id` FROM `prod_hold_skips-remoedup` WHERE `start_hold_date` = '12/5/2022'); */;
  

SELECT
 shipping_email
FROM
 `prod_bistro_recharge_migration`
WHERE
 `prod_bistro_recharge_migration`.`shipping_day` = 'Thursday' AND
 `prod_bistro_recharge_migration`.`status` = 'active' AND
 `prod_bistro_recharge_migration`.`customer_id` NOT IN 
  (SELECT `leg_customer_id` FROM `prod_hold_skips-remoedup` WHERE `start_hold_date` = '12/5/2022');
  



UPDATE
  `prod_bistro_recharge_migration`
SET
 `has_update_next_charge` = 1
WHERE
 `prod_bistro_recharge_migration`.`shipping_day` = 'Thursday' AND
 `prod_bistro_recharge_migration`.`status` = 'active' AND
 `prod_bistro_recharge_migration`.`customer_id` IN 
  (SELECT `leg_customer_id` FROM `prod_hold_skips-remoedup` WHERE `start_hold_date` = '12/5/2022');
  

SELECT
 COUNT(*)
FROM 
  `b-wednesday-ship-full`
WHERE 
  `has_update_next_charge` = false


ALTER TABLE `b-thursday-ship-full`
   ADD `is_just_add` boolean default false,
   ADD `has_plan_changed` boolean default false,
   ADD `has_status_changed` boolean default false,
   ADD `has_charge_date_changed` boolean default false,
   ADD `has_cancelled` boolean default false;


----------------------------------------------------------------------------------------------


SELECT
 *
FROM
 `prod_bistro_recharge_migration`
WHERE
 `prod_bistro_recharge_migration`.`shipping_day` = 'Thursday' AND
 `prod_bistro_recharge_migration`.`status` = 'active' AND
 `prod_bistro_recharge_migration`.`customer_id` NOT IN 
  (SELECT `leg_customer_id` FROM `prod_hold_skips-remoedup` WHERE `start_hold_date` = '12/5/2022');
  

UPDATE
  `prod_bistro_recharge_migration`
SET
 `has_update_next_charge` = 0
WHERE
 `prod_bistro_recharge_migration`.`shipping_day` = 'Monday' AND
 `prod_bistro_recharge_migration`.`status` = 'active' AND
 `prod_bistro_recharge_migration`.`customer_id` IN 
  (SELECT `leg_customer_id` FROM `prod_hold_skips-remoedup` WHERE `start_hold_date` = '12/5/2022');
  


ALTER TABLE `b-thursday-ship-full`
   ADD `is_just_add` boolean default false,
   ADD `has_plan_changed` boolean default false,
   ADD `has_status_changed` boolean default false,
   ADD `has_charge_date_changed` boolean default false,
   ADD `has_cancelled` boolean default false,
   ADD `has_skips` boolean default false,
   ADD `subscription_has_not_changed` boolean default false;

   
UPDATE
  `b-thursday-ship-full`
SET
  `reprocessed` = 0;


SELECT
  COUNT(*)
FROM
  `b-thursday-ship-full`
WHERE
  `reprocessed` = 0

SELECT
  `email`
FROM 
 `charging_customers_original`
GROUP BY
  `email`
HAVING 
 COUNT(*) > 1;
 
 
 ALTER TABLE `charging_customers_many`
  ADD `checked` tinyint(1) DEFAULT '0',
  ADD `transaction_id` varchar(255) DEFAULT NULL,
  ADD `payment_processor_name` varchar(255),
  ADD `has_already_processed` tinyint(1) DEFAULT '0',
  ADD `needs_capture` tinyint(1) DEFAULT '0',
  ADD `message` varchar(255) DEFAULT NULL,
  ADD `has_failed` tinyint(1) DEFAULT '0';
  
  
SELECT
  `email`,
  `transaction_id`
FROM 
 `charging_customers_one`
WHERE 
 `has_failed` = true;