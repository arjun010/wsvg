var selectedList=[];

function listContainsEntryFor(organism){
  for(var i = 0 ; i<selectedList.length;i++){
    if(selectedList[i]==organism){
      return 1;
    }
  }
  return 0;
}

function getDistances(organism){
  if(organism=="Salt Water Crocodile"){
    return "Harbor Seal, 0.59155063\nHumans, 0.61982245\nZebra Fish, 0.62179177\nGiant Trevally, 0.62125612";
  }
}

if (!d3) { throw "d3 wasn't included!"};
(function() {
  d3.phylogram = {}
  d3.phylogram.rightAngleDiagonal = function() {
    var projection = function(d) { return [d.y, d.x]; }
    
    var path = function(pathData) {
      return "M" + pathData[0] + ' ' + pathData[1] + " " + pathData[2];
    }
    
    function diagonal(diagonalPath, i) {
      var source = diagonalPath.source,
          target = diagonalPath.target,
          midpointX = (source.x + target.x) / 2,
          midpointY = (source.y + target.y) / 2,
          pathData = [source, {x: target.x, y: source.y}, target];
      pathData = pathData.map(projection);
      return path(pathData)
    }
    
    diagonal.projection = function(x) {
      if (!arguments.length) return projection;
      projection = x;
      return diagonal;
    };
    
    diagonal.path = function(x) {
      if (!arguments.length) return path;
      path = x;
      return diagonal;
    };
    
    return diagonal;
  }
  d3.phylogram.styleTreeNodes = function(vis) {
    vis.selectAll('g.leaf.node')
      .append("svg:circle")
        .attr("r", 4.5)
        .attr('stroke',  'black')
        .attr('fill',function(d){
          //console.log(d.name.replace(/ /g,'').toLowerCase());
          return colorMap[d.name.replace(/ /g,'').toLowerCase()];
        })
        .attr('stroke-width', '1px');
    
    /*vis.selectAll('g.root.node')
      .append('svg:circle')
        .attr("r", 4.5)
        .attr('fill', 'steelblue')
        .attr('stroke', '#369')
        .attr('stroke-width', '2px');*/
  }
  
  function scaleBranchLengths(nodes, w) {
    // Visit all nodes and adjust y pos width distance metric
    var visitPreOrder = function(root, callback) {
      callback(root)
      if (root.children) {
        for (var i = root.children.length - 1; i >= 0; i--){
          visitPreOrder(root.children[i], callback)
        };
      }
    }
    visitPreOrder(nodes[0], function(node) {
      node.rootDist = (node.parent ? node.parent.rootDist : 0) + (node.length || 0)
    })
    var rootDists = nodes.map(function(n) { return n.rootDist; });
    var yscale = d3.scale.linear()
      .domain([0, d3.max(rootDists)])
      .range([0, w]);
    visitPreOrder(nodes[0], function(node) {
      node.y = yscale(node.rootDist)
    })
    return yscale
  }
  
  
  d3.phylogram.build = function(selector, nodes, options) {
    d3.select("#phyloContainer").remove();
    options = options || {}
    var w = options.width || d3.select(selector).style('width') || d3.select(selector).attr('width'),
        h = options.height || d3.select(selector).style('height') || d3.select(selector).attr('height'),
        w = parseInt(w)-200,
        h = parseInt(h);
        
    var tree = options.tree || d3.layout.cluster()
      .size([h, w])
      .sort(function(node) { return node.children ? node.children.length : -1; })
      .children(options.children || function(node) {
        return node.branchset
      });
    var diagonal = options.diagonal || d3.phylogram.rightAngleDiagonal();
    var vis = options.vis || d3.select(selector).append("svg:svg")
        .attr("id","phyloContainer")
        .attr("width", w + 300)
        .attr("height", h + 30)
      .append("svg:g")
        .attr("transform", "translate(20, 20)");
    var nodes = tree(nodes);
    
    if (options.skipBranchLengthScaling) {
      var yscale = d3.scale.linear()
        .domain([0, w])
        .range([0, w]);
    } else {
      var yscale = scaleBranchLengths(nodes, w)
    }
    
 
    var link = vis.selectAll("path.link")
        .data(tree.links(nodes))
      .enter().append("svg:path")
        .attr("class", "link")
        .attr("d", diagonal)
        .attr("fill", "none")
        .attr("stroke", "#aaa")
        .attr("stroke-width", "2px");
        
    var node = vis.selectAll("g.node")
        .data(nodes)
      .enter().append("svg:g")
        .attr("class", function(n) {
          if (n.children) {
            if (n.depth == 0) {
              return "root node"
            } else {
              return "inner node"
            }
          } else {
            return "leaf node"
          }
        })
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

    d3.phylogram.styleTreeNodes(vis)
    
    if (!options.skipLabels) {
      vis.selectAll('g.inner.node')
        .append("svg:text")
          .attr("dx", -20)
          .attr("dy", -9)
          .attr("text-anchor", 'end')
          .attr('font-size', '12px')
          .attr('fill', '#000000')
          .text(function(d) { 
            if(d.length>0.00351495){
            return d.length;
          }
             });

      vis.selectAll('g.leaf.node')
        .append("svg:text")
        .attr("dx", 8)
        .attr("dy", 3)
        .attr("text-anchor", "start")
        .attr('font-family', 'Helvetica Neue, Helvetica, sans-serif')
        .attr('font-size', '15px')
        .attr('fill', 'black')
        .attr('style', function(d){
          if(listContainsEntryFor(d.name)==1){
          //colorMap[d.name.replace(/ /g,'').toLowerCase()]
            return "font-weight:bold; fill:"+colorMap[d.name.replace(/ /g,'').toLowerCase()]+";"

          }
        })
        .style("opacity", function(d) {
          if(listContainsEntryFor(d.name)!=1){
            return 0.3;
          }else{
            return 1;
          } 
        })
        .text(function(d) { return d.name;});

        vis.selectAll('g.leaf.node')
          .append("svg:text")
        .attr("dx", -6)
        .attr("dy", -6)
        .attr("text-anchor", 'end')
          .attr('font-size', '12px')
          .attr('fill', '#000000')
        .text(function(d) { return d.length; });
     
        vis.selectAll("g.leaf.node")
          .append("title")
         .text(function(d){return getDistances(d.name)});

         /*
         var tempArr=[];
         var org1="Salt Water Crocodile",org2="Harbor Seal";
         var sum=0;
         for (var i=0;i<nodes.length;i++){
          if(nodes[i]['name']!=""){
          console.log(nodes[i]['name']);
          }console.log(nodes[i]['length']);
         }
         
         for (var i=0;i<nodes.length;i++){
          if(nodes[i]['name']!=""){
            if(nodes[i]['name']==org1){
              console.log('1')
              for(var j=i;j<nodes.length;j++){
                console.log('2')
                if(nodes[j]['name']==org2){
                 break;
                }
                sum+=nodes[j]['length'];
              }
              break;
            }if(nodes[i]['name']==org2){
              console.log('1')
              for(var j=i;j<nodes.length;j++){
                console.log('2')
                if(nodes[j]['name']==org1){
                  break;
                }
                console.log("adding "+nodes[j]['length']);
                sum+=nodes[j]['length'];
              }
              break;
            }
          }
         }
         console.log(sum);*/

    /*    vis.selectAll('g.leaf.node')
        .append("svg:image")
      .attr("xlink:href","icons/whaleshark.jpg")
      .attr("x", -8)
      .attr("y", -8)
      .attr("width", 16)
      .attr("height", 16);*/

    }
    return {tree: tree, vis: vis}
  }
}());