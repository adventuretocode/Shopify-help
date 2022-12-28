CREATE DATABASE IF NOT EXISTS `blogs_and_articles`;
USE `blogs_and_articles`;

DROP TABLE IF EXISTS `blogs`;
CREATE TABLE `blogs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `original_blog_id` BIGINT,
  `title` VARCHAR(250) DEFAULT '',
  `tags` TEXT,
  `processed` tinyint(1) DEFAULT '0',
  UNIQUE(`title`),
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `blog_handle` VARCHAR(250) DEFAULT '',
  `blog_title` VARCHAR(250) DEFAULT '',
  `title`  VARCHAR(250) DEFAULT '',
  `author` VARCHAR(250) DEFAULT '',
  `tags` TEXT,
  `body_html` TEXT,
  `image` TEXT,
  UNIQUE(`title`),
  PRIMARY KEY (`id`)
);
