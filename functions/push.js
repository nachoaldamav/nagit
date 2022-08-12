import { execa } from "execa";

export async function pushCommit() {
  return await execa("git", ["push"], { stdio: "inherit" });
}
