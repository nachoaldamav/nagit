import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";
import open from "open";

export async function getCurrentBranch() {
  return await execa("git", ["rev-parse", "--abbrev-ref", "HEAD"])
    .then((res) => res.stdout.trim())
    .catch(async () => {
      ora(chalk.red("You are not inside a git repository!")).fail();
      await open("https://i.imgur.com/3xhYtW8.mp4", { wait: true });
      process.exit(1);
    });
}
