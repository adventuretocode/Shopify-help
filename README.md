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
