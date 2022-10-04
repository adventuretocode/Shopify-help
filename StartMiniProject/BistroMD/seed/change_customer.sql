DROP TABLE IF EXISTS `_monday_track_customer`;
CREATE TABLE `_monday_track_customer` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `new_email` varchar(100) NOT NULL,
  `old_email` varchar(100) DEFAULT NULL,
  `type` ENUM("UPDATED", "CREATED"),
  PRIMARY KEY (`id`)
);
