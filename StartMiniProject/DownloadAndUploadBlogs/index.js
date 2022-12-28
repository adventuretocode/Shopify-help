import dotenv from "dotenv";
import Shopify from "./Shopify/index.js";
import ORM from "./db/orm.js";

dotenv.config();

const TABLE_NAME = "";
const PRIMARY_KEY = "";
const PROCESSING_BOOLEAN = "processed";
const FLAG_MODE = true;
const DRY_RUN = true;

const hasFailed = async (data, message) => {
  try {
    const updateObj = {
      message,
      has_failed: true,
    };
    await ORM.updateOneObj(
      TABLE_NAME,
      updateObj,
      `${PRIMARY_KEY} = '${data[`${PRIMARY_KEY}`]}'`
    );
    return "ok";
  } catch (error) {
    throw new Error("Failed to record failed");
  }
};

const updateFlag = async (data, columnName, bool = true) => {
  try {
    await ORM.updateOne(
      TABLE_NAME,
      columnName,
      bool,
      `${PRIMARY_KEY} = '${data[`${PRIMARY_KEY}`]}'`
    );
    return "ok";
  } catch (error) {
    console.log(error);
    throw new Error("Could not update flag");
  }
};

const processRowData = async (data) => {
  try {
    console.log(data);

    if (FLAG_MODE) {
      await updateFlag(data, "flag_data_row", true);
    }

    if (!DRY_RUN) {
      // Do Action
      // Download and then upload to another store
    }

    if (data.failed) {
      await hasFailed(data, "Row data has failed");
      return data;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

const saveArticles = async (blog, article) => {
  try {
    const { blog_handle, blog_title } = blog;
    const { title, author, tags, body_html, image } = article;

    const articleObj = {
      blog_handle,
      blog_title,
      title,
      author,
      tags,
      body_html,
      image,
    };

    await ORM.insertOneObj(articleObj);
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

const downloadAndSaveBlogs = async () => {
  try {
    const { blogs } = await Shopify.Blogs.listAll();
    // Save Blog to database
    for (let i = 0; i < blogs.length; i++) {
      const blog = blogs[i];
      const { id, title, tags } = blog;
      const blogObj = {
        original_blog_id: id,
        title,
        tags,
      };
      await ORM.insertOneObj("blogs", blogObj);
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
