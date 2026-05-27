module.exports = {
  "disconnect/src/apps/client/**/*.{ts,tsx}": [
    () => "cd disconnect/src/apps/client && npx eslint --fix",
  ],
  "disconnect/src/apps/client/**/*.{js,jsx}": [
    () => "cd disconnect/src/apps/client && npx eslint --fix",
  ],
};
