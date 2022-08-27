import chalk from "chalk";
import { execa } from "execa";
import inquirer from "inquirer";
import ora from "ora";
import { getCurrentBranch } from "../functions/currentBranch.js";

export async function switchBranch() {
  const currentBranch = await getCurrentBranch();

  const allBranches = await execa("git", ["branch"]).then((res) =>
    res.stdout.split("\n").map((branch) => branch.trim().replace(/^\*\s*/, ""))
  );

  const branches = allBranches.filter((branch) => branch !== currentBranch);

  const { branch } = await inquirer.prompt({
    type: "list",
    name: "branch",
    message: "Select a branch to switch to",
    choices: branches,
    loop: false,
  });

  await execa("git", ["checkout", branch])
    .catch((e) => {
      // if error has "Your local changes" then it's a conflict
      if (e.stderr.includes("Your local changes")) {
        console.log(
          chalk.red(
            "Some files are not committed, use nagit commit to commit them"
          )
        );
        process.exit(1);
      } else {
        ora(
          chalk.red(`Error switching branch, ${JSON.stringify(e.stderr)}`)
        ).fail();
        process.exit(1);
      }
    })
    .then(() => {
      ora(chalk.green("Switched branch to " + branch)).succeed();
    });

  return;
}
