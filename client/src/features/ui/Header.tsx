import { FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title?: string;
  rightAction?: React.ReactNode;
}

export function Header({ title, rightAction }: HeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30 shrink-0">
      {/* Left: Branding & Title */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/")}
        >
          <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center shadow-sm shadow-green-500/20">
            <span className="text-white font-bold text-[10px] leading-none mb-0.5">
              ai
            </span>
          </div>
          <h1 className="font-bold text-slate-900 text-sm tracking-tight text-[#0f172a]">
            GenAI Stack
          </h1>
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* Stack Name Display */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-slate-50 border border-slate-100">
          <span className="text-xs text-slate-600 font-medium">
            {title || "Untitled Workflow"}
          </span>
          <FolderOpen size={12} className="text-slate-400" />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {rightAction}

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <button className="w-7 h-7 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-[10px] font-bold text-purple-700">
          S
        </button>
      </div>
    </header>
  );
}
