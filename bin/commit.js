#! /usr/bin/env node
import inquirer from "inquirer";
import { execa } from "execa";
import gitChangedFiles from "git-changed-files";

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
        type: "confirm",
        name: "addAll",
        message: "Add all changes?",
        default: false,
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
        type: "confirm",
        name: "push",
        message: "Push to remote?",
        default: false,
      },
    ])
    .then(async (answers) => {
      const { addAll, commitType, scope, title, message, files, push } =
        answers;

      const commessage = `${COMMIT_TYPES[commitType]}${
        scope ? `(${scope}) ` : ""
      }${title}${message ? `\n\n${message}` : ""}`;

      if (files.length > 0) {
        await execa("git", ["add", ...files]);
        await execa("git", ["commit", "-m", commessage], { stdio: "inherit" });
      } else if (addAll) {
        await execa("git", ["add", "."]);
        await execa("git", ["commit", "-m", commessage], { stdio: "inherit" });
      } else {
        await execa("git", ["commit", "-m", commessage], { stdio: "inherit" });
      }

      if (push) {
        await execa("git", ["push"], { stdio: "inherit" });
      }
    })
    .catch((err) => {
      console.log(err);
    });
})();
