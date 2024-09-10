import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
  verbose: true,
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary", "text", "lcov"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/src/templates/"],
  transform: {},
  collectCoverageFrom: ["src/**"],
  testMatch: ["**/*.spec.ts"],
  moduleFileExtensions: ["ts", "js"],
  moduleNameMapper: {
    "\\.(css|less)$": "identity-obj-proxy",
    "^(.+?)\\.js$": "$1",
  },
  extensionsToTreatAsEsm: [".ts"],
};

export default config;
