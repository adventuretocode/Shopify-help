DROP TABLE IF EXISTS `_track__customer`;
CREATE TABLE `_track__customer` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `new_email` varchar(100) NOT NULL,
  `old_email` varchar(100),
  `type` ENUM("UPDATED", "CREATED", "NO CHANGE"),
  `status` ENUM("TO_ADD", "UPDATE", "COMPLETED", "NONE"),
  `what_changed` TEXT,
  `program_status` ENUM("On Program","New Customer","Returning Customer","Card Declined","Fraud","Verify Address","Hold with Resume Date", "Finished","On Hold", "Never Started", "Gift Certificate Verify"),
  PRIMARY KEY (`id`)
);

-- 

SELECT
  count(*)
FROM
  `dev_tuesday_track_customer`
WHERE
   `type` = 'UPDATED';

-- 

SELECT
  count(*)
FROM
  `dev_tuesday_track_customer`
WHERE
   `type` = 'CREATED';
-- 

SELECT
  count(*)
FROM
  `dev_tuesday_track_customer`
WHERE
   `type` = 'NO CHANGE';
