const Handlebars = require('handlebars');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
Handlebars.registerHelper('toJSON', function(object){
	return new Handlebars.SafeString(JSON.stringify(object));
});

const source = `
<html>
<head>
    <script type="text/javascript" src="./static/vis.min.js"></script>
    <link   type="text/css"        href="./static/vis.min.css" rel="stylesheet"/>

    <style type="text/css">
        #mynetwork {
            border: 1px solid lightgray;
        }
    </style>
</head>
<body>
<div id="mynetwork"></div>

<script type="text/javascript">
    // create an array with nodes
    var nodes = {{toJSON nodes}};

    // create an array with edges
    var edges = {{toJSON edges}};

    // create a network
    var container = document.getElementById('mynetwork');

    // provide the data in the vis format
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {};

    // initialize your network!
    var network = new vis.Network(container, data, options);
</script>
</body>
</html>
`;



const generate = (individuals, opts) => {
  let nodes = [];
  let edges = [];
  individuals.forEach(i => {
    let obj = {id: i.name, label: i.name, shape: 'box'};
    if(i.className === 'Athlete'){
      obj.shape = 'image';
      obj.image = './static/tshirt.jpg';
    }
    if(i.className === 'Person'){
      obj.shape = 'image';
      obj.image = './static/person.svg';
    }
    nodes.push(obj);

    if(i.rels){
      i.rels.forEach(rel => {
        if(rel.name === 'borrowedFrom'){
          edges.push({from: rel.subject, to: i.name, title: rel.name, arrows: 'to'});
        } else if (rel.name === 'borrowedTo') {
          edges.push({to: rel.subject, from: i.name, title: rel.name, arrows: 'to'});
        } else if (rel.name === 'reliesOn') {
          edges.push({to: rel.subject, from: i.name, title: rel.name, arrows: 'to', color:'orange'});
        //} else if (rel.name === 'wonAgainst') {
        //  edges.push({to: rel.subject, from: i.name, title: rel.name, arrows: 'to', color: 'green'});
        }
      });
    }
  });

  const data = {
    nodes,
    edges,
    opts
  };
  return Handlebars.compile(source)(data);
};

const generateToFile = (filePath, instances, opts) => {
  return fs.writeFileAsync(filePath, generate(instances), opts);
};

module.exports = {
  generate,
  generateToFile
};
