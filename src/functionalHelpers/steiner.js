// filter edgeset so that all edges begin and end in nodeset
function filterEdgesByNodes(nodeSet, allEdges) {
    // console.log(nodeSet)
    // console.log(typeof(allEdges))
    return allEdges.filter(item => nodeSet.includes(item.source) && nodeSet.includes(item.target));
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


function findPotentials(All, terminals) {
    const potentials = All.filter(node => !terminals.includes(node));
    return potentials;
}

function generateSubsets(nodes) {
    const subsets = [];
  
    const generate = (currentSubset, startIndex) => {
      subsets.push([...currentSubset]);
  
      for (let i = startIndex; i < nodes.length; i++) {
        currentSubset.push(nodes[i]);
        generate(currentSubset, i + 1);
        currentSubset.pop();
      }
    };
  
    generate([], 0);
  
    return subsets;
  }


// console.log(generateSubsets([1,2,3,4,5,6]));



export function findSteinerTree(All, terminals, edges) {
    // Step 1: Find potentials (All - terminals)
    const potentials = findPotentials(All, terminals);
  
    // Step 2: Generate subsets of potentials
    const subsetsOfPotentials = generateSubsets(potentials);
  
    // Step 3: Create a list of lists with each list being a union of terminals and a subset of potentials
    const  allPotentialSubGraphs= subsetsOfPotentials.map(subset => [...terminals, ...subset]);
    

    // Step 4a: set up minimization
    let minimumGraph = allPotentialSubGraphs[0]; // this is the set of nodes with the steiner tree
    let edgeSubSet = filterEdgesByNodes(allPotentialSubGraphs[0], edges) // this is the edges in the current subset of nodes
    let mstEdges = findMinimumSpanningTree(allPotentialSubGraphs[0], edgeSubSet); // this will be the steiner tree edges
    let sumOfMSTEdges = 10000000; // really big value // this will the sum of steiner tree
    if (mstEdges != -1){
        sumOfMSTEdges = mstEdges.reduce((sum, item) => sum + parseInt(item.label), 0);
    }
    // console.log('minValue',minValue);
    // console.log('minVGraph',minimumGraph);
    // console.log('minES',minimumEdgeSubSet);

    // Step 4: iterate through every potential subgraph and find the MST
    for (let index = 1; index < allPotentialSubGraphs.length; index++) {
        // Step 5: find the corresponding edges
        edgeSubSet = filterEdgesByNodes(allPotentialSubGraphs[index], edges);

        // Step 6: Find the MST of the subgraph
        let currMST = findMinimumSpanningTree(allPotentialSubGraphs[index], edgeSubSet);
        
        // Step 7: Check if MST is valid and less than current "MST"
        if(currMST != -1){
            let currSum = currMST.reduce((sum, item) => sum + parseInt(item.label), 0);;
            if(currSum<sumOfMSTEdges){
                minimumGraph = allPotentialSubGraphs[index];
                mstEdges = currMST;
                sumOfMSTEdges = currSum
            }
        }
    }

    if (sumOfMSTEdges == -1){
        return -1
    }
    else{
        return [minimumGraph, mstEdges, sumOfMSTEdges];
    }
   
  }



  
// // Example usage
// const nodes = ['1', '2', '3', '4', '5'];
// const edges = [
//   { source: '1', target: '2', label: '1' },
//   { source: '1', target: '3', label: '2' },
//   { source: '2', target: '3', label: '3' },
//   { source: '2', target: '4', label: '1' },
//   { source: '3', target: '4', label: '2' },
//   { source: '4', target: '5', label: '3' },
// ];

// console.log(findSteinerTree(nodes, [1,2], edges))