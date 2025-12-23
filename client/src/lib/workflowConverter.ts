import { type Node, type Edge } from "@xyflow/react";

export const convertFlowToWorkflow = (nodes: Node[], edges: Edge[]) => {
  // Map React Flow nodes to Backend Nodes
  const backendNodes = nodes.map((node) => ({
    id: node.id,
    type: node.type || "default",
    position: node.position,
    data: {
      label: node.data.label,
      config: (node.data.config as Record<string, unknown>) || node.data,
    },
  }));

  // Map React Flow edges to Backend Edges
  const backendEdges = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
  }));

  return {
    nodes: backendNodes,
    edges: backendEdges,
  };
};
