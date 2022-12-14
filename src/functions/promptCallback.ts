import { execa } from "execa";
import { COMMIT_TYPES } from "../utils/commitTypes.js";
import { createCommit } from "./createCommit.js";
import { createRelease } from "./createRelease.js";
import { pushCommit } from "./push.js";

export async function callback(answers: ANSWERS) {
  const { commitType, scope, title, message, files, push, issues, release } =
    answers;

  const renderIssues =
    issues && issues.length > 0
      ? "\n" + issues.map((issue) => `close ${issue}`).join(" ")
      : "";

  const renderHandIssues =
    answers.handIssues && answers.handIssues.length > 0
      ? "\n" + answers.handIssues.split(",").map((issue) => `close #${issue}`)
      : "";

  const commessage = `${COMMIT_TYPES[commitType]}${
    scope ? `(${scope}) ` : ""
  }${title}${
    message ? `\n\n${message}` : ""
  } ${renderIssues} ${renderHandIssues} ${
    answers.breakingChange
      ? `\n\nBREAKING CHANGE: ${answers.breakingChange}`
      : ""
  }`;

  if (files.length > 0) {
    await execa("git", ["add", ...files]);
    await createCommit(commessage);
  } else {
    await createCommit(commessage);
  }

  if (push) await pushCommit();

  if (release) {
    await createRelease(answers.releaseType, answers.monorepo);
  }
}

type ANSWERS = {
  commitType:
    | "feat"
    | "fix"
    | "docs"
    | "perf"
    | "refactor"
    | "style"
    | "test"
    | "chore"
    | "types";
  scope: string;
  title: string;
  message: string;
  files: string[];
  push: boolean;
  issues: string[];
  release: boolean;
  releaseType: string;
  monorepo: string[];
  handIssues: string;
  breakingChange: string;
};
