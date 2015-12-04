(function() {
  packages = {

    // Lazily construct the package hierarchy from class names,
    // then recursively computes import counts, where the count
    // of an inner node is the total of its children's external
    // import counts
    root: function(classes) {
      var map = {},
          leaves = [],
          root = null;  

      function find(name, data) {
        var node = map[name], i;
        if (!node) {
          node = map[name] = data || {name: name, children: []};
          if (name.length) {
            node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
            node.parent.children.push(node);
            node.key = name.substring(i + 1);
          }
        }
        return node;
      }

      function aggregateExternalImports(node){
        var children = node.children,
            name = node.name,
            allImports = [],
            imports = [];

        if (children && children.length) {
          // inner node stuff
          children.forEach(function(child) {
            allImports.push.apply(allImports, aggregateExternalImports(child));
          });
          allImports.forEach(function(importName) {
            if (importName.indexOf(name) == -1)
              imports.push(importName);
          });
          node.externalImports = imports;
          return imports;
        } else {
          // leaf node stuff
          allImports = node.imports;
          node.externalImports = allImports;
          return allImports;
        }
      }

      // adds up external dependant + import counts to
      // obtain external link count
      function countExternalLinks(node) {
        var children = node.children,
            links = 0;

        if (children && children.length) {
          // inner node stuff
          children.forEach(function(child) { 
            links += countExternalLinks(child); 
          });
        } else {
          // leaf node stuff
          links = node.externalImports.length + node.externalDepCount;
        }

        node.externalLinkCount = links;
        return links;
      }

      classes.forEach(function(d) {
        var leaf = find(d.name, d);
        leaves.push(leaf);
      });

      root = map.flare;
      aggregateExternalImports(root);

      // initialize external dep count for leaf nodes
      leaves.forEach(function(d) { d.externalDepCount = 0; });

      // add a dependants count to each class (leaf node)
      // based on the external classes that import them
      leaves.forEach(function(d) {
        var exNode;
        d.externalImports.forEach(function(importName) {
          exNode = find(importName);
          exNode.externalDepCount++;
        });
      });
      
      countExternalLinks(root);

      return root;
    },

    // Return a list of imports for the given array of nodes.
    imports: function(nodes) {
      var map = {},
          imports = [];

      // Compute a map from name to node.
      nodes.forEach(function(d) {
        map[d.name] = d;
      });

      // For each import, construct a link from the source to target node.
      nodes.forEach(function(d) {
        if (d.imports) d.imports.forEach(function(i) {
          imports.push({source: map[d.name], target: map[i]});
        });
      });

      return imports;
    }
  };
})();
