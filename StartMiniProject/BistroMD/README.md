Error: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MySQL client


ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '1Bryantra';
FLUSH PRIVILEGES;
quit


GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost';


```
Error:  [Error: ENOENT: no such file or directory, open '/Volumes/XTRM-Q/Code/Projects/ChelseaAndRachel/BistroMD/Migrations/Customer/ReCharge/splitcsv-6176e074-0acd-4ea0-8571-17b26e6473f5-results/customers_salesforce-9.csv'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: '/Volumes/XTRM-Q/Code/Projects/ChelseaAndRachel/BistroMD/Migrations/Customer/ReCharge/splitcsv-6176e074-0acd-4ea0-8571-17b26e6473f5-results/customers_salesforce-9.csv'
}
```