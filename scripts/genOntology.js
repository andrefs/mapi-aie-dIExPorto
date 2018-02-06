const Promise = require('bluebird');
const {mongoose,Article} = require('./lib/db');
const extractRelations = require('./lib/extract-relations');
const ontology = require('./lib/ontology');
const graph    = require('./lib/graph');
const moment = require('moment');

mongoose.connect('mongodb://localhost/aie_develop');

const ontPrefix = "http://www.semanticweb.org/andrefs/ontologies/diexporto";
//const ontologyFile = 'results/diexporto-'+(moment().format('YYYYMMDD_HHmmss'))+'.owl';
//const graphFile    = 'results/diexporto-'+(moment().format('YYYYMMDD_HHmmss'))+'.html';

const ontologyFile = 'results/diexporto.owl';
const graphFile    = 'results/diexporto.html';

extractRelations()
  .then(individuals => {
    if(!individuals.length){
      mongoose.disconnect();
      process.exit(0);
    }
    return Promise.join(
      ontology.generateToFile(ontologyFile, individuals, {prefix: ontPrefix}),
      //graph.generateToFile(graphFile, individuals, {})
    );
  })
  .then(() => mongoose.disconnect());


