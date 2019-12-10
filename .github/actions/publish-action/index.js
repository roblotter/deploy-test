const core = require("@actions/core");
const fs = require("fs");

// const { GitHub, context } = require("@actions/github");
const { context } = require("@actions/github");

// most @actions toolkit packages have async methods
async function run() {
  try {
    // const github = new GitHub(process.env.GITHUB_TOKEN);

    core.debug(`context: (${JSON.stringify(context)})`);
    const { sha, payload } = context;

    const commit = payload.commits.filter(commit => commit.id === sha)[0];

    if (commit && commit.message) {
      const message = commit.message.toLowerCase();
      let cmd;
      if (message.includes("canary")) {
        cmd = "npm run canaryrelease";
      } else if (message.includes("patch")) {
        cmd = "npm run release:patch";
      } else if (message.includes("minor")) {
        cmd = "npm run release:minor";
      } else if (message.includes("major")) {
        cmd = "npm run release:major";
      }

      const nameToGreet = core.getInput("a-var");
      console.log(`Hello ${nameToGreet}!`);
      core.info(`Hello ${nameToGreet}!`);

      if (message.includes("release version")) {
        if (!cmd) {
          const err = `ambigous release commit message: should have the format "release version <canary|patch|minor|major>"`;
          core.info(err);
          core.setFailed(err);
          return;
        } else {
          core.exportVariable("PUBLISH_PACKAGE_CMD", cmd);
          core.info("SET ENV VAR PUBLISH_PACKAGE_CMD = " + cmd);
        }
        const PRIVATE_REGISTRY_TOKEN = process.env.PRIVATE_REGISTRY_TOKEN;

        core.info("token", PRIVATE_REGISTRY_TOKEN);
        // core.setSecret(npmToken);
        // core.setSecret(npmToken);
        const contents = `@adaptabletools:registry=https://registry.adaptabletools.com
//registry.adaptabletools.com/:_authToken=${PRIVATE_REGISTRY_TOKEN}`;
        fs.writeFile(
          ".npmrc",

          contents,
          error => {
            if (error) {
              core.setFailed(error.message);
            } else {
              core.info("DONE writing .npmrc");
              core.info(contents);
            }
          }
        );
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
