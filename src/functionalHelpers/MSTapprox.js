function metricClosureWithPaths(nodes, edges) {
    const distanceMatrix = {};
    const predecessorMatrix = {};
  
    // Initialize the distance matrix with direct edge distances
    edges.forEach(({ source, target, label }) => {
      distanceMatrix[source] = distanceMatrix[source] || {};
      predecessorMatrix[source] = predecessorMatrix[source] || {};
      distanceMatrix[target] = distanceMatrix[target] || {};
      predecessorMatrix[target] = predecessorMatrix[target] || {};
  
      distanceMatrix[source][target] = distanceMatrix[target][source] = Number(label);
      predecessorMatrix[source][target] = source;
      predecessorMatrix[target][source] = target;
    });
  
    // Initialize the matrix with infinite distances and null predecessors
    nodes.forEach((node) => {
      distanceMatrix[node] = distanceMatrix[node] || {};
      predecessorMatrix[node] = predecessorMatrix[node] || {};
  
      nodes.forEach((otherNode) => {
        if (node !== otherNode) {
          if (!distanceMatrix[node][otherNode]) {
            distanceMatrix[node][otherNode] = Infinity;
            predecessorMatrix[node][otherNode] = null;
          }
        }
      });
    });
  
    // Floyd-Warshall algorithm to compute shortest paths
    nodes.forEach((k) => {
      nodes.forEach((i) => {
        nodes.forEach((j) => {
          const throughK = distanceMatrix[i][k] + distanceMatrix[k][j];
  
          if (distanceMatrix[i][j] > throughK) {
            distanceMatrix[i][j] = throughK;
            predecessorMatrix[i][j] = predecessorMatrix[k][j];
          }
        });
      });
    });
  
    return { distanceMatrix, predecessorMatrix };
  }
  
// convert distanceMatrix from Floyd-Warshall to edge list
  function convertToEdges(distanceMatrix, nodes) {
    const edges = [];
  
    // Use a set to keep track of added edges
    const addedEdges = new Set();
  
    for (const i of nodes) {
      for (const j of nodes) {
        if (i !== j && distanceMatrix[i][j] !== Infinity) {
          const edgeKey = `${i}-${j}`;
          
          // Check if the reverse edge is already added
          if (!addedEdges.has(edgeKey) && !addedEdges.has(`${j}-${i}`)) {
            edges.push({ source: i, target: j, label: distanceMatrix[i][j].toString() });
            addedEdges.add(edgeKey);
          }
        }
      }
    }
  
    return edges;
  }
  

  class DisjointSet {
    constructor() {
      this.parent = new Map();
    }
  
    makeSet(node) {
      this.parent.set(node, node);
    }
  
    find(node) {
      if (this.parent.get(node) !== node) {
        this.parent.set(node, this.find(this.parent.get(node))); // Path compression
      }
      return this.parent.get(node);
    }
  
    union(node1, node2) {
      const root1 = this.find(node1);
      const root2 = this.find(node2);
  
      if (root1 !== root2) {
        this.parent.set(root1, root2);
      }
    }
}


  function findMinimumSpanningTree(nodeList, filteredEdges) {
    
    const disjointSet = new DisjointSet();
    const mstEdges = [];

    nodeList.forEach(node => disjointSet.makeSet(node));

    filteredEdges
    .sort((a, b) => a.label - b.label) // Sort edges by weight in ascending order
    .forEach((item) => {
        if (disjointSet.find(item.source) !== disjointSet.find(item.target)) {
        mstEdges.push(item);
        disjointSet.union(item.source, item.target);
        }
    });

    if (mstEdges.length === nodeList.length - 1) {
    return mstEdges;
    } else {
    return -1; // No minimum spanning tree exists
    }
}


function reconstructPath(predecessorMatrix, start, end) {
    const path = [end];
    let current = end;
  
    while (current !== start) {
      const predecessor = predecessorMatrix[start][current];
      if (predecessor === null) {
        // There is no path from start to end
        return [];
      }
      path.unshift(predecessor);
      current = predecessor;
    }
  
    return path;
  }



function findLeafs(edges) {
    const nodesCount = {}; // Object to store the count of each node

    // Iterate through edges and count occurrences of each node
    edges.forEach((edge) => {
    nodesCount[edge.source] = (nodesCount[edge.source] || 0) + 1;
    nodesCount[edge.target] = (nodesCount[edge.target] || 0) + 1;
    });

    // Find nodes that appear only once
return Object.keys(nodesCount).filter((node) => nodesCount[node] === 1);
}


export function findMetricMSTApprox(all, terminals, edges){
    const { distanceMatrix,predecessorMatrix } = metricClosureWithPaths(all,edges);
    const metricGraphEdges = convertToEdges(distanceMatrix, all);
    const metricMSTEdges = findMinimumSpanningTree(all, metricGraphEdges);
    if (metricMSTEdges == -1) {
        return -1 // no mst approx solution
    }
    else{
        const metricConvertedEdges = [];

        for (let curr = 0 ; curr < metricMSTEdges.length; curr++){
            let path = reconstructPath(predecessorMatrix, metricMSTEdges[curr].source, metricMSTEdges[curr].target);
            for (let i = 0; i < path.length - 1; i++) {
                const source = path[i];
                const target = path[i + 1];
    
                // Check for both direct and reverse order of nodes in edges
                const edge = edges.find((e) => (e.source === source && e.target === target) || (e.source === target && e.target === source));
                if (!(edge in metricConvertedEdges)){
                    metricConvertedEdges.push(edge);
                }
                
            }
        }  
        const totalLabelSum = metricConvertedEdges.reduce((sum, edge) => sum + Number(edge.label), 0);

        let reducedSum = totalLabelSum;
        let reducedMetricConvertedEdges = metricConvertedEdges;


        // remove bad nodes
        let currLeaves = findLeafs(reducedMetricConvertedEdges);
        
        
        let areAllElementsContained = currLeaves.every(element => terminals.includes(element));
        
        
        while (!areAllElementsContained){
            let badLeafs = currLeaves.filter(element => !terminals.includes(element));
            const removedBads = reducedMetricConvertedEdges.reduce((acc, edge) => {
                if (badLeafs.includes(edge.source) || badLeafs.includes(edge.target)) {
                  acc.sumRemovedLabels += parseInt(edge.label, 10);
                } else {
                  acc.filteredEdges.push(edge);
                }
                return acc;
              }, { filteredEdges: [], sumRemovedLabels: 0 });

              reducedMetricConvertedEdges = removedBads.filteredEdges;
              reducedSum -= removedBads.sumRemovedLabels;
            
            currLeaves = findLeafs(reducedMetricConvertedEdges);
            areAllElementsContained = currLeaves.every(element => terminals.includes(element));
        }

        return [reducedMetricConvertedEdges, reducedSum];
    }

}



// // Example usage
// const terminals = ['3','5'];
// const nodes = ['1', '2', '3', '4', '5'];
// const edges = [
//   { source: '1', target: '2', label: '1' },
//   { source: '1', target: '3', label: '2' },
//   { source: '2', target: '3', label: '3' },
//   { source: '2', target: '4', label: '1' },
//   { source: '3', target: '4', label: '2' },
//   { source: '4', target: '5', label: '3' },
// ];

// const { distanceMatrix, predecessorMatrix } = metricClosureWithPaths(nodes, edges);

// // Example: Reconstruct path from node '1' to node '5'
// const startNode = '1';
// const endNode = '5';
// const path = reconstructPath(predecessorMatrix, startNode, endNode);

// console.log('Distance Matrix:', distanceMatrix);
// console.log('Predecessor Matrix:', predecessorMatrix);
// console.log(`Shortest Path from ${startNode} to ${endNode}:`, path);

// const results = findMetricMSTApprox(nodes, terminals, edges);
// console.log(results);


const terminals = ['1','3', '4'];
const nodes = ['1', '2', '3', '4'];
const edges = [
  { source: '1', target: '2', label: '1' },
  
  { source: '2', target: '3', label: '2' },
  { source: '1', target: '4', label: '3' },
];

const { distanceMatrix, predecessorMatrix } = metricClosureWithPaths(nodes, edges);

// Example: Reconstruct path from node '1' to node '5'
const startNode = '1';
const endNode = '3';
const path = reconstructPath(predecessorMatrix, startNode, endNode);

console.log('Distance Matrix:', distanceMatrix);
console.log('Predecessor Matrix:', predecessorMatrix);
console.log(`Shortest Path from ${startNode} to ${endNode}:`, path);

const results = findMetricMSTApprox(nodes, terminals, edges);
console.log(results);







