const Promise = require('bluebird');
const {mongoose,Article} = require('./lib/db');
const extractRelations = require('./lib/extract-relations');
const ontology = require('./lib/ontology');
const moment = require('moment');

const ontPrefix = "http://www.semanticweb.org/andrefs/ontologies/diexporto";

mongoose.connect('mongodb://localhost/aie_develop');
const ontologyFile = 'diexporto-'+(moment().format('YYYYMMDD_HHmmss'))+'.owl';
const graphFile    = 'diexporto-'+(moment().format('YYYYMMDD_HHmmss'))+'.dot';

extractRelations()
  .then(individuals => {
    if(!individuals.length){
      mongoose.disconnect();
      process.exit(0);
    }
    return ontology.generateToFile(ontologyFile, individuals, {prefix: ontPrefix});
  })
  .then(() => mongoose.disconnect());


