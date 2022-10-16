DROP TABLE IF EXISTS `_sunday_track_customer`;
CREATE TABLE `_sunday_track_customer` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `new_email` varchar(100) NOT NULL,
  `old_email` varchar(100),
  `type` ENUM("UPDATED", "CREATED", "NO CHANGE"),
  PRIMARY KEY (`id`)
);
