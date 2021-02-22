# pgknexlove

[![pgknexlove npm](https://badge.fury.io/js/pgknexlove.svg)](https://www.npmjs.com/package/pgknexlove)

Don't you love postgres + knex? Now love it even more with an easy way to create
temporary databases for unit tests, automatic singleton, an initial connection test,
and standard environment variables defaults (POSTGRES_HOST, etc.).

## Usage

```bash
# Installation
npm install pgknexlove
```

```javascript
const getDB = require("pgknexlove")()

module.exports = async (req, res) => {
  const db = await getDB()

  const myUsers = await db("users").select("first_name")

  res.send(
    "Here's a random user's name:" +
      myUsers[Math.floor(Math.random() * myUsers.length)].first_name
  )
}
```

## Usage in Unit Tests

```javascript
const getDB = require("pgknexlove")({
  // Your migration file will automatically be run on the test database (optional)
  migrationFile: require.resolve("./migrate.sql"),

  // A file that will seed the database, great for quick testing (optional)
  seedFile: require.resolve("./seed.sql"),
})

test("some test that uses the database", async (t) => {
  const db = await getDB({ testMode: true, migrate: true, seed: true })

  // a test database was created and migrate with a random name, do whatever you
  // want!
  await db("user").del()

  // ... test creating users with endpoints or whatever
})
```

## Usage with Babel Macros

Sometimes it's not convenient to `require.resolve` to your SQL files. Babel
macros to the rescue!

```javascript
// Make sure to install the proper plugins
// npm install babel-plugin-macros raw.macro

// Your .babelrc should have: { "plugins": ["macros"] }
const raw = require("raw.macro")

const getDB = require("pgknexlove")({
  migrationSQL: raw("./migrate.sql"),
  seedSQL: raw("./seed.sql"),
})
```

## Environment Variables

The following environment variables are used (basically standard postgres env variables)

| Var Name                         | Description                     |
| -------------------------------- | ------------------------------- |
| POSTGRES_HOST                    | Postgres Host                   |
| POSTGRES_PASS, POSTGRES_PASSWORD | Postgres Password               |
| POSTGRES_DATABASE, POSTGRES_DB   | Postgres Database               |
| POSTGRES_USER, POSTGRES_USERNAME | Postgres User                   |
| POSTGRES_PORT                    | Postgres Port                   |
| POSTGRES_URI, POSTGRES_URL       | Postgres URI `postgresql://...` |
| POSTGRES_SSL                     | If set, true                    |
| USE_TEST_DB                      | `testMode` will default to true |
