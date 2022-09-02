const advanceSearchByUpdated = `
{
  products(query: "updated_at:>2019-11-20 AND product_type:Tee AND tag:style-basic AND tag:gender-mens", first: 50) {
    edges {
      node {
        id
        title
        createdAt
        updatedAt
        tags
      }
    }
  }
}
`;

const searchByUpdateWithVariables = `
query searchByUpdateWithVariables($num: Int!, $query: String!) {
  products(first: $num, query: $query) {
    edges {
      node {
        id
        handle
        title
      }
    }
  }
}
`;
