import { buildGraphqlOptions, networkRequestGraphQL } from "./base.js";

const listFiles = async (after) => {
  try {
    const query = `
      query listFiles($after: String) {
        files (first: 50, after: $after) {
          pageInfo {
            endCursor
            startCursor
            hasNextPage
            hasPreviousPage
          }
          edges {
            cursor
            node {
              ... on MediaImage {
                id
              }
              alt
              preview {
                image {
                  url
                  id
                }
                status
              }
              fileErrors {
                code
                details
                message
              }
            }
          }
        }
      }
    `;

    let input;
    if (after) {
      input = {
        after,
      };
    }

    const options = buildGraphqlOptions(query, input);
    const result = await networkRequestGraphQL(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const findByFileName = async (fileNameQuery) => {
  try {
    const query = `
      query listFiles($query: String!) {
        files (first: 50, query: $query) {
          pageInfo {
            endCursor
            startCursor
          }
          edges {
            cursor
            node {
              ... on MediaImage {
                id
              }
              alt
              preview {
                image {
                  url
                  id
                }
                status
              }
              fileErrors {
                code
                details
                message
              }
            }
          }
        }
      }
    `;

    const input = {
      query: `filename:${fileNameQuery}`,
    };

    const options = buildGraphqlOptions(query, input);
    const result = await networkRequestGraphQL(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const create = async ({ alt, url}) => {
  try {
    const query = `
      mutation fileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files {
            ... on MediaImage {
              id
            }
            alt
            createdAt
            fileStatus
            preview {
              image {
                url
                id
              }
              status
            }
            __typename
            fileErrors {
              code
              details
              message
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const input = {
      files: [
        {
          alt: alt,
          contentType: "IMAGE",
          originalSource: url,
        },
      ],
    };

    const options = buildGraphqlOptions(query, input);
    const result = await networkRequestGraphQL(options);
    return result;
  } catch (error) {
    throw error;
  }
};

const Files = {
  // GraphQL
  listFiles,
  findByFileName,
  create,
};

export default Files;
