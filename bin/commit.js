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
const cwd = process.cwd();

(async () => {
  const currentBranch = await execa("git rev-parse --abbrev-ref HEAD").then(
    (res) => res.stdout.trim()
  );

  let committedGitFiles = await gitChangedFiles({
    baseBranch: currentBranch,
  }).catch((e) => {
    console.error(e);
    return [];
  });

  const isLogged = await cliAuth();

  console.log(
    `${
      isLogged
        ? "Logged in GH Cli, GH Features available"
        : "Not logged in GH Cli, GH Features unavailable"
    }`
  );

  const cliIssues = (isLogged && (await listGHIssues())) || [];

  const issues = await getRepoIssues();

  const untrackedPromise = (
    await new Promise((resolve, reject) => {
      gitUntracked(".", (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files.map((file) => path.relative(cwd, file)) || []);
        }
      });
    })
  ).filter((file) => file);

  const uncommited =
    committedGitFiles?.unCommittedFiles?.length > 0
      ? [...committedGitFiles.unCommittedFiles]
      : [];

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
          issues.map((issue) => ({
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
        message: "Enter issues to close (separated by comma)",
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
    ])
    .then(async (answers) => await callback(answers))
    .catch((err) => {
      console.log(err);
    });
})();
