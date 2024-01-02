import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  StraightEdge,
} from 'reactflow';
import ReactMarkdown from "react-markdown";


import 'reactflow/dist/style.css';
 

import TextUpdaterNode from './customNodes/TextUpdaterNode';
import MultiHandleNode from './customNodes/MultiHandleNode';
import './customNodes/text-updater-node.css';
import { findSteinerTree } from './functionalHelpers/steiner';
import { findMetricMSTApprox } from './functionalHelpers/MSTapprox';

const rfStyle = {
  backgroundColor: '#B8CEFF',
};

const PageComponent = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("./src/Content.md")
      .then((res) => res.text())
      .then((text) => setContent(text));
  }, []);

  return (
    <div className="post">
      <ReactMarkdown children={content} />
    </div>
  );
};

const initialNodes = [
  { id: '1', position: { x: 80, y: 80 }, type: 'multiHandle', data: { label: '1' } },
  // { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
  // { id: '3', position: { x: 100, y: 100 }, type: 'textUpdater', data: { label: '2' } },
  // { id: '1', position: { x: 100, y: 100 }, type: 'multiHandle', data: { label: '100' } },
  // { id: '2', position: { x: 100, y: 100 }, type: 'multiHandle', data: { label: '100' } },
  // { id: '3', position: { x: 100, y: 100 }, type: 'multiHandle', data: { label: '100' } },
  // { id: '4', position: { x: 100, y: 100 }, type: 'multiHandle', data: { label: '100' } },
  // { id: '5', position: { x: 100, y: 100 }, type: 'multiHandle', data: { label: '100' } },
];

const nodeTypes = { 
  textUpdater: TextUpdaterNode,
  multiHandle: MultiHandleNode,
};

const initialEdges = [
  // { id: 'e1-2', source: '1', target: '2', label: '17' },
];
 
export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [nodeID, setNodeID] = useState(2);
  const [edgeID, setEdgeID] = useState(1);
  const [weightBoxValue, setWeightBoxValue] = useState('');
  const [inBoxValue, setInBoxValue] = useState('');
  const [outBoxValue, setOutBoxValue] = useState('');

  const [terminals, setTerminals] = useState('');
 
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
 
  const handleWeightBoxChange = (event) => {
    setWeightBoxValue(event.target.value);
  };
  const handleInBoxChange = (event) => {
    setInBoxValue(event.target.value);
  };
  const handleOutBoxChange = (event) => {
    setOutBoxValue(event.target.value);
  };
  const handleTerminalChange = (event) => {
    setTerminals(event.target.value);
  };

  const addNewNode = () => {
    const newNode = {
      id: nodeID.toString(),
      type: 'multiHandle',
      position: { x: 90+Math.random()*30, y: 90+Math.random()*30 },
      data: { label: nodeID.toString() },
    };
    setNodeID(nodeID+1);
    // Update the nodes state with the new node
    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  const addNewEdge = () => {
    if (!(inBoxValue=='' || outBoxValue == '' || weightBoxValue == '')){
      const newEdge = { id: 'e'+edgeID, source: inBoxValue, target: outBoxValue, label: weightBoxValue, type: 'straight', };
      setEdgeID(edgeID+1);
      setEdges((prevEdges) => [...prevEdges, newEdge]);
    }
    
  };

  const calculateSteinerTree = () => {
    // create list of terminal nodes

    setEdges((prevEdges) =>
      prevEdges.map((edge) => ({
        ...edge,
        style: {stroke: '#B1B2BA'}, // Replace 'defaultValue' with the initial value for the new field
      }))
    );

    const terminalList = terminals.split(',');
    // create formatted list of nodes
    const nodeList = [];
    // Iterate through the list and extract the 'id' values
    for (const item of nodes) {
      nodeList.push(item.id);
    }
    const edgeList = edges.map(({ source, target, label }) => ({ source, target, label }));
    
    const startTime = performance.now();
    const result = findSteinerTree(nodeList, terminalList, edgeList);
    
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;

    console.log(result[1]);

    console.log(`Time taken: ${elapsedTime.toFixed(2)} milliseconds`);
    
    setEdges((prevEdges) =>
      prevEdges.map((edge2) => {
        // Check if the node corresponds to any edge in the list
        const matchingEdge = result[1].find(
          (edge) => ((edge.source === edge2.source && edge.target === edge2.target) || (edge.source ===edge2.target && edge.target === edge2.source))
        );

        // If the node corresponds to an edge in the list, update its style
        if (matchingEdge) {
          return {
            ...edge2,
            style: { stroke: '#FF0072' },
          };
        }

        // If the node doesn't correspond to an edge in the list, leave it unchanged
        return edge2;
      })
    );

  }

  const calculateMSTapprox = () => {

    setEdges((prevEdges) =>
      prevEdges.map((edge) => ({
        ...edge,
        style: {stroke: '#B1B2BA'}, // Replace 'defaultValue' with the initial value for the new field
      }))
    );

    // create list of terminal nodes
    const terminalList = terminals.split(',');
    // create formatted list of nodes
    const nodeList = [];
    // Iterate through the list and extract the 'id' values
    for (const item of nodes) {
      nodeList.push(item.id);
    }
    const edgeList = edges.map(({ source, target, label }) => ({ source, target, label }));
    
    const startTime = performance.now();
    // console.log("start")
    // console.log(nodeList)
    // console.log(terminalList)
    // console.log("end")
    const result = findMetricMSTApprox(nodeList, terminalList, edgeList);
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;

    // console.log(result[0]);

    console.log(`Time taken: ${elapsedTime.toFixed(2)} milliseconds`);

    setEdges((prevEdges) =>
      prevEdges.map((edge2) => {
        // Check if the node corresponds to any edge in the list
        const matchingEdge = result[0].find(
          (edge) => ((edge.source === edge2.source && edge.target === edge2.target) || (edge.source ===edge2.target && edge.target === edge2.source))
        );

        // If the node corresponds to an edge in the list, update its style
        if (matchingEdge) {
          return {
            ...edge2,
            style: { stroke: '#90EE90' },
          };
        }

        // If the node doesn't correspond to an edge in the list, leave it unchanged
        return edge2;
      })
    );

  }
  




  return (
    <>
    <div style={{display: 'flex'}} >
      <div style={{ width: '70vw', height: '100vh' }}>
        <button onClick={()=>{console.log(edges[0])}}>edges?????</button>
        <button onClick={()=>{console.log(nodes)}}>nodes?????</button>
        <button onClick={addNewNode}>Create Node!</button>
        <button onClick={addNewEdge}>Create Edge!</button>
        <input type="text" value={weightBoxValue} onChange={handleWeightBoxChange} placeholder="Enter edge weight" />
        <input type="text" value={inBoxValue} onChange={handleInBoxChange} placeholder="Enter node from" />
        <input type="text" value={outBoxValue} onChange={handleOutBoxChange} placeholder="Enter node to" />
        <div style={{ width: '70vw', height: '94vh' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            // onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            style={rfStyle}
            // snapToGrid={true}
          >
            <Controls />
            
            <MiniMap />
            {/* EACH DOT IS 20 px apart */}
            <Background variant="dots" gap={20} size={1} />
          </ReactFlow>
        </div>
      
      </div>
    
      <div>
      <input type="text" value={terminals} onChange={handleTerminalChange} placeholder="Terminal indices, comma separated" />
      <button onClick={calculateSteinerTree}>Calculate Steiner Tree</button>
      <button onClick={calculateMSTapprox}>Calculate MST APPROX</button>
      </div>

      

    </div>
    <div style={{clear: "left", height: '94vh'}}>
    {/* <PageComponent /> */}
    
    <iframe src='tempPDF.pdf' width='100%' height='600%' />
    </div>
    </>
  );
}