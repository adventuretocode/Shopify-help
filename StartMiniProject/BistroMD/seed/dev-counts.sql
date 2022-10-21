
SELECT
  COUNT(*)
FROM
  `dev_sunday_track_customer`
WHERE 
 `type` = 'CREATED';

--

SELECT
  COUNT(*)
FROM
  `dev_sunday_track_customer`
RIGHT JOIN
  `dev_bistro_recharge_migration`
  ON `dev_bistro_recharge_migration`.`shipping_email` = `dev_sunday_track_customer`.`new_email`
 AND `dev_sunday_track_customer`.`type` = 'CREATED'

--

SELECT
  COUNT(*)
FROM
  `dev_sunday_track_customer`
RIGHT JOIN
  `dev_monday_track_customer`
  ON `dev_monday_track_customer`.`customer_id` = `dev_sunday_track_customer`.`customer_id`
 AND `dev_sunday_track_customer`.`type` = 'CREATED'
 AND `dev_sunday_track_customer`.`program_status` = 'Finished';
