# nagit
Simple Git (Github) CLI made in Node.js

## Quickstart

The CLI is self-documented, just follow the steps to perform a commit.

```bash
npm install -g nagit
nagit commit
```

## Usage as project-scope dependency

You should add the dependency to your package.json (>0.0.20) and execute `npx nagit`.

## Requirements

- The repository should be in Github and the URL should appear in the `package.json`.
- For releases you should install GH Cli and configure it.
- Issue selector doesn't work for private repos, there is an option to add the numbers instead.
- To release the package in Github (or NPM) you may need to create a Github Action, as in this repository.
