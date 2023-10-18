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

const nodeTypes = {
  custom: CustomNode,
  start: CustomNode,
};

export type MappingNodeData = {
  title: string;
  fields?: {
    [key: string]: string | number | boolean;
  };
};

export type MappingNode = {
  data: MappingNodeData;
} & Node;

type MappingEdge = Edge & {
  source: string;
  target: string;
};

type GraphNode = {
  nodes: MappingNode[];
  edges: MappingEdge[];
};

function App() {
  const transformToReactFlowTree = useCallback(
    (
      json: object,
      currentNode?: Node,
      nodes?: Node[],
      edges?: Edge[]
    ): GraphNode => {
      const n = nodes || [];
      const e = edges || [];

      let current;

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

      console.debug("nodes", n);
      console.debug("edges", e);
      console.debug("current", current);

      // para cada chave do objeto
      for (const key in json) {
        // se o valor da chave for um objeto
        if (typeof json[key] === "object") {
          // criar um nó, e chamar a função recursivamente para o valor da chave

          const newNode = {
            id: key,
            data: {
              title: key,
            },
            type: "custom",
            position: {
              x: current.position.x + 200 * 1,
              y: current.position.y + 100 * 1,
            },
          };

          n.push(newNode);

          // criar uma aresta entre o nó atual e o nó criado
          const newEdge = {
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
            [key]: json[key],
          };
        }
      }

      return { nodes: n, edges: e };
    },
    []
  );

  const tree = useMemo(() => transformToReactFlowTree(data), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(tree.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(tree.edges);

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
      >
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  );
}

export default App;
