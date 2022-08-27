import path from "path";
import proc from "child_process";

export function getUntracked(repoPath: string, cb: (arg0: any) => void) {
  if (typeof repoPath === "function") {
    cb = repoPath;
    repoPath = process.cwd();
  }

  proc.exec(
    "cd " + repoPath + " && git ls-files --others --exclude-standard",
    function (err, result) {
      if (err) return cb(err);

      var absPaths = result
        .trim()
        .split("\n")
        .map(function (p) {
          return path.resolve(repoPath, p);
        });

      return absPaths;
    }
  );
}
