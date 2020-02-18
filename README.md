# Shopify-help
Shopify API in plain JS

```bash
$ node -r dotenv/config your_script.js dotenv_config_path=./.env
$ ls -1 | wc -l
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
