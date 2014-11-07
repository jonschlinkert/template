
module.exports = function (filepath) {
  return {
    "npm-load.js": {
      "path": "fixtures/loaders/npm-load.js",
      "content": "---\nauthor: Brian Woodward\n---\nThis is content from js. Author: {{author}}"
    }
  };
}