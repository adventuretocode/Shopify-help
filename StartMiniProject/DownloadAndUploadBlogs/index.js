import dotenv from "dotenv";
import Shopify from "./Shopify/index.js";
import ORM from "./db/orm.js";

dotenv.config();

const TABLE_NAME = "blogs";
const TABLE_NAME_2ND = "articles";
const PRIMARY_KEY = "original_blog_id";
const PROCESSING_BOOLEAN = "processed";

const saveArticles = async (data) => {
  try {
    const { original_blog_id, title: blog_title, handle: blog_handle } = data;

    const { articles } = await Shopify.Articles.listAll(original_blog_id, 250);
    if (!articles.length) return data;

    for (let j = 0; j < articles.length; j++) {
      const article = articles[j];
      const { title, author, tags, body_html, image, summary_html, handle } = article;
      if (image) {
        delete image.created_at;
        delete image.width;
        delete image.height;
      }
      const articleObj = {
        blog_handle,
        blog_title,
        title,
        author,
        tags,
        body_html,
        summary_html,
        image,
        handle,
      };

      try {
        await ORM.insertOneObj(TABLE_NAME_2ND, articleObj);
      } catch (error) {
        debugger;
        continue;
      }

    }

    return data;
  } catch (error) {
    throw error;
  }
};

const saveBlogsAndArticles = async (identifier) => {
  console.time();
  const continuous = !identifier;
  do {
    try {
      const { blogs } = await Shopify.Blogs.listAll();
      // Save Blog to database
      for (let i = 0; i < blogs.length; i++) {
        const blog = blogs[i];
        const { id: blog_id } = blog;
        const { articles } = await Shopify.Articles.listAll(blog_id, 250);
        if (!articles.length) continue;

        for (let j = 0; j < articles.length; j++) {
          const article = articles[j];
          await saveArticles(blog, article);
        }
      }
    } catch (error) {
      console.log("Error: ", error);
      throw error;
    }
  } while (continuous);
};

const downloadAndSaveArticles = async (identifier) => {
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
        resultArr.push(saveArticles(record_1));
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

downloadAndSaveArticles()
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
