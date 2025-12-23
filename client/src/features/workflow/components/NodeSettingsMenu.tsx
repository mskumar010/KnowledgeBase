import { useState, useRef, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { Settings, Trash2, Unplug } from "lucide-react";

interface NodeSettingsMenuProps {
  nodeId: string;
}

export function NodeSettingsMenu({ nodeId }: NodeSettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { deleteElements, getEdges } = useReactFlow();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDisconnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    const edges = getEdges();
    const connectedEdges = edges.filter(
      (edge) => edge.source === nodeId || edge.target === nodeId
    );
    deleteElements({ edges: connectedEdges });
    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id: nodeId }] });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
      >
        <Settings size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden text-left">
          <button
            onClick={handleDisconnect}
            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Unplug size={13} className="text-amber-500" />
            Disconnect
          </button>
          <div className="h-px bg-slate-100" />
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 size={13} className="text-red-500" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
