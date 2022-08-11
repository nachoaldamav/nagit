import fetch from "node-fetch";
import fs from "fs";
import path from "path";

export async function getRepoIssues() {
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
