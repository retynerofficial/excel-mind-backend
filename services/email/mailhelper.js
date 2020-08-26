const fs = require("fs");
const nunjunks = require("nunjucks");
const path = require("path");

const generateMailForSignup = (link, email) => {
  nunjunks.configure({ autoescape: true });
  return nunjunks.renderString(
    fs.readFileSync(path.join(__dirname, "/templates/signup.html")).toString("utf-8"),
    {
      link, email
    }
  );
};

module.exports = { generateMailForSignup };
