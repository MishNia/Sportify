module.exports = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"], // Ensure setup file exists
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy", // ✅ Mock CSS imports
      },
  };