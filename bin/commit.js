#! /usr/bin/env node
import inquirer from "inquirer";
import { execa } from "execa";
import gitChangedFiles from "git-changed-files";
import { getRepoIssues } from "../functions/getIssues.js";
import { updateVersion } from "../functions/updateVersion.js";

const COMMIT_TYPES = {
  feat: "feat ✨: ",
  fix: "fix 🐛: ",
  docs: "docs 📝: ",
  style: "style 💅: ",
  refactor: "refactor 🔨: ",
  perf: "perf 🚀: ",
  test: "test 🚨: ",
  chore: "chore 🔧: ",
};

(async () => {
  let committedGitFiles = await gitChangedFiles().catch((e) => {
    console.error(e);
    return [];
  });

  const issues = await getRepoIssues();

  return inquirer
    .prompt([
      {
        type: "checkbox",
        name: "files",
        message: "Select files to commit",
        choices: committedGitFiles.unCommittedFiles
          ? committedGitFiles.unCommittedFiles
          : [],
        when: () => committedGitFiles?.unCommittedFiles?.length > 0,
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
        choices: issues.map((issue) => ({
          name: issue.title,
          value: "#" + issue.number,
        })),
        when: () => issues.length > 0,
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
    .then(async (answers) => {
      const {
        commitType,
        scope,
        title,
        message,
        files,
        push,
        issues,
        release,
      } = answers;

      const renderIssues =
        issues && issues.length > 0
          ? "\n" + issues.map((issue) => `close ${issue}`).join(" ")
          : "";

      const commessage = `${COMMIT_TYPES[commitType]}${
        scope ? `(${scope}) ` : ""
      }${title}${message ? `\n\n${message}` : ""} ${renderIssues}`;

      if (files.length > 0) {
        await execa("git", ["add", ...files]);
        await execa("git", ["commit", "-m", commessage], { stdio: "inherit" });
      } else {
        await execa("git", ["commit", "-m", commessage], { stdio: "inherit" });
      }

      if (push) {
        await execa("git", ["push"], { stdio: "inherit" });
      }

      if (release) {
        const { releaseType } = answers;
        const newVersion = updateVersion(releaseType);

        await execa("git", ["add", "package.json"]);
        await execa(
          "git",
          ["commit", "-m", `chore 🔧: bump version to v${newVersion}`],
          {
            stdio: "inherit",
          }
        );

        await execa("git", ["push"], { stdio: "inherit" });

        await execa(
          "gh",
          ["release", "create", "v" + newVersion, "--generate-notes"],
          {
            stdio: "inherit",
          }
        );
      }
    })
    .catch((err) => {
      console.log(err);
    });
})();
