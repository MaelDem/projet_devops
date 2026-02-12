import sql from "./connection.ts";

export async function migrate() {
  console.log("Migrating database...");
  const initSql = await Bun.file(new URL("init.sql", import.meta.url)).text();
  await sql.unsafe(initSql);
  console.log("Database migration complete");
}
