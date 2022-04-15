const buildGraphqlQuery = require("../../helpers/buildGraphqlQuery");

// A list of tags. Can be an array or a comma-separated list.
// Example values: ["tag1", "tag2", "tag3"], "tag1, tag2, tag3".

const tagOrder = async (gid, tags) => {
  try {
    const query = `
				mutation tagOrder ($id: ID!, $tags: [String!]!) {
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
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = tagOrder;
