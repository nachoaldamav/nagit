#! /usr/bin/env node
import chalk from "chalk";
import process from "process";
import { commit } from "./commit.js";
import ora from "ora";
import { switchBranch } from "./switchBranch.js";
import release from "./release.js";

(async () => {
  const args = process.argv.slice(2);
  const [type] = args;

  if (!type) {
    console.log(chalk.red("No command specified"));
    // Show available commands
    console.log(chalk.green("Available commands:"));
    console.log(chalk.blue("  - commit"));
    console.log(chalk.blue("  - switch"));
    process.exit(1);
  }

  if (type === "commit") {
    ora(chalk.blue("Loading commit console...")).info();
    return await commit();
  } else if (type === "switch") {
    return await switchBranch();
  } else if (type === "release") {
    return await release();
  }

  console.log(`Unknown type ${type}`);
  process.exit(1);
})();
