node -r dotenv/config GetProductImages.js dotenv_config_path=./.env.stage
node -r dotenv/config GetProductImages.js dotenv_config_path=./.env.prod

mongoexport --db friends --collection friends --type=csv --fields firstName,lastName,gender,language,email --out ~/Documents/mongoDumpTest.csv

mongoexport --db teefury --collection product_images --type=csv --fields shopify_id,title,handle,isImageMissing,image0,image1 --out ~/Documents/Code/GITHUB/myGIT/Shopify-help/getProductImage/product_image_stage.csv