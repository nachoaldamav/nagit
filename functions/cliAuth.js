import { execa } from "execa";

export async function cliAuth() {
  await execa("gh", ["auth", "status", "--show-token"])
    .then((result) => {
      if (result.stdout.includes("not logged into")) {
        return false;
      } else {
        return true;
      }
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
}
