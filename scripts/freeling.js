const Promise = require('bluebird');
const {mongoose,Article} = require('./lib/db');
const sources = require('./lib/sources');
const spawn = require('child_process').spawn;

mongoose.connect('mongodb://localhost/aie_develop');


const getFetchedArticles = () => {
  console.log('Querying for articles to analyze');
  const query = {
    'fetch.status':'success',
    'fetch.text':{$exists:true},
    'nlp.status':{$exists:false},
  };
  return Article.find(query).exec();
}

const spawn_freeling = text => {
  const cmd = 'fl_analyze'
  const cmd_args = ['-f','scripts/pt.cfg','--noflush','--nec','--output','json'];

  const fl = spawn(cmd, cmd_args);
  fl.stdin.write(text);
  fl.stdin.end();

  let json = '';

  fl.stdout.on('data', data => {
    json += data.toString('utf8');
  });

  fl.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  return new Promise((resolve, reject)=> {
    fl.on('exit',  (code, signal) => {

      const sentences = parseFreeling(json);
      if(code ===0){
        return resolve(sentences);
      } else{
        return reject(code);
      }
    });
  });
}

const parseFreeling = json => {
  json = json.replace(/\s*}\s*]\s*}\s*]\s*}\s*/g, '}]}]},');
  json = json.replace(/,\s*$/,']');
  json = '[' + json;

  const obj = JSON.parse(json);
  let result = {sentences: []};
  obj.forEach(x => {
    result.sentences.push(...x.sentences);
  });
  return result;
}

const renameTypeProp = fl_result => {
  fl_result.sentences.forEach(s => {
    s.tokens.forEach(t => {
      if(t.type){
        t.nounType = t.type;
        delete t.type;
      }
    });
  });
  return fl_result;
}

getFetchedArticles()
  .then(articles => {
    if(!articles.length){
      console.log('No articles left to analyze');
      return Promise.resolve();
    }
    console.log('Found', articles.length, 'articles');
    return Promise.mapSeries(articles, a => {
      if(!a.fetch.text){
        a.nlp = {
          status: 'fail',
          firstDate: new Date()
        };
        return a.save();
      }

      let text = a.title;
      if(a.fetch.lead){ text += '\n' + a.fetch.lead; }
      text += '\n' + a.fetch.text;

      return spawn_freeling(text)
        .then(fl_result => {
          console.log('Analyzed article "'+a.title+'" ('+a.origId+' from '+a.source+'), saving...');
          a.nlp = a.nlp || {};
          a.nlp.status = 'success';
          a.nlp.firstDate = new Date();
          a.nlp.freeling = renameTypeProp(fl_result);
          return a.save();
        });
    })
  })
  .then(() => mongoose.disconnect());


