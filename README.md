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

`testMode: true` creates a temporary database. This allows you to run database
tests in parallel.

```javascript
const pgknexlove = require("pgknexlove")

test("some test that uses the database", async (t) => {
  const db = await pgknexlove.default({ testMode: true })

  // a test database was created and migrate with a random name, do whatever you
  // want!
  await db("user").del()

  // ... test creating users with endpoints or whatever
})
```

## getConnectionInfo & getConnectionString

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
