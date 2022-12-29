import {
  buildOptions,
  buildGraphqlOptions,
  networkRequest,
  networkRequestGraphQL,
} from "./base.js";

const listAll = async () => {
  try {
    const options = buildOptions(`/blogs.json`, "GET");
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const retrieveById = async (blogId) => {
  try {
    const options = buildOptions(`/blogs/${blogId}.json`, "GET");
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const create = async (blogBody) => {
  try {
    const options = buildOptions(`/blogs.json`, "POST", undefined, blogBody);
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const Blogs = {
  // Rest
  listAll,
  retrieveById,
  create,
  // GraphQL
};

export default Blogs;
