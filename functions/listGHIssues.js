import { execa } from "execa";

export async function listGHIssues() {
  const issues = await execa("gh", [
    "issue",
    "list",
    "--state",
    "open",
    "--json",
    "number,title",
  ])
    .then((result) => result.stdout)
    .catch((error) => {
      console.log(error);
    });

  return JSON.parse(issues).map((issue) => ({
    name: issue.title,
    value: "#" + issue.number,
  }));
}
