import dotenv from "dotenv";
import Shopify from "./Shopify/index.js";
import ORM from "./db/orm.js";

dotenv.config();

const TABLE_NAME = "articles";
const TABLE_NAME_2ND = "blogs";
const PRIMARY_KEY = "id";
const PROCESSING_BOOLEAN = "created";

const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const processRowData = async (data) => {
  try {
    const articleObj = {
      article: {
        title: data.title,
        tags: data.tags,
        author: data.author,
        body_html: data.body_html,
        summary_html: data.summary_html,
        // image: data.image
        // published_at: "2022-12-01T00:00:00"
      },
    };

    const [blog] = await ORM.findOne(
      TABLE_NAME_2ND,
      `handle = '${data.blog_handle}'`
    );
    const { blog_id } = blog;

    const result = await Shopify.Articles.create(blog_id, articleObj);
    const { article } = result;

    console.log(article);

    return data;
  } catch (error) {
    const tooManyRequest = error?.response?.data?.errors?.includes(
      "Exceeded 2 calls per second for api client. Reduce request rates to resume uninterrupted service."
    );
    if (tooManyRequest) {
      sleep(2000);
      return {};
    }
    throw error;
  }
};

const createArticles = async (identifier) => {
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
        if (!result[`${PRIMARY_KEY}`]) continue;
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

createArticles()
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
