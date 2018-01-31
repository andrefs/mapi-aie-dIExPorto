const Promise = require('bluebird');
const {mongoose,Article} = require('./lib/db');
const sources = require('./lib/sources');
const spawn = require('child_process').spawn;
const writeFile = Promise.promisify(require('fs').writeFile);

mongoose.connect('mongodb://localhost/aie_develop');


const getAnalyzedArticles = () => {
  console.log('Querying for articles to extract entities from');
  const query = {
    'fetch.status':'success',
    'fetch.text':{$exists:true},
    'nlp.freeling':{$exists:true}
  };
  return Article.find(query).limit(1000).exec();
}



getAnalyzedArticles()
  .then(articles => {
    let allTokens = {
      person: [],
      location: [],
      organization: [],
      other: []
    };
    articles.forEach(a => {
      const tokens = getEntityTokensFromArticle(a);
      allTokens.person.push(...tokens.person);
      allTokens.location.push(...tokens.location);
      allTokens.organization.push(...tokens.organization);
      allTokens.other.push(...tokens.other);
    });
    return saveAll(allTokens);
  })
  .then(() => mongoose.disconnect());




const getEntityTokensFromArticle = article => {
  let tokens = {
    person: [],
    location: [],
    organization: [],
    other: []
  };
  article.nlp.freeling.sentences.forEach(s => {
    s.tokens.forEach(t => {
      if(t.tag.match(/^NP..SP./)){ tokens.person.push(t);       }
      if(t.tag.match(/^NP..G../)){ tokens.location.push(t);     }
      if(t.tag.match(/^NP..O../)){ tokens.organization.push(t); }
      if(t.tag.match(/^NP..V../)){ tokens.other.push(t);        }
    });
  });
  return tokens;
}

const saveAll = tokens => {
  Promise.all([
      saveEntitiesToFile('results/persons.txt', tokens.person),
      saveEntitiesToFile('results/locations.txt', tokens.location),
      saveEntitiesToFile('results/organizations.txt', tokens.organization),
      saveEntitiesToFile('results/other.txt', tokens.other)
    ])
    .then(() => console.log('done'));
}



const saveEntitiesToFile = (file, tokens) => {
  const entities = getEntitiesFromTokens(tokens);
  return writeFile(file, entities.join('\n'));
}



const getEntitiesFromTokens = tokens => {
  const entities = {};
  tokens.forEach(t => {
    const e = t.form.replace(/_/g,' ');
    entities[e] = true;
  });
  return Object.keys(entities).sort();
}


