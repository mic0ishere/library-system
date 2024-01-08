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

  return {
    ...nextConfig,
    env: {
      ...nextConfig.env,
      ...publicConfigYaml,
    },
  };
};
