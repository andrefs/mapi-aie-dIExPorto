const Promise = require('bluebird');
const {mongoose,Article} = require('./lib/db');
const extractRelations = require('./lib/extract-relations');
const ontology = require('./lib/ontology');

mongoose.connect('mongodb://localhost/aie_develop');
const filePath = 'testXX.owl';

extractRelations()
  .then(individuals => {
    if(!individuals.length){
      mongoose.disconnect();
      process.exit(0);
    }
    return ontology.generateToFile(filePath, individuals);
  })
  .then(() => mongoose.disconnect());


