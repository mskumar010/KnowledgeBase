import { useFlowStore } from "@/store/useFlowStore";

export function ConfigPanel() {
  const { nodes, updateNodeData } = useFlowStore();
  // Find selected node
  const selectedNode = nodes.find((n) => n.selected);

  if (!selectedNode) {
    return (
      <aside className="w-full h-full p-4 flex flex-col items-center justify-center text-slate-400 text-xs text-center">
        <p>Select a node to configure</p>
      </aside>
    );
  }

  const handleChange = (key: string, value: string | number | object) => {
    updateNodeData(selectedNode.id, { [key]: value });
  };

  return (
    <aside className="w-full h-full p-4 flex flex-col overflow-y-auto">
      <div className="border-b border-slate-100 pb-4 mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          {selectedNode.data.label as string}
        </h3>
        <p className="text-xs text-slate-500 font-mono mt-1">
          ID: {selectedNode.id}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Label
          </label>
          <input
            type="text"
            value={(selectedNode.data.label as string) || ""}
            onChange={(e) => handleChange("label", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-sm shadow-sm transition-all"
          />
        </div>

        {selectedNode.type === "llmEngine" && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                System Prompt
              </label>
              <textarea
                rows={6}
                value={(selectedNode.data.system_prompt as string) || ""}
                onChange={(e) => handleChange("system_prompt", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-sm font-mono shadow-sm transition-all"
                placeholder="You are a helpful assistant..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Model
              </label>
              <select
                value={
                  (selectedNode.data.model as string) ||
                  "llama-3.1-70b-versatile"
                }
                onChange={(e) => handleChange("model", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-sm shadow-sm transition-all"
              >
                <option value="llama-3.1-70b-versatile">
                  Groq (Llama 3.1 70B)
                </option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="perplexity-sonar-small-online">
                  Perplexity Sonar Small
                </option>
              </select>
            </div>
          </>
        )}

        {selectedNode.type === "knowledgeBase" && (
          <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-300 hover:bg-slate-50 transition-all cursor-pointer group">
            <p className="text-sm text-slate-600 font-medium mb-1 group-hover:text-blue-600">
              Upload PDF Document
            </p>
            <p className="text-xs text-slate-400 mb-3">Drag & drop or click</p>

            <input
              type="file"
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        )}
      </div>
    </aside>
  );
}
