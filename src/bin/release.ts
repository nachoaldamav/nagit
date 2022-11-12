import chalk from "chalk";
import inquirer from "inquirer";
import { cliAuth } from "../functions/cliAuth.js";
import { createRelease } from "../functions/createRelease.js";
import { isMono } from "../functions/monorepo.js";

export default async function release() {
  const mono = isMono();
  const isLogged = await cliAuth();

  if (!isLogged) {
    console.log(
      chalk.red(
        "You need to be logged in to use this feature. You can still commit and push."
      )
    );
    return;
  }

  return inquirer
    .prompt([
      {
        type: "list",
        name: "releaseType",
        message: "Select a release type",
        choices: ["major", "minor", "patch"],
        loop: false,
      },
      {
        type: "checkbox",
        name: "monorepo",
        message:
          "Select package(s) to update (Base package will always be updated)",
        choices: mono.files,
        when: () => mono.isMono,
        loop: false,
      },
      {
        type: "confirm",
        name: "changelog",
        message: "Generate changelog?",
        default: true,
      },
      {
        type: "confirm",
        name: "discussion",
        message: "Create a discussion?",
        default: false,
      },
    ])
    .then(async (answers) => {
      const { releaseType, monorepo, discussion, changelog } = answers;
      await createRelease(releaseType, monorepo, discussion, changelog);
    });
}
