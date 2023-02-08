# Shopify-help
Shopify API in plain JS

### Requirement
`.http` files requires [rest-client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) plug in on VScode to execute.

### Running dotenv from terminal
```bash
$ node -r dotenv/config your_script.js dotenv_config_path=./.env
$ ls -1 | wc -l
```

```bash
$ node -r dotenv/config index.js dotenv_config_path=./.env.prod
```

If shopify graphQL times out for no reason

```javascript
main()
  .then(data => console.log("Success: ", data))
  .catch(error => { 
    console.log("Errors: Main - ", error);

    // Timed out error code can still continue
    //code: 'ETIMEDOUT'
    if(error.code === "ETIMEDOUT") {
      setTimeout(() => {
        main();
      }, 1000);
    }
  });
```

### JS Doc hints

```javascript
/**
 * An array of objects with one
 * 
 * @param   {Array<{keyOne: String|Number, KeyTwo: Boolean}>} exampleParam
 * @returns {Promise}
 */

  const arrayOfObjectsOneLevel: (exampleParam: {
     id: string | number;
  }[], some: {
      keyOne: string | number;
      KeyTwo: boolean;
  }[]) => Promise<any>
```

```javascript
/**
 * @param  {String} firstParam
 * @return {Promise<Array<{node:{id:String, handle:String}>} Array of items in an object called node 
 */

  const returnPromiseObject: (firstParam: string) => Promise<{
      node: {
        id: string;
        handle: string;
      };
  }[]>
```

```javascript
/**
 * Option is an object.
 *
 * @param   {Object} option          The request object for shopify
 * @param   {String} option.url      The url of endpoint
 * @param   {String} option.headers  Header containing access token "X-Shopify-Access-Token"
 * @param   {String} option.method   HTTP request GET POST DELETE PUT
 * @param   {Number} timeOut         Time before the next execution can start
 * @returns {Promise<{}>}            Promise object represents the post body
 */
  const restApiService: (option: {
      url: string;
      headers: string;
      method: string;
  }, timeOut?: number) => Promise<{}>
```

```javascript

/**
 * @param  {Array<{node: {handle:String, publishedAt:String|Null, collections: {edges:Array<{id:String, handle:String}> }}}>} edges Array of shopify object
 * @return {Promise}
 */

const nestedObject: (edges: {
    node: {
        handle: string;
        publishedAt: string;
        collections: {
            edges: {
                id: string;
                handle: string;
            }[];
        };
    };
}[]) => Promise<any>

/**
 * A nested array of object
 * With a promised return with array of object
 * 
 * @param   {Array<{title:String, rules:[{column:String, relation:String, condition:String}]}>} list A list of 
 * @returns {Promise<Array<{node:{id:String, handle:String}>}
 */

const main: (list: {
    title: string;
    rules: [{
      column: string;
      relation: string;
      condition: string;
    }];
}[]) => Promise<{
    node: {
      id: string;
      handle: string;
    };
}[]>

```

```javascript
/**
 * @param  {{smart_collection:{title:String, rules:[{column:String, relation:String, condition:String}}} postBody zAuto tag from the product
 * @returns {Promise<{Object}>}
 */

const createSmartCollectionRest: (postBody: {
  smart_collection: {
    title: string;
    rules: [{
      column: string;
      relation: string;
      condition: string;
    }];
  };
}) => Promise<{
  Object: any;
}>

```

```javascript
/*
 * @param  {String} cursor Shopify's graphQLs cursor
 * @returns {Promise<{data: { products: { pageInfo: { hasNextPage:Boolean}, edges: [{cursor:String, node: { handle:String, publishedAt:String, collections: { edges: [{ node: { id:String, handle:String }}]}}}]}}, }>}
 */

const productsGetCollection: (cursor?: string) => Promise<{
  data: {
    products: {
      pageInfo: {
        hasNextPage: boolean;
      };
      edges: [{
        cursor: string;
        node: {
          handle: string;
          publishedAt: string;
          collections: {
            edges: [{
              node: {
                id: string;
                handle: string;
              };
            }];
          };
        };
      }];
    };
  };
}>

```

```javascript
/*
 * @param  {String} cursor Shopify's graphQLs cursor
 * @returns {Promise<{data: { products: }, extensions: { cost: { requestedQueryCost:Number, actualQueryCost:Number, throttleStatus: { maximumAvailable:Number, currentlyAvailable:Number, restoreRate:Number}}}}>}
 */

const productsGetCollection: (cursor?: string) => Promise<{
  data: {
    products: any;
  };
  extensions: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}>

```

```javascript
/**
 *
 * @param  {<Object>}       param
 * @param  {String}         paramString
 * @param  {Number}         paramNumber
 * @param  {Array<String>}  arrayOfString
 * @param  {Array<Object>}  arrayOfObjects
 * @return {Promise<{Object}>}
 */
// Could not reproduce in JSDocs 
const documentingDestructedObject: ({ string, number, arrayOfString, arrayOfObjects }: {
    paramString: string;
    paramNumber: number;
    arrayOfString: [];
    arrayOfObjects: {};
}) => void
```
