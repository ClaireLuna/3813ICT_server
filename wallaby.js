export default function (wallaby) {
  return {
    files: ["src/**/*.ts", "./cert.key", "./cert.pem", "test/testConstants.ts"],
    tests: ["test/**/*.test.ts"],
    testFramework: "mocha",
    env: {
      type: "node",
    },
    compilers: {
      "**/*.ts": wallaby.compilers.typeScript({
        module: "commonjs",
      }),
    },
    automaticTestFileSelection: false,
    delay: 500,
  };
}
