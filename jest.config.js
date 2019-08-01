module.exports = {
  transform: { "^.+\\.tsx?$": "ts-jest" },
  testRegex: ".*test.ts$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testResultsProcessor: "./node_modules/jest-junit-reporter",
  testURL: "http://localhost/"
};
