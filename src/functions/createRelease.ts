import { execa } from "execa";
import { updatePackage } from "./monorepo.js";
import { updateVersion } from "./updateVersion.js";
import ora from "ora";
import chalk from "chalk";

export async function createRelease(
  type: string,
  monorepo: string[],
  discussion?: boolean
) {
  let newVersion;
  const currentBranch = await execa("git", [
    "rev-parse",
    "--abbrev-ref",
    "HEAD",
  ])
    .then((res: { stdout: string }) => res.stdout.trim())
    .catch(() => {
      ora(chalk.red("Error when trying to get current branch!")).fail();
      process.exit(1);
    });

  if (monorepo && monorepo.length > 0) {
    for await (const repo of monorepo) {
      await updatePackage(repo, type);
    }
    await execa("git", ["add", ...monorepo]);
    newVersion = updateVersion(type);
    await execa("git", ["add", "package.json"]);
  } else {
    newVersion = updateVersion(type);
    await execa("git", ["add", "package.json"]);
  }

  await execa(
    "git",
    ["commit", "-m", `chore 🔧: bump version to v${newVersion}`],
    {
      stdio: "inherit",
    }
  );

  await execa("git", ["push"], { stdio: "inherit" });

  const args = [
    "release",
    "create",
    "v" + newVersion,
    "--generate-notes",
    "--target",
    currentBranch,
    discussion ? "--discussion-category" : "",
    discussion ? "Releases" : "",
  ].filter((arg) => arg !== "");

  await execa("gh", [...args], {
    stdio: "inherit",
  });
}
