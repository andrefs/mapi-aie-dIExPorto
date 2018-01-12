
const mongoose = require('mongoose');
const Promise  = require('bluebird');
mongoose.Promise = global.Promise;

var Cat = mongoose.model('Cat', { name: String });

const Article = mongoose.model('Article', {
  origId: {
    type: String,
    unique: true
  },
  source: String,
  url: {
    type: String,
    unique: true
  },
  pubDate: Date,
  title: String,
  crawl: {
    firstDate: Date,
    lastDate: Date
  },
  fetch: {
    firstDate: Date,
    body: String,
    author: String
  },
  nlp: {
    freeling: Object,
    //entities
  }
});



module.exports = {
  mongoose,
  Article
};

