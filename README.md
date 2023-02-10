# Shopify-help
Shopify API in plain JS

### Requirement
`.http` files requires [rest-client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) plug in on VScode to execute.


```env
# .env
SHOPIFY_TOKEN=
SHOPIFY_DOMAIN=
SHOPIFY_VERSION=
```

```http
@api_version={{$dotenv SHOPIFY_VERSION}}
@domain={{$dotenv SHOPIFY_DOMAIN}}
@token={{$dotenv SHOPIFY_TOKEN}}

###
GET https://{{domain}}.myshopify.com/admin/api/{{api_version}}/shop.json
Content-Type: application/json
X-Shopify-Access-Token: {{token}}
```

Graphql example starter
```js
const SHOPIFY_DOMAIN = "";
const SHOPIFY_TOKEN = "";
const SHOPIFY_VERSION = "";

const exampleQuery = {
  url: `https://${SHOPIFY_DOMAIN}.myshopify.com/admin/api/${SHOPIFY_VERSION}/graphql.json`,
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': SHOPIFY_TOKEN,
  },
  method: 'POST',
  data: {
    query: query,
    variables: variables,
  },
}
```
