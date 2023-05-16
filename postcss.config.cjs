module.exports = {
  plugins: {
    "postcss-preset-env": {},
    "postcss-px-to-viewport": {
      viewportWidth: 375,
      unitPrecision: 6,
      propList: ["*", "!font*"],
      selectorBlackList: ["keep-unit"],
      // exclude: [/node_modules/],
    },
  },
};
