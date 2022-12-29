import {
  buildOptions,
  buildGraphqlOptions,
  networkRequest,
  networkRequestGraphQL,
} from "./base.js";

const count = async (blogId) => {
  try {
    const options = buildOptions(`/blogs/${blogId}/articles/count.json`, "GET");
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw error;
  }
};

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

const create = async (blogId, articleBody) => {
  try {
    const options = buildOptions(
      `/blogs/${blogId}/articles.json`,
      "POST",
      undefined,
      articleBody
    );
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const Articles = {
  // Rest
  count,
  listAll,
  retrieveById,
  create,
  // GraphQL
};

export default Articles;
