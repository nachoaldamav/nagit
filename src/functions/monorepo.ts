import pkg from "glob";
const { glob } = pkg;
import fs from "fs";
import path from "path";

export function isMono() {
  const packageFiles = glob.sync("**/package.json", {
    ignore: ["node_modules/**", "**/node_modules/**", "package.json"],
  });
  const isMono = packageFiles.length > 1;

  return {
    isMono,
    files: packageFiles,
  };
}

export async function updatePackage(file: string, type: string) {
  const cwd = process.cwd();
  let packageJson = JSON.parse(fs.readFileSync(path.join(cwd, file), "utf8"));
  const { version } = packageJson;
  const [major, minor, patch] = version.split(".");
  if (type === "major") {
    packageJson.version = `${parseInt(major) + 1}.0.0`;
  } else if (type === "minor") {
    packageJson.version = `${major}.${parseInt(minor) + 1}.0`;
  } else if (type === "patch") {
    packageJson.version = `${major}.${minor}.${parseInt(patch) + 1}`;
  }
  fs.writeFileSync(file, JSON.stringify(packageJson, null, 2));
}
