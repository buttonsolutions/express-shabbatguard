To install
----

npm install [express-shabbatguard](https://www.npmjs.com/package/express-shabbatguard)

Usage example
---
```
const express = require('express')
const app = express()
const port = 3000
const {shabbatGuard} = require('../index');

app.use(shabbatGuard());
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
```

Specifying cities
---
```
const {shabbatGuard, supportedLocations} = require('../index');

app.use(shabbatGuard([supportedLocations.Hawaii, supportedLocations.Moscow]));
```
