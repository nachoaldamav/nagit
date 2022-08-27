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
      return null;
    });

  return (
    JSON.parse(issues as string).map((issue: any) => ({
      name: issue.title,
      value: "#" + issue.number,
    })) || null
  );
}
