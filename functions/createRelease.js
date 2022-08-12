import { execa } from "execa";
import { updateVersion } from "./updateVersion.js";

export async function createRelease(type) {
  const newVersion = updateVersion(type);

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
