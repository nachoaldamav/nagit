import { execa } from "execa";

export async function createCommit(message: string) {
  await execa("git", ["commit", "-m", message], { stdio: "inherit" });
}
