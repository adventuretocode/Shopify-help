const buildGraphqlQuery = require("../../helpers/buildGraphqlQuery");

// A list of tags. Can be an array or a comma-separated list. 
// Example values: ["tag1", "tag2", "tag3"], "tag1, tag2, tag3".

const tagCustomer = function (gid, tags) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = `
				mutation tagCustomer ($id: ID!, $tags: [String!]!) {
					tagsAdd(id: $id, tags: $tags) {
						userErrors{
							field
							message
						}
						node {
							id
						}
					}
				}
      `;

      const input = {
        id: gid,
        tags: tags,
      };

      const result = await buildGraphqlQuery(query, input);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = tagCustomer;
