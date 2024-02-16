const { parse } = require("yaml");
const fs = require("fs").promises;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["geist"],
};

module.exports = async () => {
  const configYaml = parse(await fs.readFile("./config.yaml", "utf8"));
  const publicConfigYaml = Object.fromEntries(
    Object.entries(configYaml).map(([key, value]) => [
      key.startsWith("_")
        ? key.toUpperCase().replace("_", "")
        : "NEXT_PUBLIC_" + key.toUpperCase(),
      value,
    ])
  );

  const langDirs = (await fs.readdir("./locales")).filter((f) => f !== "en");

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
