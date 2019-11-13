const queryProductsByTag = ` 
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


//https://staging-teefury.myshopify.com/collections/mens-basic-tees/celebrity
const queryOneCollectionWithProductsByTag = `
{
  
}
`;

const getImagesFromShopify = ` 
query ($numProducts: Int!, $cursor: String) {
  products(first: $numProducts, after: $cursor) {
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    edges {
      cursor
      node {
        title
        handle
        images(first: 50) {
          edges {
            node {
              originalSrc
            }
          }
        }
      }
    }
  }
}
`;

const getImagesFromShopifyVariables = 
{
  "numProducts" : 1,
  "cursor": "eyJsYXN0X2lkIjoyMTc4NDUzNDcxMzIxLCJsYXN0X3ZhbHVlIjoiMjE3ODQ1MzQ3MTMyMSJ9"
};


const searchByIDToGetImages = `
{
  product(id: "gid://shopify/Product/4348932915299") {
    id
    handle
    title
    images(first: 50) {
      edges {
        node {
          originalSrc
        }
      }
    }
  }
}
`;
