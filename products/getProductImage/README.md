node -r dotenv/config GetProductImages.js dotenv_config_path=./.env.stage
node -r dotenv/config GetProductImages.js dotenv_config_path=./.env.prod

https://www.quackit.com/mongodb/tutorial/mongodb_export_data.cfm

mongoexport --db friends --collection friends --type=csv --fields firstName,lastName,gender,language,email --out ~/Documents/mongoDumpTest.csv

mongoexport --db teefury --collection product_images --type=csv --fields id,title,handle,is_missing_image,image0,image1 --query '{ image39: { $exists: true }}' --out ~/Documents/Code/GITHUB/myGIT/Shopify-help/getProductImage/mongoDumpTest.csv

mongoexport --db teefury --collection product_images --type=csv --fields id,title,handle,is_missing_image,image0,image1 --out ~/Documents/Code/GITHUB/myGIT/Shopify-help/getProductImage/product_image_stage.csv

mongoexport --db teefury --collection product_images --type=csv --fields title,handle,is_missing_image,image0,image1,image2,image3,image4,image5,image6,image7,image8,image9,image10,image11,image12,image13,image14,image15,image16,image17,image18,image19,image20,image21,image22,image23,image24,image25,image26,image27,image28,image29,image30,image31,image32,image33,image34,image35,image36,image37,image38,image39 --out ~/Documents/Code/GITHUB/myGIT/Shopify-help/getProductImage/product-images.csv