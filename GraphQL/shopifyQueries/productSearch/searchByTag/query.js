const straightProductSearchByTag = ` 
{
  products(first: 50, query:"tag:celebrity") {
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

const productSearchByTag = `
query productSearchByTag($num: Int!, $query: String!) {
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
