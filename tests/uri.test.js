const test = require("ava")
const pgknexlove = require("../")

test("be able to connect with a URI connection string", async (t) => {
  process.env.PG_URI = "postgres://postgres@localhost:5432/postgres"

  const getDB = pgknexlove({
    migrationFile: require.resolve("./migrate.sql"),
  })

  const db = await getDB({ migrate: true, testMode: true })

  const [id] = await db("person").insert({ name: "jerry" }).returning("id")

  t.assert(id === 1)

  const jerry = await db("person").first()

  t.assert(jerry.name === "jerry")

  await db.destroy()
})
