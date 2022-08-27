import fs from "fs";
import path from "path";

export function updateVersion(type: string) {
  const cwd = process.cwd();
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(cwd, "package.json"), "utf8")
  );
  const version = packageJson.version;
  const versionArray = version.split(".");

  if (type === "major") {
    versionArray[0] = parseInt(versionArray[0]) + 1;
    versionArray[1] = 0;
    versionArray[2] = 0;
  } else if (type === "minor") {
    versionArray[1] = parseInt(versionArray[1]) + 1;
    versionArray[2] = 0;
  } else if (type === "patch") {
    versionArray[2] = parseInt(versionArray[2]) + 1;
  }

  const newVersion = versionArray.join(".");
  packageJson.version = newVersion;

  fs.writeFileSync(
    path.join(cwd, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  return newVersion;
}
