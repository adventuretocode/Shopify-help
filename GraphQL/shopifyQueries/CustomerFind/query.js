`query findCustomerByEmail($query: String!) {
  customers(query: $query, first: 10) {
    edges {
      cursor
      node{
        id
        firstName
        lastName
      }
    }
  }
}`
