const straightSearchForZAutoByName = `
query searchForZAutoByName {
  products(first: 50, query: "title:News Flash AND product_type:Tee AND tag:style-basic AND tag:gender-mens") {
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

const searchForZAutoByName = `
query searchForZAutoByName($num: Int!, $query: String!) {
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

