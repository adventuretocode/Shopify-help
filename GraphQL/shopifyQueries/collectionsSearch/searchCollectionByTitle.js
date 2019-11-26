const straightSearchCollectionByTitle = `
  query {
    collections(first: 50, query: "title:nicebleed_midnight-sk") {
      edges {
        node {
          id
          handle
        }
      }
    }
  }
`;

const searchCollectionByTitle = `
  query searchCollectionByTitle($num: Int!, $query: String!) {
    collections(first: $num, query: $query) {
      edges {
        node {
          id
          handle
        }
      }
    }
  }
`;
