DROP DATABASE IF EXISTS `bistromd`;
CREATE DATABASE `bistromd`;

DROP TABLE IF EXISTS `bistromd`.`customers_salesforce`;
CREATE TABLE `bistromd`.`customers_salesforce` (
	id int(11) AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `Created_Date` text,
  `First_Name` text,
  `Last_Name` text,
  `Gender` text,
  `Email` text,
  `Program_Status` text,
  `Shipping_Address_Line_1` text,
  `Program_Week_Updated` text,
  `Shipping_Address_Line_2` text,
  `Shipping_City` text,
  `Shipping_StateProvince` text,
  `Shipping_ZipPostal_Code` text,
  `Shipping_Country` text,
  `Phone` text,
  `Billing_Address_Line_1` text,
  `Billing_Address_Line_2` text,
  `Billing_City` text,
  `Billing_ZipPostal_Code` text,
  `Billing_StateProvince` text,
  `Billing_Country` text,
  `Account_Phone` text,
  `Customer_ID` text,
  `Program_Type` text,
  `Program_Snack_Type` text,
  `Shipping_Day` text,
  `CIM_Profile_ID` text,
  `Account_Created_Date` text
);


-- https://stackoverflow.com/questions/59993844/error-loading-local-data-is-disabled-this-must-be-enabled-on-both-the-client
-- set global local_infile=true;
-- exit;
-- LOAD DATA LOCAL INFILE "/Shopify-help/StartMiniProject/BistroMD/data/customers_salesforce.csv" INTO table bistromd.customers_salesforce;

-- Was only able to load 500
LOAD DATA LOCAL INFILE '/Shopify-help/StartMiniProject/BistroMD/data/customers_salesforce.csv'  
INTO TABLE bistromd.customers_salesforce 
FIELDS TERMINATED BY ','  ENCLOSED BY '"' 
LINES TERMINATED BY '\n' IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE '/Migrations/splitcsv-6176e074-0acd-4ea0-8571-17b26e6473f5-results/customers_salesforce-1.csv'   INTO TABLE bistromd.customers_salesforce  FIELDS TERMINATED BY ','  ENCLOSED BY '"'  LINES TERMINATED BY '\n' IGNORE 1 ROWS;

SELECT 
  COUNT(*)
FROM
  bistromd.customers_salesforce;