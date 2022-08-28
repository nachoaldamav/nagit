import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";

export async function getCurrentBranch() {
  return await execa("git", ["rev-parse", "--abbrev-ref", "HEAD"])
    .then((res) => res.stdout.trim())
    .catch(() => {
      ora(chalk.red("You are not inside a git repository!")).fail();
      open("https://i.imgur.com/3xhYtW8.mp4");
      process.exit(1);
    });
}
