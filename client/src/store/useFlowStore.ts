import { create } from "zustand";
import {
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from "@xyflow/react";

type FlowState = {
  nodes: Node[];
  edges: Edge[];
  defaultEdgeOptions: object;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  addNode: (node: Node) => void;
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "userQuery",
    position: { x: 50, y: 100 },
    data: { label: "User Query" },
  },
  {
    id: "4",
    type: "knowledgeBase",
    position: { x: 300, y: 100 },
    data: { label: "Knowledge Base", config: { fileName: "test_data.pdf" } },
  },
  {
    id: "2",
    type: "llmEngine",
    position: { x: 550, y: 100 },
    data: { label: "LLM Engine" },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-4",
    source: "1",
    target: "4",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e4-2",
    source: "4",
    target: "2",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  defaultEdgeOptions: { markerEnd: { type: MarkerType.ArrowClosed } },
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(
        { ...connection, markerEnd: { type: MarkerType.ArrowClosed } },
        get().edges
      ),
    });
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  updateNodeData: (id: string, data: Record<string, unknown>) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },
  addNode: (node: Node) => {
    const currentNodes = get().nodes || [];
    set({ nodes: [...currentNodes, node] });
  },
}));
