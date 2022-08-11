#! /usr/bin/env node
import inquirer from "inquirer";
import { execa } from "execa";
import gitChangedFiles from "git-changed-files";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

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
    ])
    .then(async (answers) => {
      const { commitType, scope, title, message, files, push, issues } =
        answers;

      const renderIssues =
        issues.length > 0
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
    })
    .catch((err) => {
      console.log(err);
    });
})();

async function getRepoIssues() {
  const cwd = process.cwd();
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(cwd, "package.json"), "utf8")
  );
  const repo = packageJson.repository.url;

  const repoName = repo.split("/").pop().replace(".git", "");
  const repoOwner = repo.split("/").slice(-2)[0];
  const isGithubRepo = repo.includes("github.com");

  if (!isGithubRepo) {
    return [];
  }

  const res = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/issues`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    }
  )
    .then((res) => res.json())
    .catch((e) => {
      console.error(e);
      return [];
    });

  // Remove pull requests
  const issues = res.filter((issue) => !issue.pull_request);

  return issues;
}
