const { defineConfig } = require("cypress");
const webpackPreprocessor = require("@cypress/webpack-preprocessor");

module.exports = defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
  e2e: {
    setupNodeEvents(on, config) {
      // Use Webpack preprocessor for JSX/React
      on("file:preprocessor", webpackPreprocessor());
      return config;
    },
  },
});