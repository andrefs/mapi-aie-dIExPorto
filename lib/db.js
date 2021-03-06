
const mongoose = require('mongoose');
const Promise  = require('bluebird');
mongoose.Promise = global.Promise;

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
    status: String,
    lastDate: Date
  },
  fetch: {
    firstDate: Date,
    text: String,
    html: String,
    lead: String,
    status: String
  },
  nlp: {
    firstDate: Date,
    status: String,
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
          num      : String,
          nec      : String,
          neclass  : String,
        }]
      }]
    },
  }
});



module.exports = {
  mongoose,
  Article
};

