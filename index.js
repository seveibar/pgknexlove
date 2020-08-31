// @flow

const knex = require("knex")
const fs = require("fs")

let singletonDB = null

module.exports = ({
  migrationFile,
  seedFile,
  migrationSQL = "",
  seedSQL = "",
  defaults = {},
} = {}) => {
  if (migrationFile) {
    migrationSQL = fs.readFileSync(migrationFile).toString()
  }
  if (seedFile) {
    seedSQL = fs.readFileSync(seedFile).toString()
  }

  const getConnectionInfo = (database, user) =>
    process.env.POSTGRES_URI ||
    process.env.PG_URI || {
      host: process.env.POSTGRES_HOST || defaults.host || "localhost",
      user:
        user ||
        process.env.POSTGRES_USER ||
        process.env.POSTGRES_USERNAME ||
        defaults.user ||
        "postgres",
      port: process.env.POSTGRES_PORT || defaults.port || 5432,
      password:
        process.env.POSTGRES_PASS ||
        process.env.POSTGRES_PASSWORD ||
        defaults.password ||
        "",
      database,
      ssl: Boolean(process.env.POSTGRES_SSL),
      rejectUnauthorized: false,
    }

  const createDatabase = async (dbName) => {
    try {
      let conn = await knex({
        client: "pg",
        connection: getConnectionInfo("postgres"),
      })
      await conn.raw(`CREATE DATABASE ${dbName}`)
      await conn.destroy()
    } catch (e) {}
  }

  const deleteDatabase = async (dbName) => {
    try {
      let conn = await knex({
        client: "pg",
        connection: getConnectionInfo("postgres"),
      })
      await conn.raw(`DROP DATABASE ${dbName}`)
      await conn.destroy()
    } catch (e) {}
  }

  return async ({ seed, migrate, testMode, user } = {}) => {
    if (singletonDB) return singletonDB

    testMode =
      testMode === undefined ? Boolean(process.env.USE_TEST_DB) : testMode

    const dbName = !testMode
      ? process.env.POSTGRES_DATABASE ||
        process.env.POSTGRES_DB ||
        defaults.database ||
        defaults.databaseName ||
        "postgres"
      : `testdb_${Math.random().toString(36).slice(7)}`

    if (testMode)
      console.log(
        `\n---\nUsing Test DB: ${dbName}, User: ${user || "none"}\n---`
      )

    await createDatabase(dbName)

    let pg = knex({
      client: "pg",
      connection: getConnectionInfo(dbName),
    })

    // test connection
    try {
      await pg.raw("select 1+1 as result")
    } catch (e) {
      throw new Error("Could not connect to database\n\n" + e.toString())
    }

    // upload migration
    if (migrate) await pg.raw(migrationSQL)

    if (seed) await pg.raw(seedSQL)

    if (user) {
      await pg.destroy()
      pg = knex({ client: "pg", connection: getConnectionInfo(dbName) })
      await pg.raw(`SET ROLE ${user};`)
      // test connection
      try {
        await pg.raw("select 1+1 as result")
      } catch (e) {
        throw new Error(
          `Could not connect to database as "${user}"\n\n${e.toString()}`
        )
      }
    }

    // override pg.destroy so we can delete the test database in test mode
    pg.destroyHooks = []

    const proxiedPg = new Proxy(pg, {
      get: (obj, prop) => {
        if (prop === "destroy") {
          return async () => {
            singletonDB = null
            for (const hook of obj.destroyHooks) {
              await hook()
            }
            await obj.destroy()
            if (testMode) await deleteDatabase(dbName)
          }
        } else {
          return obj[prop]
        }
      },
    })

    singletonDB = proxiedPg

    return proxiedPg
  }
}
