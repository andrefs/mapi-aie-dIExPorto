
const mongoose = require('mongoose');
const Promise  = require('bluebird');
mongoose.Promise = global.Promise;

var Cat = mongoose.model('Cat', { name: String });

const Article = mongoose.model('Article', {
  source: String,
  url: {
    type: String,
    unique: true
  },
  pubDate: Date,
  title: String
});



module.exports = {
  mongoose,
  Article
};

