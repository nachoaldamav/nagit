#! /usr/bin/env node
import inquirer from "inquirer";
import gitChangedFiles from "git-changed-files";
import { getRepoIssues } from "../functions/getIssues.js";
import { callback } from "../functions/promptCallback.js";
import gitUntracked from "git-untracked";
import path from "path";
import { listGHIssues } from "../functions/listGHIssues.js";
const cwd = process.cwd().length;

(async () => {
  let committedGitFiles = await gitChangedFiles().catch((e) => {
    console.error(e);
    return [];
  });

  const cliIssues = await listGHIssues();

  let untrackedGitFiles;

  gitUntracked(".", (err, files) => {
    if (err) {
      console.error(err);
      return [];
    }

    untrackedGitFiles = files.map((file) =>
      path.resolve(file).slice(cwd).replace(/\\/g, "/").slice(1)
    );
  });

  const issues = await getRepoIssues();

  const files =
    [...committedGitFiles.unCommittedFiles, ...untrackedGitFiles] || [];

  return inquirer
    .prompt([
      {
        type: "checkbox",
        name: "files",
        message: "Select files to commit",
        choices: files ? files : [],
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
