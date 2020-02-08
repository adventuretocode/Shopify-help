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


