New ES6 modules
Import will not work as expected
Subdirectories will not get proper environment variables
```js
// Will not work for subdirectories 
import * as dotenv from "dotenv";
dotenv.config({ path: "./.env.test") });
```

```js
// This will work for subdirectories
import "dotenv/config"
```

More about this here:
https://github.com/motdotla/dotenv/issues/89#issuecomment-974511109

