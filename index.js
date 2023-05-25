import chalk from "chalk";

const cTable = require("console.table");
const packageJsonFile = Bun.file("package.json");
const packageJson = await packageJsonFile.json();

const mergedDependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

async function latestVersion(packageName) {
  const packageReq = await fetch(
    `https://registry.npmjs.org/${packageName}/latest`
  );

  const packageBody = await packageReq.json();

  return packageBody.version;
}

const dependenciesToUpdate = [];

Object.keys(mergedDependencies).map(async (dependency) => {
  const current = mergedDependencies[dependency].startsWith("^")
    ? mergedDependencies[dependency].substring(1)
    : mergedDependencies[dependency];
  const latest = await latestVersion(dependency);

  if (current === "latest") {
    return;
  }

  let versionString = latest;

  const firstDigit = current.split(".")[0];
  const latestFirstDigit = latest.split(".")[0];

  const secondDigit = current.split(".")[1];
  const latestSecondDigit = latest.split(".")[1];

  const thirdDigit = current.split(".")[2];
  const latestThirdDigit = latest.split(".")[2];

  if (thirdDigit !== latestThirdDigit) {
    versionString = `${latestFirstDigit}.${latestSecondDigit}.${chalk.green(
      latestThirdDigit
    )}`;
  }

  if (firstDigit !== latestFirstDigit) {
    versionString = `${chalk.red(
      latestFirstDigit
    )}.${latestSecondDigit}.${latestThirdDigit}`;
  }

  if (secondDigit !== latestSecondDigit) {
    versionString = `${latestFirstDigit}.${chalk.yellow(
      latestSecondDigit
    )}.${latestThirdDigit}`;
  }

  if (current !== latest) {
    dependenciesToUpdate.push({
      dependency: packageJson.devDependencies[dependency]
        ? `${dependency} ${chalk.gray("(dev)")}`
        : dependency,
      current,
      latest: versionString,
    });
  }

  if (
    Object.keys(mergedDependencies).indexOf(dependency) ===
    Object.keys(mergedDependencies).length - 1
  ) {
    console.table(dependenciesToUpdate);
  }
});
