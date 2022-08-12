import { execa } from "execa";

export async function cliAuth() {
  return await execa("gh", ["auth", "status", "--show-token"])
    .then((result) => {
      if (result.stdout.includes("not logged into")) {
        console.log(result.stdout);
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
