import dotenv from "dotenv";
import Shopify from "./Shopify/index.js";
import ORM from "./db/orm.js";

dotenv.config();

const TABLE_NAME = "blogs";
const PRIMARY_KEY = "original_blog_id";
const PROCESSING_BOOLEAN = "created";

const processRowData = async (data) => {
  try {
    const blogObj = {
      blog: {
        title: data.title,
        tags: data.tags
      }
    }

    const result = await Shopify.Blogs.create(blogObj);
    console.log(result);
    const { blog } = result;
    const { id: blog_id } = blog;

    await ORM.updateOne(
      TABLE_NAME,
      `blog_id`,
      blog_id,
      `${PRIMARY_KEY} = '${data[`${PRIMARY_KEY}`]}'`
    );
    
    return data;
  } catch (error) {
    throw error;
  }
}

const createBlogs = async (identifier) => {
  console.time();
  const continuous = !identifier;
  do {
    try {
      let query = identifier
        ? `${PRIMARY_KEY} = '${identifier}'`
        : `${PROCESSING_BOOLEAN} = false LIMIT 1`;
      const [record_1] = await ORM.findOne(TABLE_NAME, query);

      if (!record_1) return "Completed";

      const resultArr = [];
      if (record_1) {
        resultArr.push(processRowData(record_1));
      }

      const results = await Promise.all(resultArr);
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        await ORM.updateOne(
          TABLE_NAME,
          PROCESSING_BOOLEAN,
          true,
          `${PRIMARY_KEY} = '${result[`${PRIMARY_KEY}`]}'`
        );
        console.log(`${result[`${PRIMARY_KEY}`]}: Completed`);
      }
    } catch (error) {
      console.log("Error: ", error);
      throw error;
    }
  } while (continuous);
};

createBlogs()
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
