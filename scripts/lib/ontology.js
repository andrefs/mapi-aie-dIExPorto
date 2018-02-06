const Handlebars = require('handlebars');
const ontPrefix = "http://www.semanticweb.org/andrefs/ontologies/diexporto";
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const relations = {
  header:'  <!--\n  ///////////////////////////////////////////////////////////////////////////////////////\n  //\n  // Relations\n  //\n  ///////////////////////////////////////////////////////////////////////////////////////\n  -->\n',
  elems: [{
    name: 'borrowedFrom',
    inverseOf: 'borrowedTo',
    domain: 'Athlete',
    range: 'Team',
  },{
    name: 'borrowedTo',
    inverseOf: 'borrowedFrom',
    domain: 'Athlete',
    range: 'Team'
  }],
  footer: ''
};

const classes = {
  header:'  <!--\n  ///////////////////////////////////////////////////////////////////////////////////////\n  //\n  // Classes\n  //\n  ///////////////////////////////////////////////////////////////////////////////////////\n  -->\n',
  elems: [{
    name: 'Athlete',
    subClassOf: 'Person',
  },{
    name: 'Chairman',
    subClassOf: 'Person'
  },{
    name: 'City',
    subClassOf: 'Location',
  },{
    name: 'Competition'
  },{
    name: 'Country',
    subClassOf: 'Location',
  },{
    name: 'Location'
  },{
    name: 'Manager',
    subClassOf: 'Person'
  },{
    name: 'Person',
  },{
    name: 'Referee',
    subClassOf: 'Person',
  },{
    name: 'Sport',
  },{
    name: 'Team',
  }],
  footer: '',
}

// const individuals = [{
//     name: 'Benfica',
//     className: 'Team',
//   },{
//     name: 'Genova',
//     className: 'Team',
//   },{
//     name: 'Pedro_Pereira',
//     className: 'Athlete',
//     rels: {
//       borrowedFrom: 'Benfica',
//       borrowedTo: 'Genova'
//     }
// }]


const source = `<?xml version="1.0"?>
<rdf:RDF xmlns="http://www.semanticweb.org/andrefs/ontologies/diexporto#"
  xml:base="http://www.semanticweb.org/andrefs/ontologies/diexporto"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:owl="http://www.w3.org/2002/07/owl#"
  xmlns:xml="http://www.w3.org/XML/1998/namespace"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema#"
  xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">

  <owl:Ontology rdf:about="http://www.semanticweb.org/andrefs/ontologies/diexporto">
    <owl:versionIRI rdf:resource="http://www.semanticweb.org/andrefs/ontologies/diexporto/0.01"/>
  </owl:Ontology>


{{{relations.header}}}
{{#each relations.elems}}
  <!-- http://www.semanticweb.org/andrefs/ontologies/diexporto#{{name}} -->
  <owl:ObjectProperty rdf:about="http://www.semanticweb.org/andrefs/ontologies/diexporto#{{name}}">
  {{#if inverseOf}}
    <owl:inverseOf rdf:resource="http://www.semanticweb.org/andrefs/ontologies/diexporto#{{inverseOf}}"/>
  {{/if}}
    <rdfs:domain rdf:resource="http://www.semanticweb.org/andrefs/ontologies/diexporto#{{domain}}"/>
    <rdfs:range rdf:resource="http://www.semanticweb.org/andrefs/ontologies/diexporto#{{range}}"/>
  </owl:ObjectProperty>

{{/each}}


{{{classes.header}}}
{{#each classes.elems}}
  <!-- http://www.semanticweb.org/andrefs/ontologies/diexporto#{{name}} -->
  <owl:Class rdf:about="http://www.semanticweb.org/andrefs/ontologies/diexporto#{{name}}">
  {{#if subClassOf}}
    <rdfs:subClassOf rdf:resource="http://www.semanticweb.org/andrefs/ontologies/diexporto#{{subClassOf}}"/>
  {{/if}}
  </owl:Class>

{{/each}}

  <!--
  ///////////////////////////////////////////////////////////////////////////////////////
  //
  // Individuals
  //
  ///////////////////////////////////////////////////////////////////////////////////////
  -->

{{#each individuals}}
  <!-- http://www.semanticweb.org/andrefs/ontologies/diexporto#{{name}} -->
  <owl:NamedIndividual rdf:about="http://www.semanticweb.org/andrefs/ontologies/diexporto#{{name}}">
    <rdf:type rdf:resource="http://www.semanticweb.org/andrefs/ontologies/diexporto#{{className}}"/>
    {{#if rels}}
    {{#each rels}}
    <{{@key}} rdf:resource="http://www.semanticweb.org/andrefs/ontologies/diexporto#{{this}}"/>
    {{/each}}
    {{/if}}
  </owl:NamedIndividual>

{{/each}}
</rdf:RDF>
`;



const generate = individuals => {
  const data = {
    relations,
    classes,
    individuals
  };
  return Handlebars.compile(source)(data);
};

const generateToFile = (filePath, instances) => {
  return fs.writeFileAsync(filePath, generate(instances), {});
};

module.exports = {
  generate,
  generateToFile
};
