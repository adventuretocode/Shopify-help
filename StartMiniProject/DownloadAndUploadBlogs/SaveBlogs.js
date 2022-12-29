import dotenv from "dotenv";
import Shopify from "./Shopify/index.js";
import ORM from "./db/orm.js";

dotenv.config();

const TABLE_NAME = "blogs";

const downloadAndSaveBlogs = async () => {
  try {
    const { blogs } = await Shopify.Blogs.listAll();
    // Save Blog to database
    for (let i = 0; i < blogs.length; i++) {
      const blog = blogs[i];
      const { id, title, tags, handle } = blog;
      const blogObj = {
        original_blog_id: id,
        title,
        tags,
        handle,
      };
      await ORM.insertOneObj(TABLE_NAME, blogObj);
    }

    return "Blogs Completed";
  } catch (error) {
    console.log("Error: ", error);
    throw error;
  }
};

downloadAndSaveBlogs()
  .then((success) => {
    console.log("==========================================");
    console.log(success);
    console.log("==========================================");
    console.timeEnd();
    console.log("==========================================");
    process.exit();
  })
  .catch((err) => {
    console.log("==========================================");
    console.log(err);
    console.log("==========================================");
    console.timeEnd();
    console.log("==========================================");
    process.exit();
  });