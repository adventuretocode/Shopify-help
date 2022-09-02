const basicCreatedAt = `
{
  products(query: "created_at:>2019-11-20", first: 50) {
    edges {
      node {
        title
        description
        createdAt
      }
    }
  }
}
`;

const advanceCreatedAt = `
{
  products(query: "created_at:>2019-11-20 AND product_type:Tee AND tag:style-basic AND tag:gender-mens", first: 50) {
    edges {
      node {
        id
        title
        createdAt
        tags
      }
    }
  }
}
`;

const variable = `
query searchProductsByCreatedAt($num: Int!, $query: String!)  {
  products(query: $query, first: $num) {
    edges {
      node {
        id
        title
        createdAt
      }
    }
  }
}
`;

