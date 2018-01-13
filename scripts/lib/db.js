
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
    text: String,
    lead: String,
    status: String
  },
  nlp: {
    firstDate: Date,
    freeling: {
      sentences: [{
        id: Number,
        tokens: [{
          id       : String,
          begin    : Number,
          end      : Number,
          form     : String,
          lemma    : String,
          tag      : String,
          ctag     : String,
          pos      : String,
          nounType : String,
          mood     : String,
          tense    : String,
          person   : Number,
          num      : String
        }]
      }]
    },
  }
});



module.exports = {
  mongoose,
  Article
};

