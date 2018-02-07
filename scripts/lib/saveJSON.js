const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const saveJSON = (filePath, individuals, opts) => {
  return fs.writeFileAsync(filePath, JSON.stringify(individuals, null, 2));
};

module.exports = saveJSON;
