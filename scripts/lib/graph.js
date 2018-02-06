const Handlebars = require('handlebars');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
Handlebars.registerHelper('toJSON', function(object){
	return new Handlebars.SafeString(JSON.stringify(object));
});

const source = `
<html>
<head>
    <script type="text/javascript" src="./vis.min.js"></script>
    <link   type="text/css"        href="./vis.min.css" rel="stylesheet"/>

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
  let _nodes = {};
  let _edges = {};
  individuals.forEach(i => {
    _nodes[i.name] = i;
    if(i.rels){
      _edges[i.name] = _edges[i.name] || {};
      _edges[i.name].borrowedFrom = i.rels.borrowedFrom;
      _edges[i.name].borrowedTo = i.rels.borrowedTo;
    }
  });

  const nodes = Object.values(_nodes).map(individual => {
    let node = {id: individual.name, label: individual.name};
    if(individual.className === 'Athlete'){
      node.image = './tshirt.jpg';
      node.shape = 'image';
    }
    return node;
  });
  let edges = [];
  Object.keys(_edges).forEach(player => {
    edges.push({from: player, to: _edges[player].borrowedFrom});
    edges.push({from: player, to: _edges[player].borrowedTo});
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
