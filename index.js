import dotenv from "dotenv";
import knex from "knex";
import { program } from "commander";
import runCommand from "./commands/run.js";
import seedCommand from "./commands/seed.js";

dotenv.config();

const database = knex({
  client: "mysql2",
  connection: process.env.DB_URL,
});

const tableName = "Transactions";

program
  .command("run")
  .option("--user-id <value>", "user id for filtering the query", 2)
  .action(runCommand(database));

const seed = program
  .command("seed")
  .option("--total <value>", "number of rows to create", 1000000)
  .option("--chunk-size <value>", "processing amount", 10000)
  .action(seedCommand(database, tableName));

program.parse(process.argv);
