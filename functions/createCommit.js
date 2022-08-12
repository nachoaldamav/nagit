import { execa } from "execa";

export async function createCommit(message) {
  await execa("git", ["commit", "-m", message], { stdio: "inherit" });
}
