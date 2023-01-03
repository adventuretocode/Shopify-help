import dotenv from "dotenv";
import Shopify from "./Shopify/index.js";

dotenv.config();

const countAllBlogsAndArticles = async () => {
  try {
    let blogCount = 0,
      articleCount = 0,
      blogArticleCount = {},
      longestTitle = 0;

    const { blogs } = await Shopify.Blogs.listAll();
    blogCount = blogs.length;

    for (let i = 0; i < blogCount; i++) {
      const blog = blogs[i];
      const { id: blog_id, title } = blog;
      const result = await Shopify.Articles.count(blog_id);
      const { count } = result;
      blogArticleCount[title] = count;
      articleCount += count;
      if (title.length > longestTitle) {
        longestTitle = title.length;
      }
    }

    console.log(`======================================`);
    for (const blogTitle in blogArticleCount) {
      const articleCount = blogArticleCount[blogTitle];
      const spaces = longestTitle - blogTitle.length;
      console.log(`${blogTitle}:${" ".repeat(spaces)} - ${articleCount}`);
    }
    console.log(`======================================`);
    console.log(`Total`);
    console.log(`Blogs: ${blogCount}`);
    console.log(`Article: ${articleCount}`);
    console.table(blogArticleCount);

    return "Count Complete";
  } catch (error) {
    console.log("Error: ", error);
    throw error;
  }
};

countAllBlogsAndArticles()
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
