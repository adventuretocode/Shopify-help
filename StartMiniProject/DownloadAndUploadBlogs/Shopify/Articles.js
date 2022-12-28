import {
  buildOptions,
  buildGraphqlOptions,
  networkRequest,
  networkRequestGraphQL,
} from "./base.js";

const listAll = async (blogId, limit = 50) => {
  try {
    const options = buildOptions(`/blogs/${blogId}/articles.json`, "GET", {
      limit: limit,
    });
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const retrieveById = async (blogId, articleId) => {
  try {
    const options = buildOptions(
      `/blogs/${blogId}/articles/${articleId}.json`,
      "GET"
    );
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const Articles = {
  // Rest
  listAll,
  retrieveById,
  // GraphQL
};

export default Articles;
