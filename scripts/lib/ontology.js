const Handlebars = require('handlebars');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const relations = {
  header:'  <!--\n  ///////////////////////////////////////////////////////////////////////////////////////\n  //\n  // Relations\n  //\n  ///////////////////////////////////////////////////////////////////////////////////////\n  -->\n',
  elems: [{
    name: 'borrowedFrom',
    inverseOf: 'borrowedTo',
    domain: ['Athlete'],
    range:  ['Team'],
  },{
    name: 'borrowedTo',
    inverseOf: 'borrowedFrom',
    domain: ['Athlete'],
    range:  ['Team']
  },{
    name: 'reliesOn',
    inverseOf:'isReliedUponBy',
    domain: ['Team', 'Person'],
    range: ['Team', 'Person']
  },{
    name: 'isReliedUponBy',
    inverseOf:'reliesOn',
    domain: ['Team', 'Person'],
    range: ['Team', 'Person']
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
<rdf:RDF xmlns="{{opts.prefix}}#"
  xml:base="{{opts.prefix}}"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:owl="http://www.w3.org/2002/07/owl#"
  xmlns:xml="http://www.w3.org/XML/1998/namespace"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema#"
  xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">

  <owl:Ontology rdf:about="{{opts.prefix}}">
    <owl:versionIRI rdf:resource="{{opts.prefix}}/0.01"/>
  </owl:Ontology>


{{{relations.header}}}
{{#each relations.elems}}
  <!-- {{opts.prefix}}#{{name}} -->
  <owl:ObjectProperty rdf:about="{{@root/opts.prefix}}#{{name}}">
  {{#if inverseOf}}
    <owl:inverseOf rdf:resource="{{@root/opts.prefix}}#{{inverseOf}}"/>
  {{/if}}
  {{#each domain}}
    <rdfs:domain rdf:resource="{{@root/opts.prefix}}#{{this}}"/>
  {{/each}}
  {{#each range}}
    <rdfs:range rdf:resource="{{@root/opts.prefix}}#{{this}}"/>
  {{/each}}
  </owl:ObjectProperty>

{{/each}}


{{{classes.header}}}
{{#each classes.elems}}
  <!-- {{@root/opts.prefix}}#{{name}} -->
  <owl:Class rdf:about="{{@root/opts.prefix}}#{{name}}">
  {{#if subClassOf}}
    <rdfs:subClassOf rdf:resource="{{@root/opts.prefix}}#{{subClassOf}}"/>
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
  <!-- {{@root/opts.prefix}}#{{name}} -->
  {{#if context.url}}
  <!-- {{{context.url}}} -->
  {{/if}}
  <owl:NamedIndividual rdf:about="{{@root/opts.prefix}}#{{name}}">
    <rdf:type rdf:resource="{{@root/opts.prefix}}#{{className}}"/>
    {{#if rels}}
    {{#each rels}}
    <{{name}} rdf:resource="{{@root/opts.prefix}}#{{subject}}"/>
    {{/each}}
    {{/if}}
  </owl:NamedIndividual>

{{/each}}
</rdf:RDF>
`;



const generate = (individuals, opts) => {
  const data = {
    relations,
    classes,
    individuals,
    opts
  };
  return Handlebars.compile(source)(data);
};

const generateToFile = (filePath, instances, opts) => {
  return fs.writeFileAsync(filePath, generate(instances, opts), {});
};

module.exports = {
  generate,
  generateToFile
};
