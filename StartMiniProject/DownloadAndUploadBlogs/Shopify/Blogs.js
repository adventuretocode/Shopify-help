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
}

const retrieveById = async (blogId) => {
  try {
    const options = buildOptions(`/blogs/${blogId}.json`, "GET");
    const result = await networkRequest(options);
    return result;
  } catch (error) {
    throw error;
  }
}

const Blogs = {
  // Rest
  listAll,
  retrieveById,
  // GraphQL

};

export default Blogs;
