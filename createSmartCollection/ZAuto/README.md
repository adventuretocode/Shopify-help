# ZAuto

Creating collections out of gallery products.

Creating smart collections to group artwork together.
Artworks are split into 10 or more separate products.
To group them together there must a smart collections grouping them


Getting all vendors
https://staging-teefury.myshopify.com/admin/products/vendors.json

## How to start

```js
/**
 * Creating smart collection with Z tag with title and handle
 * Naming convention artist_artwork
 * 
 * Must Run ZAutoJsonCreate.js first to to build the ZAuto tags
 * 
 * It will check from `ZAutoProductColCreated{process.env.ENV}.json` 
 * to see if the collection has already been created
 * 
 * This fill will create the smart tags on shopify based on
 * the file `ZAutoJsonWithID{process.env.ENV}.json`
 * 
 * On Success it will record down the return JSON 
 * in the folder `./artistProductCollection${process.env.ENV}/`
 * 
 * And Also log into `ZAutoProductColCreated{process.env.ENV}.json`
 * 
 */
```
