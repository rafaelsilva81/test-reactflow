import { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Edge,
  Node,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";

import "reactflow/dist/base.css";

import CustomNode from "./CustomNode";

import data from "../example.json";
import useAutoLayout from "./useAutoLayout";

const nodeTypes = {
  custom: CustomNode,
  start: () => <div> start </div>,
};

export type MappingNodeData = {
  title: string;
  fields?: {
    [key: string]: {
      value: string | number | boolean;
      type: string;
    };
  };
};

export type MappingNode = Node<MappingNodeData>;

type MappingEdge = Edge;

type GraphNode = {
  nodes: MappingNode[];
  edges: MappingEdge[];
};

function App() {
  const transformToReactFlowTree = useCallback(
    (
      json: object,
      currentNode?: Node,
      nodes?: MappingNode[],
      edges?: MappingEdge[]
    ): GraphNode => {
      const n = nodes || [];
      const e = edges || [];

      let current: MappingNode;

      if (!currentNode) {
        current = {
          id: "start",
          data: {
            title: "start",
            fields: {},
          },
          type: "start",
          position: { x: 0, y: 0 },
        };

        n.push(current);
      } else {
        current = currentNode;
      }

      // console.debug("nodes", n);
      // console.debug("edges", e);
      // console.debug("current", current);

      // para cada chave do objeto
      for (const key in json) {
        // se o valor da chave for um objeto
        if (typeof json[key] === "object") {
          // criar um nó, e chamar a função recursivamente para o valor da chave

          let nodeTitle: string;

          if (!isNaN(Number(key))) {
            nodeTitle = `${current.data.title}[${key}]`;
          } else {
            nodeTitle = key;
          }

          const newNode: MappingNode = {
            id: nodeTitle,
            data: {
              title: nodeTitle,
              fields: {},
            },
            type: "custom",
            position: {
              x: current.position.x + 200 * 1,
              y: current.position.y + 100 * 1,
            },
          };

          n.push(newNode);

          // criar uma aresta entre o nó atual e o nó criado
          const newEdge: MappingEdge = {
            id: `${current.id}-${newNode.id}`,
            source: current.id,
            target: newNode.id,
          };

          e.push(newEdge);

          transformToReactFlowTree(json[key], newNode, n, e);
        } else {
          // adicionar ao campo "data" do nó atual cada um dos campos do objeto
          current.data.fields = {
            ...current.data.fields,
            [key]: {
              value: json[key],
              type: typeof json[key],
            },
          };
        }
      }

      return { nodes: n, edges: e };
    },
    []
  );

  const tree = useMemo(() => transformToReactFlowTree(data), []);

  useAutoLayout({
    direction: "LR",
  });
  const [nodes, setNodes, onNodesChange] = useNodesState(tree.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<MappingEdge>(
    tree.edges
  );

  useEffect(() => {
    console.debug("nodes", nodes);
    console.debug("edges", edges);
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="h-screen w-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        elementsSelectable={false}
        fitView
        minZoom={-Infinity}
      >
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  );
}

export default App;
