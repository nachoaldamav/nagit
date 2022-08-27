#! /usr/bin/env node
import chalk from "chalk";
import process from "process";
import { commit } from "./commit.js";
import ora from "ora";

(async () => {
  const args = process.argv.slice(2);
  const [type] = args;

  if (!type) {
    console.log(chalk.red("Please provide a type of update"));
    process.exit(1);
  }

  if (type === "commit") {
    const spinner = ora(chalk.blue("Loading commit console...")).info();
    await commit();
  } else {
    console.log(`Unknown type ${type}`);
    process.exit(1);
  }
})();
