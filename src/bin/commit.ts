#! /usr/bin/env node
import inquirer from "inquirer";
import gitChangedFiles from "git-changed-files";
import { getRepoIssues } from "../functions/getIssues.js";
import { callback } from "../functions/promptCallback.js";
import gitUntracked from "git-untracked";
import path from "path";
import { listGHIssues } from "../functions/listGHIssues.js";
import { cliAuth } from "../functions/cliAuth.js";
import { execa } from "execa";
import chalk from "chalk";
import { isMono } from "../functions/monorepo.js";
import ora from "ora";
const cwd = process.cwd();

export async function commit() {
  const mono = isMono();
  const currentBranch = await execa("git", [
    "rev-parse",
    "--abbrev-ref",
    "HEAD",
  ])
    .then((res) => res.stdout.trim())
    .catch(() => {
      ora(chalk.red("You are not inside a git repository!")).fail();
      process.exit(1);
    });

  let committedGitFiles = await gitChangedFiles({
    baseBranch: currentBranch,
  }).catch((e: any) => {
    console.error(e);
    return [];
  });

  const isLogged = await cliAuth();

  if (!isLogged) {
    console.log(
      chalk.red(
        "Not logged in GH Cli, GH Features unavailable. You can still commit and push."
      )
    );
  } else {
    console.log(chalk.green("Logged in GH Cli, GH Features available!"));
  }

  const cliIssues = (isLogged && (await listGHIssues())) || [];

  const issues = await getRepoIssues();

  // Fix this function in typescript
  // @ts-ignore-next-line
  const untrackedPromise = // @ts-ignore-next-line
    (
      await new Promise((resolve, reject) => {
        // @ts-ignore-next-line
        gitUntracked(".", (err, files) => {
          if (err) {
            reject(err);
          } else {
            // @ts-ignore-next-line
            resolve(files.map((file) => path.relative(cwd, file)) || []);
          }
        });
      })
    )
      // @ts-ignore-next-line
      .filter((file) => file);

  const uncommited =
    committedGitFiles?.unCommittedFiles?.length > 0
      ? [...committedGitFiles.unCommittedFiles]
      : [];

  //@ts-ignore-next-line
  const untracked = untrackedPromise.length > 0 ? [...untrackedPromise] : [];

  return inquirer
    .prompt([
      {
        type: "checkbox",
        name: "files",
        message: "Select files to commit",
        choices: [...uncommited, ...untracked],
        loop: false,
      },
      {
        type: "list",
        name: "commitType",
        message: "What do you want to do?",
        choices: [
          "feat",
          "fix",
          "docs",
          "style",
          "types",
          "refactor",
          "test",
          "perf",
          "chore",
        ],
        loop: false,
      },
      {
        type: "text",
        name: "scope",
        message: "What is the scope of this change? (optional)",
        default: "",
      },
      {
        type: "text",
        name: "title",
        message: "What is the title of this change?",
      },
      {
        type: "text",
        name: "message",
        message: "Commit message:",
      },
      {
        type: "checkbox",
        name: "issues",
        message: "Select issues to close",
        choices:
          cliIssues ||
          issues.map((issue: { title: string; number: number }) => ({
            name: issue.title,
            value: "#" + issue.number,
          })),
        when: () => issues.length > 0,
        loop: false,
        pageSize: 10,
      },
      {
        type: "text",
        name: "handIssues",
        message: "Enter issues to close (separated by comma, optional)",
        when: () => issues.length === 0,
      },
      {
        type: "text",
        name: "breakingChange",
        message: "Describe the breaking change (optional)",
        default: "",
      },
      {
        type: "confirm",
        name: "push",
        message: "Push to remote?",
        default: false,
      },
      {
        type: "confirm",
        name: "release",
        message: "Create a release?",
        default: false,
        when: () => isLogged,
      },
      {
        type: "list",
        name: "releaseType",
        message: "What type of release?",
        choices: ["major", "minor", "patch"],
        when: (answers) => answers.release,
      },
      {
        type: "checkbox",
        name: "monorepo",
        message:
          "Select package(s) to update (Base package will always be updated)",
        choices: mono.files,
        when: (answers) => answers.release && mono.isMono,
        loop: false,
      },
    ])
    .then(async (answers) => await callback(answers))
    .catch((err) => {
      console.log(err);
    });
}
