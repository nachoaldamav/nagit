import { execa } from "execa";
import { updatePackage } from "./monorepo.js";
import { updateVersion } from "./updateVersion.js";

export async function createRelease(type, monorepo) {
  let newVersion;
  const currentBranch = await execa("git", [
    "rev-parse",
    "--abbrev-ref",
    "HEAD",
  ]).then((res) => res.stdout.trim());

  if (monorepo.length > 0) {
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

  await execa(
    "gh",
    [
      "release",
      "create",
      "v" + newVersion,
      "--generate-notes",
      "--target",
      currentBranch,
    ],
    {
      stdio: "inherit",
    }
  );
}
