import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";
import open from "open";

export async function getCurrentBranch() {
  return await execa("git", ["rev-parse", "--abbrev-ref", "HEAD"])
    .then((res) => res.stdout.trim())
    .catch(async () => {
      ora(chalk.red("You are not inside a git repository!")).fail();
      process.exit(1);
    });
}
