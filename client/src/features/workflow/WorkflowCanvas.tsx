import { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useFlowStore } from "@/store/useFlowStore";
import { LLMNode } from "./nodeTypes/LLMNode";
import { KnowledgeBaseNode } from "./nodeTypes/KnowledgeBaseNode";
import { UserQueryNode } from "./nodeTypes/UserQueryNode";
import { OutputNode } from "./nodeTypes/OutputNode";
import { ZoomIn, ZoomOut, Maximize, MousePointer2 } from "lucide-react";

import { WebSearchNode } from "./nodeTypes/WebSearchNode";

const nodeTypes = {
  llmEngine: LLMNode,
  knowledgeBase: KnowledgeBaseNode,
  userQuery: UserQueryNode,
  output: OutputNode,
  webSearch: WebSearchNode,
};

function Flow() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } =
    useFlowStore();
  const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type} node` },
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode]
  );

  return (
    <div className="flex-1 h-full w-full relative" ref={wrapperRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        colorMode="light"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#d1d5db"
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
        />

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
              <MousePointer2 className="text-green-500 w-8 h-8 fill-green-500/20" />
            </div>
            <p className="text-slate-900 font-semibold text-sm">
              Drag & drop to get started
            </p>
          </div>
        )}

        <Panel position="bottom-center" className="mb-6">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => zoomIn({ duration: 300 })}
              className="p-2 hover:bg-slate-50 rounded-md text-slate-500"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => zoomOut({ duration: 300 })}
              className="p-2 hover:bg-slate-50 rounded-md text-slate-500"
            >
              <ZoomOut size={16} />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button
              onClick={() => fitView({ duration: 300 })}
              className="p-2 hover:bg-slate-50 rounded-md text-slate-500"
            >
              <Maximize size={16} />
            </button>
            <div className="px-2 text-xs font-semibold text-slate-600 min-w-[50px] text-center">
              100%
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
