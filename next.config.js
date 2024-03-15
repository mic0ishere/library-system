const { parse } = require("yaml");
const fs = require("fs");

module.exports = async (phase, { defaultConfig }) => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["geist"],
    ...defaultConfig,
  };

  const configYaml = fs.existsSync("./config.yaml")
    ? parse(await fs.promises.readFile("./config.yaml", "utf8"))
    : {
        maxRentals: 10,
        defaultRentalTime: 7,
        prolongationTime: 7,
      };

  const publicConfigYaml = Object.fromEntries(
    Object.entries(configYaml).map(([key, value]) => [
      key.startsWith("_")
        ? key.toUpperCase().replace("_", "")
        : "NEXT_PUBLIC_" + key.toUpperCase(),
      value,
    ])
  );

  const langDirs = (await fs.promises.readdir("./locales")).filter(
    (f) => f !== "en"
  );

  return {
    ...nextConfig,
    i18n: {
      locales: ["en", ...langDirs],
      defaultLocale: langDirs.includes(configYaml._defaultLanguage)
        ? configYaml._defaultLanguage
        : "en",
    },
    env: {
      ...nextConfig.env,
      ...publicConfigYaml,
    },
  };
};
