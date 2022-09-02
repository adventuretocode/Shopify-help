const query = `
  query findOrderByName($query: String!) {
    orders(first: 2, query: $query) {
      nodes {
        id
      }
    }
  }
`;

const variable = {
  "query": "name:#1004"
}
