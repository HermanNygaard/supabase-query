module.exports = {
  roots: ["<rootDir>"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testMatch: ["**/?(*.)+(test).ts*"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
